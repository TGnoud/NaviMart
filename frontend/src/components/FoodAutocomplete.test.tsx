import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FoodAutocomplete from './FoodAutocomplete';
import type { CatalogFood } from '../api';

const searchFoodsMock = vi.fn();

vi.mock('../api', () => ({
  catalogApi: {
    searchFoods: (...args: unknown[]) => searchFoodsMock(...args),
  },
}));

const SAMPLE_FOODS: CatalogFood[] = [
  {
    id: 'f1',
    name: 'Sua tuoi',
    categoryId: 'c1',
    defaultUnit: 'ml',
    aliases: [],
    defaultStorageLocation: 'fridge',
    defaultShelfLifeDays: 5,
    storageTips: 'Dong nap kin.',
    barcode: '8934673001234',
  },
  {
    id: 'f2',
    name: 'Sua chua',
    categoryId: 'c1',
    defaultUnit: 'hop',
    aliases: [],
    defaultStorageLocation: 'fridge',
  },
];

function Wrapper({
  onSelectFood,
  onSubmit,
  categoryId,
}: {
  onSelectFood: (food: CatalogFood) => void;
  onSubmit?: () => void;
  categoryId?: string;
}) {
  const [value, setValue] = useState('');
  return (
    <FoodAutocomplete
      value={value}
      onChange={setValue}
      onSelectFood={onSelectFood}
      onSubmit={onSubmit}
      categoryId={categoryId}
      placeholder="Tim thuc pham..."
      className="input"
    />
  );
}

describe('FoodAutocomplete', () => {
  beforeEach(() => {
    searchFoodsMock.mockReset();
  });

  it('debounces typing, shows suggestions and selects a food', async () => {
    searchFoodsMock.mockResolvedValue(SAMPLE_FOODS);
    const onSelectFood = vi.fn();
    const user = userEvent.setup();

    render(<Wrapper onSelectFood={onSelectFood} />);
    await user.type(screen.getByPlaceholderText('Tim thuc pham...'), 'sua');

    await waitFor(() => expect(searchFoodsMock).toHaveBeenCalled());
    expect(searchFoodsMock).toHaveBeenCalledWith({ q: 'sua', categoryId: undefined, limit: 6 });

    const option = await screen.findByText('Sua tuoi');
    await user.click(option);

    expect(onSelectFood).toHaveBeenCalledWith(SAMPLE_FOODS[0]);
    // input takes the picked food's name
    expect(screen.getByPlaceholderText('Tim thuc pham...')).toHaveValue('Sua tuoi');
    // dropdown closes
    expect(screen.queryByText('Sua chua')).not.toBeInTheDocument();
  });

  it('forwards the selected category when searching', async () => {
    searchFoodsMock.mockResolvedValue([]);
    const user = userEvent.setup();

    render(<Wrapper onSelectFood={vi.fn()} categoryId="c1" />);
    await user.type(screen.getByPlaceholderText('Tim thuc pham...'), 'sua');

    await waitFor(() =>
      expect(searchFoodsMock).toHaveBeenCalledWith({ q: 'sua', categoryId: 'c1', limit: 6 }),
    );
  });

  it('calls onSubmit on Enter for free-text input', async () => {
    searchFoodsMock.mockResolvedValue([]);
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<Wrapper onSelectFood={vi.fn()} onSubmit={onSubmit} />);
    await user.type(screen.getByPlaceholderText('Tim thuc pham...'), 'mon tu do{Enter}');

    expect(onSubmit).toHaveBeenCalled();
  });
});

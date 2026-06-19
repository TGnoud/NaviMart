import { useEffect, useRef, useState } from 'react';
import { catalogApi } from '../api';
import type { CatalogFood } from '../api';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSelectFood: (food: CatalogFood) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
  icon?: string;
  categoryId?: string;
};

// Text input with a dropdown of matching foods from the system catalog.
// Picking a suggestion gives the caller the full food (id, default unit, shelf life, storage tips...).
export default function FoodAutocomplete({
  value,
  onChange,
  onSelectFood,
  onSubmit,
  placeholder,
  className,
  icon,
  categoryId,
}: Props) {
  const [suggestions, setSuggestions] = useState<CatalogFood[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const skipNextSearch = useRef(false);

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    const term = value.trim();
    if (term.length < 1) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const timer = setTimeout(() => {
      catalogApi
        .searchFoods({ q: term, categoryId: categoryId || undefined, limit: 6 })
        .then((foods) => {
          setSuggestions(foods);
          setOpen(foods.length > 0);
          setHighlight(-1);
        })
        .catch(() => undefined);
    }, 250);
    return () => clearTimeout(timer);
  }, [value, categoryId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pick = (food: CatalogFood) => {
    skipNextSearch.current = true;
    onChange(food.name);
    onSelectFood(food);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (open && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlight((h) => (h + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlight((h) => (h <= 0 ? suggestions.length - 1 : h - 1));
        return;
      }
      if (e.key === 'Enter' && highlight >= 0) {
        e.preventDefault();
        pick(suggestions[highlight]);
        return;
      }
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
    }
    if (e.key === 'Enter') {
      setOpen(false);
      onSubmit?.();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {icon && (
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">{icon}</span>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        type="text"
        className={className}
      />
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden">
          {suggestions.map((food, index) => (
            <button
              key={food.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(food)}
              className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-2 transition-colors ${index === highlight ? 'bg-primary-container/40' : 'hover:bg-surface-container-low'}`}
            >
              <span className="font-body-md text-on-surface">{food.name}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">{food.defaultUnit}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

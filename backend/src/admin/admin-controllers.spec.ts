import { AdminCatalogController } from './admin-catalog.controller';
import { AdminRecipesController } from './admin-recipes.controller';
import { AdminStatsController } from './admin-stats.controller';
import { AdminUsersController } from './admin-users.controller';

describe('Admin controllers', () => {
  it('AdminCatalogController delegates category, food and unit operations', async () => {
    const service = {
      findAllCategories: jest.fn().mockReturnValue('categories'),
      createCategory: jest.fn().mockReturnValue('category'),
      updateCategory: jest.fn().mockReturnValue('category-updated'),
      removeCategory: jest.fn().mockReturnValue('category-removed'),
      findAllFoods: jest.fn().mockReturnValue('foods'),
      createFood: jest.fn().mockReturnValue('food'),
      updateFood: jest.fn().mockReturnValue('food-updated'),
      removeFood: jest.fn().mockReturnValue('food-removed'),
      findAllUnits: jest.fn().mockReturnValue('units'),
      createUnit: jest.fn().mockReturnValue('unit'),
      updateUnit: jest.fn().mockReturnValue('unit-updated'),
      removeUnit: jest.fn().mockReturnValue('unit-removed'),
    };
    const controller = new AdminCatalogController(service as never);
    const user = { userId: 'u1', role: 'admin' };

    expect(controller.findAllCategories({ search: 'a' } as never)).toBe(
      'categories',
    );
    expect(controller.createCategory({ name: 'Cat' } as never)).toBe('category');
    expect(controller.updateCategory('c1', { name: 'New' } as never)).toBe(
      'category-updated',
    );
    expect(controller.removeCategory('c1')).toBe('category-removed');
    expect(controller.findAllFoods({ status: 'active' } as never)).toBe('foods');
    expect(controller.createFood(user as never, { name: 'Food' } as never)).toBe(
      'food',
    );
    expect(controller.updateFood('f1', { name: 'Food' } as never)).toBe(
      'food-updated',
    );
    expect(controller.removeFood('f1')).toBe('food-removed');
    expect(controller.findAllUnits({} as never)).toBe('units');
    expect(controller.createUnit({ code: 'kg' } as never)).toBe('unit');
    expect(controller.updateUnit('u1', { name: 'Kg' } as never)).toBe(
      'unit-updated',
    );
    expect(controller.removeUnit('u1')).toBe('unit-removed');

    expect(service.createFood).toHaveBeenCalledWith(user, { name: 'Food' });
    expect(service.updateUnit).toHaveBeenCalledWith('u1', { name: 'Kg' });
  });

  it('AdminUsersController delegates user operations', () => {
    const service = {
      findAll: jest.fn().mockReturnValue('users'),
      findOne: jest.fn().mockReturnValue('user'),
      create: jest.fn().mockReturnValue('created'),
      update: jest.fn().mockReturnValue('updated'),
      remove: jest.fn().mockReturnValue('removed'),
    };
    const controller = new AdminUsersController(service as never);

    expect(controller.findAll({ page: 1 } as never)).toBe('users');
    expect(controller.findOne('u1')).toBe('user');
    expect(controller.create({ email: 'a@example.com' } as never)).toBe(
      'created',
    );
    expect(controller.update('u1', { status: 'inactive' } as never)).toBe(
      'updated',
    );
    expect(controller.remove('u1')).toBe('removed');
    expect(service.update).toHaveBeenCalledWith('u1', { status: 'inactive' });
  });

  it('AdminRecipesController delegates moderation operations', () => {
    const service = {
      findAll: jest.fn().mockReturnValue('recipes'),
      updateStatus: jest.fn().mockReturnValue('updated'),
    };
    const controller = new AdminRecipesController(service as never);

    expect(controller.findAll({ status: 'pending' } as never)).toBe('recipes');
    expect(controller.updateStatus('r1', { status: 'approved' } as never)).toBe(
      'updated',
    );
    expect(service.updateStatus).toHaveBeenCalledWith('r1', {
      status: 'approved',
    });
  });

  it('AdminStatsController delegates stats lookup', () => {
    const service = { getStats: jest.fn().mockReturnValue('stats') };
    const controller = new AdminStatsController(service as never);

    expect(controller.getStats()).toBe('stats');
    expect(service.getStats).toHaveBeenCalled();
  });
});

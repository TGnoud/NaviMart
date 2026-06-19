import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock the HTTP layer: these tests assert the endpoint wrappers translate their
// arguments into the right (path, options) call — not the network behaviour
// (that is covered by client.test.ts).
vi.mock('./client', () => ({
  apiRequest: vi.fn(() => Promise.resolve({ ok: true })),
}));

import { apiRequest } from './client';
import {
  authApi,
  catalogApi,
  familyApi,
  notificationsApi,
  pantryApi,
  recipesApi,
  shoppingListsApi,
  usersApi,
} from './index';

const mockedRequest = vi.mocked(apiRequest);

afterEach(() => {
  mockedRequest.mockClear();
});

describe('authApi', () => {
  it('login posts credentials without auth', () => {
    void authApi.login('me@example.com', 'pw', true);
    expect(mockedRequest).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: { identifier: 'me@example.com', password: 'pw', rememberMe: true },
      auth: false,
    });
  });

  it('refresh posts the refresh token without auth', () => {
    void authApi.refresh('refresh-123');
    expect(mockedRequest).toHaveBeenCalledWith('/auth/refresh', {
      method: 'POST',
      body: { refreshToken: 'refresh-123' },
      auth: false,
    });
  });

  it('logout posts to the logout endpoint (authenticated)', () => {
    void authApi.logout();
    expect(mockedRequest).toHaveBeenCalledWith('/auth/logout', {
      method: 'POST',
    });
  });
});

describe('pantryApi', () => {
  it('list forwards the filter query', () => {
    void pantryApi.list({ status: 'active', expiryStatus: 'expiring' });
    expect(mockedRequest).toHaveBeenCalledWith('/pantry', {
      query: { status: 'active', expiryStatus: 'expiring' },
    });
  });

  it('list defaults to an empty query when called with no args', () => {
    void pantryApi.list();
    expect(mockedRequest).toHaveBeenCalledWith('/pantry', { query: {} });
  });

  it('get builds the item path', () => {
    void pantryApi.get('item-1');
    expect(mockedRequest).toHaveBeenCalledWith('/pantry/item-1');
  });

  it('consume posts quantity and note to the consume sub-resource', () => {
    void pantryApi.consume('item-1', 2, 'lunch');
    expect(mockedRequest).toHaveBeenCalledWith('/pantry/item-1/consume', {
      method: 'POST',
      body: { quantity: 2, note: 'lunch' },
    });
  });

  it('remove issues a DELETE', () => {
    void pantryApi.remove('item-9');
    expect(mockedRequest).toHaveBeenCalledWith('/pantry/item-9', {
      method: 'DELETE',
    });
  });
});

describe('shoppingListsApi', () => {
  it('list passes the status as a query param', () => {
    void shoppingListsApi.list('active');
    expect(mockedRequest).toHaveBeenCalledWith('/shopping-lists', {
      query: { status: 'active' },
    });
  });

  it('complete posts to the complete sub-resource with defaults', () => {
    void shoppingListsApi.complete('list-1');
    expect(mockedRequest).toHaveBeenCalledWith('/shopping-lists/list-1/complete', {
      method: 'POST',
      body: {},
    });
  });
});

describe('recipesApi', () => {
  it('addFavorite posts to the favorite sub-resource', () => {
    void recipesApi.addFavorite('r-1');
    expect(mockedRequest).toHaveBeenCalledWith('/recipes/r-1/favorite', {
      method: 'POST',
      body: {},
    });
  });

  it('removeFavorite deletes the favorite sub-resource', () => {
    void recipesApi.removeFavorite('r-1');
    expect(mockedRequest).toHaveBeenCalledWith('/recipes/r-1/favorite', {
      method: 'DELETE',
    });
  });

  it('suggestions forwards its query', () => {
    void recipesApi.suggestions({ limit: 5, prioritizeExpiring: true });
    expect(mockedRequest).toHaveBeenCalledWith('/recipes/suggestions', {
      query: { limit: 5, prioritizeExpiring: true },
    });
  });
});

describe('catalogApi', () => {
  it('searchFoods forwards its query', () => {
    void catalogApi.searchFoods({ q: 'milk', categoryId: 'c1', limit: 5 });
    expect(mockedRequest).toHaveBeenCalledWith('/catalog/foods', {
      query: { q: 'milk', categoryId: 'c1', limit: 5 },
    });
  });

  it('categories and units hit their endpoints', () => {
    void catalogApi.categories();
    void catalogApi.units();
    expect(mockedRequest).toHaveBeenCalledWith('/catalog/categories');
    expect(mockedRequest).toHaveBeenCalledWith('/catalog/units');
  });
});

describe('usersApi', () => {
  it('me reads the profile and updateMe patches it', () => {
    void usersApi.me();
    void usersApi.updateMe({ firstName: 'Linh' });
    expect(mockedRequest).toHaveBeenCalledWith('/users/me');
    expect(mockedRequest).toHaveBeenCalledWith('/users/me', {
      method: 'PATCH',
      body: { firstName: 'Linh' },
    });
  });
});

describe('familyApi', () => {
  it('create posts the family name', () => {
    void familyApi.create('Gia dinh A');
    expect(mockedRequest).toHaveBeenCalledWith('/family', {
      method: 'POST',
      body: { name: 'Gia dinh A' },
    });
  });

  it('join posts the invite code', () => {
    void familyApi.join('CODE123');
    expect(mockedRequest).toHaveBeenCalledWith('/family/join', {
      method: 'POST',
      body: { inviteCode: 'CODE123' },
    });
  });

  it('removeMember deletes the member sub-resource', () => {
    void familyApi.removeMember('m1');
    expect(mockedRequest).toHaveBeenCalledWith('/family/members/m1', {
      method: 'DELETE',
    });
  });
});

describe('notificationsApi', () => {
  it('markAsRead patches the notification', () => {
    void notificationsApi.markAsRead('n1');
    expect(mockedRequest).toHaveBeenCalledWith('/notifications/n1/read', {
      method: 'PATCH',
    });
  });

  it('markAllAsRead patches the read-all endpoint', () => {
    void notificationsApi.markAllAsRead();
    expect(mockedRequest).toHaveBeenCalledWith('/notifications/read-all', {
      method: 'PATCH',
    });
  });
});

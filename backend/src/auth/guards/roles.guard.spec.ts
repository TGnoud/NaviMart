import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function makeContext(user?: { role: string }) {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  };
}

describe('RolesGuard', () => {
  it('allows requests when no role metadata is required', () => {
    const reflector = { getAllAndOverride: jest.fn(() => undefined) };
    const guard = new RolesGuard(reflector as unknown as Reflector);

    expect(guard.canActivate(makeContext() as never)).toBe(true);
  });

  it('allows users whose role is listed in metadata', () => {
    const reflector = { getAllAndOverride: jest.fn(() => ['admin']) };
    const guard = new RolesGuard(reflector as unknown as Reflector);

    expect(guard.canActivate(makeContext({ role: 'admin' }) as never)).toBe(
      true,
    );
  });

  it('denies missing or mismatched users', () => {
    const reflector = { getAllAndOverride: jest.fn(() => ['admin']) };
    const guard = new RolesGuard(reflector as unknown as Reflector);

    expect(guard.canActivate(makeContext() as never)).toBe(false);
    expect(guard.canActivate(makeContext({ role: 'user' }) as never)).toBe(
      false,
    );
  });
});

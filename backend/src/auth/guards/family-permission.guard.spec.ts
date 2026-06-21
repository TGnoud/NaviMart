import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Types } from 'mongoose';
import { mockQuery } from '../../../test/utils/mock-model';
import { oid } from '../../../test/utils/fixtures';
import { FamilyPermissionGuard } from './family-permission.guard';

function makeContext(user?: Record<string, unknown>, params?: Record<string, string>) {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user, params }),
    }),
  };
}

function makeMember(userId: Types.ObjectId, overrides: Record<string, unknown> = {}) {
  return {
    userId,
    role: 'member',
    status: 'active',
    permissions: [],
    ...overrides,
  };
}

describe('FamilyPermissionGuard', () => {
  const userId = oid();
  const familyId = oid();
  let reflector: { getAllAndOverride: jest.Mock };
  let familyModel: { findById: jest.Mock };
  let guard: FamilyPermissionGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn(() => ['manage_pantry']) };
    familyModel = { findById: jest.fn() };
    guard = new FamilyPermissionGuard(
      reflector as unknown as Reflector,
      familyModel as never,
    );
  });

  it('allows requests when no family permission metadata is required', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    await expect(guard.canActivate(makeContext() as never)).resolves.toBe(true);
    expect(familyModel.findById).not.toHaveBeenCalled();
  });

  it('requires an authenticated user attached to a family', async () => {
    await expect(guard.canActivate(makeContext() as never)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('denies users who are not active family members', async () => {
    familyModel.findById.mockReturnValue(mockQuery({ members: [] }));

    await expect(
      guard.canActivate(
        makeContext({ userId: userId.toString(), activeFamilyId: familyId.toString() }) as never,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows family owners and admins regardless of explicit permissions', async () => {
    familyModel.findById.mockReturnValue(
      mockQuery({
        members: [makeMember(userId, { role: 'admin', permissions: [] })],
      }),
    );

    await expect(
      guard.canActivate(
        makeContext({ userId: userId.toString(), activeFamilyId: familyId.toString() }) as never,
      ),
    ).resolves.toBe(true);
  });

  it('allows regular members with every required permission', async () => {
    familyModel.findById.mockReturnValue(
      mockQuery({
        members: [
          makeMember(userId, {
            permissions: ['manage_pantry', 'manage_shopping_lists'],
          }),
        ],
      }),
    );

    await expect(
      guard.canActivate(
        makeContext({ userId: userId.toString(), activeFamilyId: familyId.toString() }) as never,
      ),
    ).resolves.toBe(true);
  });

  it('denies regular members missing a required permission', async () => {
    familyModel.findById.mockReturnValue(
      mockQuery({ members: [makeMember(userId, { permissions: [] })] }),
    );

    await expect(
      guard.canActivate(
        makeContext({ userId: userId.toString(), activeFamilyId: familyId.toString() }) as never,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('uses route familyId params before the active family id', async () => {
    const routeFamilyId = oid();
    familyModel.findById.mockReturnValue(
      mockQuery({
        members: [makeMember(userId, { role: 'owner' })],
      }),
    );

    await guard.canActivate(
      makeContext(
        { userId: userId.toString(), activeFamilyId: familyId.toString() },
        { familyId: routeFamilyId.toString() },
      ) as never,
    );

    expect(familyModel.findById.mock.calls[0][0].toString()).toBe(
      routeFamilyId.toString(),
    );
  });
});

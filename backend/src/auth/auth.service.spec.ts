import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { createMockModel, MockModel, mockQuery } from '../../test/utils/mock-model';
import { oid } from '../../test/utils/fixtures';
import { AuthService } from './auth.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockHash = hash as jest.Mock;
const mockCompare = compare as jest.Mock;

function makeUserDoc(overrides: Record<string, unknown> = {}) {
  const doc = {
    _id: oid(),
    email: 'a@b.com',
    phone: undefined,
    passwordHash: 'stored-hash',
    refreshTokenHash: 'stored-refresh',
    firstName: 'A',
    lastName: 'B',
    displayName: 'A B',
    role: 'housewife',
    status: 'active',
    activeFamilyId: oid(),
    save: jest.fn(),
    ...overrides,
  };
  doc.save = (overrides.save as jest.Mock) ?? jest.fn().mockResolvedValue(doc);
  return doc;
}

describe('AuthService', () => {
  let service: AuthService;
  let userModel: MockModel;
  let familyModel: MockModel;
  let jwtService: { signAsync: jest.Mock; verifyAsync: jest.Mock };
  let configService: { getOrThrow: jest.Mock; get: jest.Mock };
  let gmailMailService: {
    isEnabled: jest.Mock;
    sendPasswordResetCode: jest.Mock;
    sendEmailVerificationCode: jest.Mock;
  };
  let expiryNotificationsService: { createExpiryNotifications: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    userModel = createMockModel();
    familyModel = createMockModel();
    userModel.updateOne.mockReturnValue(mockQuery({ modifiedCount: 1 }));
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed.jwt'),
      verifyAsync: jest.fn(),
    };
    configService = {
      getOrThrow: jest.fn().mockReturnValue('secret'),
      get: jest.fn().mockReturnValue('test'),
    };
    gmailMailService = {
      isEnabled: jest.fn().mockReturnValue(false),
      sendPasswordResetCode: jest.fn(),
      sendEmailVerificationCode: jest.fn(),
    };
    mockHash.mockResolvedValue('hashed');
    expiryNotificationsService = {
      createExpiryNotifications: jest.fn().mockResolvedValue({ createdCount: 0 }),
    };

    service = new AuthService(
      userModel as never,
      familyModel as never,
      jwtService as never,
      configService as never,
      gmailMailService as never,
      expiryNotificationsService as never,
    );
  });

  describe('register', () => {
    it('creates a user and owner family, then issues tokens', async () => {
      const userDoc = makeUserDoc({ role: 'housewife', activeFamilyId: undefined });
      userModel.create.mockResolvedValue(userDoc);
      familyModel.create.mockResolvedValue({ _id: oid() });

      const result = await service.register({
        email: 'New@Example.com',
        password: 'secret123',
        firstName: 'New',
        lastName: 'User',
      } as never);

      expect(mockHash).toHaveBeenCalledWith('secret123', 12);
      expect(familyModel.create).toHaveBeenCalled();
      expect(userDoc.save).toHaveBeenCalled();
      expect(result.tokens).toEqual({
        accessToken: 'signed.jwt',
        refreshToken: 'signed.jwt',
      });
      expect(result.user.id).toBe(userDoc._id.toString());
    });

    it('translates a duplicate-key error into Conflict', async () => {
      userModel.create.mockRejectedValue({ code: 11000 });
      await expect(
        service.register({
          email: 'dup@example.com',
          password: 'x',
          firstName: 'D',
          lastName: 'K',
        } as never),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('throws Unauthorized for an unknown identifier', async () => {
      userModel.findOne.mockReturnValue(mockQuery(null));
      await expect(
        service.login({ identifier: 'x@y.com', password: 'p' } as never),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws Unauthorized when the password does not match', async () => {
      userModel.findOne.mockReturnValue(mockQuery(makeUserDoc()));
      mockCompare.mockResolvedValue(false);
      await expect(
        service.login({ identifier: 'a@b.com', password: 'wrong' } as never),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws Unauthorized when the account is not active', async () => {
      userModel.findOne.mockReturnValue(
        mockQuery(makeUserDoc({ status: 'suspended' })),
      );
      mockCompare.mockResolvedValue(true);
      await expect(
        service.login({ identifier: 'a@b.com', password: 'right' } as never),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('returns tokens on valid credentials', async () => {
      const doc = makeUserDoc();
      userModel.findOne.mockReturnValue(mockQuery(doc));
      mockCompare.mockResolvedValue(true);

      const result = await service.login({
        identifier: 'a@b.com',
        password: 'right',
      } as never);

      expect(result.tokens.accessToken).toBe('signed.jwt');
      expect(doc.save).toHaveBeenCalled();
      expect(expiryNotificationsService.createExpiryNotifications).toHaveBeenCalledTimes(1);
    });
  });

  describe('refresh', () => {
    it('throws Unauthorized when the token cannot be verified', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('bad'));
      await expect(service.refresh('tok')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws Unauthorized when the stored refresh hash does not match', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: oid().toString() });
      userModel.findById.mockReturnValue(mockQuery(makeUserDoc()));
      mockCompare.mockResolvedValue(false);
      await expect(service.refresh('tok')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rotates tokens for a valid refresh token', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: oid().toString() });
      userModel.findById.mockReturnValue(mockQuery(makeUserDoc()));
      mockCompare.mockResolvedValue(true);

      const result = await service.refresh('tok');
      expect(result.tokens.refreshToken).toBe('signed.jwt');
    });
  });

  describe('resetPassword', () => {
    it('throws BadRequest for an invalid or expired token', async () => {
      userModel.findOne.mockReturnValue(mockQuery(null));
      await expect(
        service.resetPassword({ token: 't', newPassword: 'p' } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('updates the password hash on a valid token', async () => {
      userModel.findOne.mockReturnValue(mockQuery(makeUserDoc()));
      const result = await service.resetPassword({
        token: 't',
        newPassword: 'newpass',
      } as never);
      expect(mockHash).toHaveBeenCalledWith('newpass', 12);
      expect(result).toEqual({ success: true });
    });
  });

  describe('forgotPassword', () => {
    it('returns success without leaking whether the account exists', async () => {
      userModel.findOne.mockReturnValue(mockQuery(null));
      const result = await service.forgotPassword({
        identifier: 'unknown@x.com',
      } as never);
      expect(result).toEqual({ success: true });
    });

    it('returns a dev reset token when email is disabled in non-production', async () => {
      userModel.findOne.mockReturnValue(mockQuery(makeUserDoc()));
      const result = await service.forgotPassword({
        identifier: 'a@b.com',
      } as never);
      expect(result.success).toBe(true);
      expect((result as { devResetToken?: string }).devResetToken).toEqual(
        expect.any(String),
      );
    });
  });

  describe('logout', () => {
    it('revokes the stored refresh token', async () => {
      const result = await service.logout({ userId: oid().toString() } as never);
      expect(userModel.updateOne).toHaveBeenCalledWith(
        { _id: expect.any(String) },
        { $unset: { refreshTokenHash: 1 } },
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('sendVerification', () => {
    it('throws Unauthorized when the user is not active', async () => {
      userModel.findById.mockReturnValue(
        mockQuery(makeUserDoc({ status: 'suspended' })),
      );
      await expect(
        service.sendVerification({ userId: oid().toString() } as never),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws BadRequest when the account has no email', async () => {
      userModel.findById.mockReturnValue(
        mockQuery(makeUserDoc({ email: undefined })),
      );
      await expect(
        service.sendVerification({ userId: oid().toString() } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('returns a dev verification token in non-production with email disabled', async () => {
      userModel.findById.mockReturnValue(mockQuery(makeUserDoc()));
      const result = await service.sendVerification({
        userId: oid().toString(),
      } as never);
      expect((result as { devVerificationToken?: string }).devVerificationToken).toEqual(
        expect.any(String),
      );
    });
  });

  describe('validateJwtPayload', () => {
    it('throws Unauthorized when the user no longer exists or is inactive', async () => {
      userModel.findById.mockReturnValue(mockQuery(null));
      await expect(
        service.validateJwtPayload({ sub: oid().toString() } as never),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('maps an active user to the authenticated-user shape', async () => {
      const doc = makeUserDoc();
      userModel.findById.mockReturnValue(mockQuery(doc));
      const result = await service.validateJwtPayload({
        sub: doc._id.toString(),
      } as never);
      expect(result).toMatchObject({ userId: doc._id.toString(), role: doc.role });
    });
  });

  describe('verifyEmail', () => {
    it('throws BadRequest for an invalid verification token', async () => {
      userModel.findOne.mockReturnValue(mockQuery(null));
      await expect(
        service.verifyEmail({ token: 'bad' } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('marks the email verified on a valid token', async () => {
      userModel.findOne.mockReturnValue(mockQuery(makeUserDoc()));
      const result = await service.verifyEmail({ token: 'good' } as never);
      expect(result).toEqual({ success: true });
    });
  });
});

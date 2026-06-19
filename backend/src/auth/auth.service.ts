import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare, hash } from 'bcryptjs';
import { createHash, randomInt } from 'crypto';
import { Model, Types } from 'mongoose';
import {
  Family,
  FAMILY_PERMISSIONS,
} from '../families/schemas/family.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { ExpiryNotificationsService } from '../notifications/expiry-notifications.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GmailMailService } from './gmail-mail.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { AuthenticatedUser, JwtPayload } from './types/authenticated-user.type';

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Family.name) private readonly familyModel: Model<Family>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly gmailMailService: GmailMailService,
    private readonly expiryNotificationsService: ExpiryNotificationsService,
  ) {}

  async register(registerDto: RegisterDto) {
    const passwordHash = await hash(registerDto.password, 12);

    try {
      const user = await this.userModel.create({
        email: registerDto.email?.toLowerCase(),
        phone: registerDto.phone,
        passwordHash,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        displayName: `${registerDto.firstName} ${registerDto.lastName}`,
        role: 'housewife',
      });

      const family = await this.familyModel.create({
        name: registerDto.familyName ?? `${registerDto.firstName}'s Family`,
        ownerId: user._id,
        members: [
          {
            userId: user._id,
            role: 'owner',
            permissions: [...FAMILY_PERMISSIONS],
          },
        ],
      });

      user.activeFamilyId = family._id;
      await user.save();

      const tokens = await this.issueTokens(user);
      await this.storeRefreshToken(user._id, tokens.refreshToken);

      return {
        user: this.toUserResponse(user),
        tokens,
      };
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Email or phone already exists');
      }

      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const identifier = loginDto.identifier.trim().toLowerCase();
    const user = await this.userModel
      .findOne({
        $or: [{ email: identifier }, { phone: loginDto.identifier.trim() }],
      })
      .select('+passwordHash')
      .exec();

    if (!user || !(await compare(loginDto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('User account is not active');
    }

    user.lastLoginAt = new Date();
    const tokens = await this.issueTokens(user, loginDto.rememberMe);
    await this.storeRefreshToken(user._id, tokens.refreshToken);
    await user.save();
    void this.expiryNotificationsService
      .createExpiryNotifications()
      .catch(() => undefined);

    return {
      user: this.toUserResponse(user),
      tokens,
    };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userModel
      .findById(payload.sub)
      .select('+refreshTokenHash')
      .exec();

    if (
      !user ||
      user.status !== 'active' ||
      !user.refreshTokenHash ||
      !(await compare(refreshToken, user.refreshTokenHash))
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.issueTokens(user);
    await this.storeRefreshToken(user._id, tokens.refreshToken);

    return {
      user: this.toUserResponse(user),
      tokens,
    };
  }

  async logout(user: AuthenticatedUser) {
    await this.userModel
      .updateOne(
        { _id: user.userId },
        {
          $unset: {
            refreshTokenHash: 1,
          },
        },
      )
      .exec();

    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const identifier = dto.identifier.trim().toLowerCase();
    const user = await this.userModel
      .findOne({
        $or: [{ email: identifier }, { phone: dto.identifier.trim() }],
      })
      .exec();

    if (!user) {
      return { success: true };
    }

    const token = this.generateVerificationCode();
    await this.userModel
      .updateOne(
        { _id: user._id },
        {
          $set: {
            resetPasswordTokenHash: this.sha256(token),
            resetPasswordExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
          },
        },
      )
      .exec();

    if (this.gmailMailService.isEnabled() && user.email) {
      await this.gmailMailService.sendPasswordResetCode(user.email, token);
      return { success: true };
    }

    if (this.isProduction()) {
      return { success: true };
    }

    return { success: true, devResetToken: token };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userModel
      .findOne({
        resetPasswordTokenHash: this.sha256(dto.token),
        resetPasswordExpiresAt: { $gt: new Date() },
      })
      .exec();

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await hash(dto.newPassword, 12);
    await this.userModel
      .updateOne(
        { _id: user._id },
        {
          $set: { passwordHash },
          $unset: {
            resetPasswordTokenHash: 1,
            resetPasswordExpiresAt: 1,
            refreshTokenHash: 1,
          },
        },
      )
      .exec();

    return { success: true };
  }

  async sendVerification(authenticatedUser: AuthenticatedUser) {
    const user = await this.userModel
      .findById(authenticatedUser.userId)
      .exec();

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Invalid access token');
    }

    if (!user.email) {
      throw new BadRequestException('User account has no email address');
    }

    const token = this.generateVerificationCode();
    await this.userModel
      .updateOne(
        { _id: user._id },
        {
          $set: {
            emailVerificationTokenHash: this.sha256(token),
          },
        },
      )
      .exec();

    if (this.gmailMailService.isEnabled()) {
      await this.gmailMailService.sendEmailVerificationCode(user.email, token);
      return { success: true };
    }

    if (this.isProduction()) {
      return { success: true };
    }

    return { success: true, devVerificationToken: token };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.userModel
      .findOne({ emailVerificationTokenHash: this.sha256(dto.token) })
      .exec();

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    await this.userModel
      .updateOne(
        { _id: user._id },
        {
          $set: { emailVerifiedAt: new Date() },
          $unset: { emailVerificationTokenHash: 1 },
        },
      )
      .exec();

    return { success: true };
  }

  async validateJwtPayload(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.userModel.findById(payload.sub).exec();

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Invalid access token');
    }

    return this.toAuthenticatedUser(user);
  }

  private async issueTokens(
    user: UserDocument,
    rememberMe = false,
  ): Promise<AuthTokens> {
    const payload = this.toJwtPayload(user);
    const refreshExpiresIn = rememberMe
      ? this.getJwtExpiresIn('JWT_REFRESH_EXPIRES_IN')
      : '1d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.getJwtExpiresIn('JWT_ACCESS_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private getJwtExpiresIn(key: string): JwtSignOptions['expiresIn'] {
    return this.configService.getOrThrow<string>(
      key,
    ) as JwtSignOptions['expiresIn'];
  }

  private async storeRefreshToken(userId: Types.ObjectId, refreshToken: string) {
    const refreshTokenHash = await hash(refreshToken, 12);
    await this.userModel
      .updateOne({ _id: userId }, { $set: { refreshTokenHash } })
      .exec();
  }

  private toJwtPayload(user: UserDocument): JwtPayload {
    return {
      sub: user._id.toString(),
      email: user.email,
      phone: user.phone,
      role: user.role,
      activeFamilyId: user.activeFamilyId?.toString(),
    };
  }

  private toAuthenticatedUser(user: UserDocument): AuthenticatedUser {
    return {
      userId: user._id.toString(),
      email: user.email,
      phone: user.phone,
      role: user.role,
      activeFamilyId: user.activeFamilyId?.toString(),
    };
  }

  private toUserResponse(user: UserDocument) {
    return {
      id: user._id.toString(),
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      status: user.status,
      activeFamilyId: user.activeFamilyId?.toString(),
      emailVerifiedAt: user.emailVerifiedAt,
    };
  }

  private sha256(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }

  private generateVerificationCode() {
    return randomInt(100000, 1000000).toString();
  }

  private isProduction() {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }

  private isDuplicateKeyError(error: unknown): error is { code: number } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    );
  }
}

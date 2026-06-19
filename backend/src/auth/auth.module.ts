import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { Family, FamilySchema } from '../families/schemas/family.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FamilyPermissionGuard } from './guards/family-permission.guard';
import { GmailMailService } from './gmail-mail.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    NotificationsModule,
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Family.name, schema: FamilySchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GmailMailService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    FamilyPermissionGuard,
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard, FamilyPermissionGuard],
})
export class AuthModule {}

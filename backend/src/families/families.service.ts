import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes, createHash } from 'crypto';
import { Model, Types } from 'mongoose';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { User } from '../users/schemas/user.schema';
import { CreateFamilyDto } from './dto/create-family.dto';
import { CreateFamilyInviteDto } from './dto/create-family-invite.dto';
import { JoinFamilyDto } from './dto/join-family.dto';
import { UpdateMemberPermissionsDto } from './dto/update-member-permissions.dto';
import {
  Family,
  FAMILY_PERMISSIONS,
  FamilyMember,
} from './schemas/family.schema';

@Injectable()
export class FamiliesService {
  constructor(
    @InjectModel(Family.name) private readonly familyModel: Model<Family>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(user: AuthenticatedUser, createFamilyDto: CreateFamilyDto) {
    const userId = new Types.ObjectId(user.userId);

    const family = await this.familyModel.create({
      name: createFamilyDto.name,
      ownerId: userId,
      members: [
        {
          userId,
          role: 'owner',
          permissions: [...FAMILY_PERMISSIONS],
        },
      ],
    });

    await this.userModel
      .updateOne({ _id: userId }, { $set: { activeFamilyId: family._id } })
      .exec();

    return this.toFamilyResponse(family);
  }

  async getCurrentFamily(user: AuthenticatedUser) {
    if (!user.activeFamilyId) {
      throw new NotFoundException('Current user does not have an active family');
    }

    const family = await this.familyModel
      .findById(user.activeFamilyId)
      .populate('members.userId', 'firstName lastName displayName email phone avatarUrl')
      .exec();

    if (!family) {
      throw new NotFoundException('Family not found');
    }

    this.assertActiveMember(family, user.userId);
    return this.toFamilyResponse(family);
  }

  async listForUser(user: AuthenticatedUser) {
    const families = await this.familyModel
      .find({
        'members': {
          $elemMatch: {
            userId: new Types.ObjectId(user.userId),
            status: 'active',
          },
        },
      })
      .populate('members.userId', 'firstName lastName displayName email phone avatarUrl')
      .exec();

    return families.map((family) => this.toFamilyResponse(family));
  }

  async switchFamily(user: AuthenticatedUser, familyId: string) {
    const family = await this.familyModel
      .findById(familyId)
      .populate('members.userId', 'firstName lastName displayName email phone avatarUrl')
      .exec();

    if (!family) {
      throw new NotFoundException('Family not found');
    }

    this.assertActiveMember(family, user.userId);

    await this.userModel
      .updateOne(
        { _id: new Types.ObjectId(user.userId) },
        { $set: { activeFamilyId: family._id } }
      )
      .exec();

    return this.toFamilyResponse(family);
  }

  async createInvite(
    user: AuthenticatedUser,
    createFamilyInviteDto: CreateFamilyInviteDto,
  ) {
    const family = await this.getFamilyForUser(user);
    const inviteCode = this.generateInviteCode();
    const expiresInHours = createFamilyInviteDto.expiresInHours ?? 24;
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    family.inviteCodes.push({
      codeHash: this.hashInviteCode(inviteCode),
      permissions: createFamilyInviteDto.permissions ?? ['edit_lists'],
      createdBy: new Types.ObjectId(user.userId),
      expiresAt,
    });

    await family.save();

    return {
      inviteCode,
      expiresAt,
      permissions: createFamilyInviteDto.permissions ?? ['edit_lists'],
    };
  }

  async join(user: AuthenticatedUser, joinFamilyDto: JoinFamilyDto) {
    const codeHash = this.hashInviteCode(joinFamilyDto.inviteCode);
    const family = await this.familyModel
      .findOne({
        'inviteCodes.codeHash': codeHash,
        'inviteCodes.expiresAt': { $gt: new Date() },
        'inviteCodes.usedAt': { $exists: false },
      })
      .exec();

    if (!family) {
      throw new NotFoundException('Invite code is invalid or expired');
    }

    const invite = family.inviteCodes.find(
      (item) =>
        item.codeHash === codeHash && item.expiresAt > new Date() && !item.usedAt,
    );

    if (!invite) {
      throw new NotFoundException('Invite code is invalid or expired');
    }

    const existingMember = family.members.find(
      (member) => member.userId.toString() === user.userId,
    );

    if (existingMember?.status === 'active') {
      throw new ConflictException('User is already a family member');
    }

    if (existingMember) {
      existingMember.status = 'active';
      existingMember.permissions = invite.permissions;
      existingMember.joinedAt = new Date();
    } else {
      family.members.push({
        userId: new Types.ObjectId(user.userId),
        role: 'member',
        permissions: invite.permissions,
        status: 'active',
        joinedAt: new Date(),
      });
    }

    invite.usedAt = new Date();
    await family.save();

    await this.userModel
      .updateOne(
        { _id: user.userId },
        { $set: { activeFamilyId: family._id } },
      )
      .exec();

    return this.toFamilyResponse(family);
  }

  async updateMemberPermissions(
    user: AuthenticatedUser,
    memberId: string,
    updateMemberPermissionsDto: UpdateMemberPermissionsDto,
  ) {
    if (memberId === user.userId) {
      throw new BadRequestException('Cannot update your own family permissions');
    }

    const family = await this.getFamilyForUser(user);
    const member = this.findMemberOrThrow(family, memberId);

    if (member.role === 'owner') {
      throw new ForbiddenException('Cannot update the family owner');
    }

    member.permissions = updateMemberPermissionsDto.permissions;

    if (updateMemberPermissionsDto.role) {
      if (updateMemberPermissionsDto.role === 'owner') {
        throw new BadRequestException('Owner role cannot be assigned here');
      }

      member.role = updateMemberPermissionsDto.role;
    }

    await family.save();
    return this.toFamilyResponse(family);
  }

  async removeMember(user: AuthenticatedUser, memberId: string) {
    if (memberId === user.userId) {
      throw new BadRequestException('Use leave family flow to remove yourself');
    }

    const family = await this.getFamilyForUser(user);
    const member = this.findMemberOrThrow(family, memberId);

    if (member.role === 'owner') {
      throw new ForbiddenException('Cannot remove the family owner');
    }

    member.status = 'removed';
    member.permissions = [];

    await family.save();
    await this.userModel
      .updateOne(
        { _id: memberId, activeFamilyId: family._id },
        { $unset: { activeFamilyId: 1 } },
      )
      .exec();

    return { success: true };
  }

  private async getFamilyForUser(user: AuthenticatedUser) {
    if (!user.activeFamilyId) {
      throw new NotFoundException('Current user does not have an active family');
    }

    const family = await this.familyModel.findById(user.activeFamilyId).exec();

    if (!family) {
      throw new NotFoundException('Family not found');
    }

    this.assertActiveMember(family, user.userId);
    return family;
  }

  private assertActiveMember(family: Family, userId: string) {
    const member = family.members.find(
      (item) => this.getMemberUserId(item) === userId && item.status === 'active',
    );

    if (!member) {
      throw new ForbiddenException('User is not an active family member');
    }
  }

  private findMemberOrThrow(family: Family, memberId: string): FamilyMember {
    const member = family.members.find(
      (item) =>
        this.getMemberUserId(item) === memberId && item.status === 'active',
    );

    if (!member) {
      throw new NotFoundException('Family member not found');
    }

    return member;
  }

  private generateInviteCode(): string {
    return randomBytes(6).toString('base64url').toUpperCase();
  }

  private hashInviteCode(inviteCode: string): string {
    return createHash('sha256')
      .update(inviteCode.trim().toUpperCase())
      .digest('hex');
  }

  private toFamilyResponse(family: Family) {
    return {
      id: family._id.toString(),
      name: family.name,
      ownerId: family.ownerId.toString(),
      members: family.members
        .filter((member) => member.status === 'active')
        .map((member) => ({
          userId: this.getMemberUserId(member),
          role: member.role,
          permissions: member.permissions,
          status: member.status,
          joinedAt: member.joinedAt,
          user: this.getMemberUserInfo(member),
        })),
      activeInvites: family.inviteCodes
        .filter((invite) => invite.expiresAt > new Date() && !invite.usedAt)
        .map((invite) => ({
          permissions: invite.permissions,
          createdBy: invite.createdBy.toString(),
          expiresAt: invite.expiresAt,
        })),
    };
  }

  private getMemberUserId(member: FamilyMember) {
    const userId = member.userId as unknown as { _id?: Types.ObjectId };
    return (userId._id ?? member.userId).toString();
  }

  // Present only when members.userId has been populated (e.g. getCurrentFamily).
  private getMemberUserInfo(member: FamilyMember) {
    const populated = member.userId as unknown as {
      _id?: Types.ObjectId;
      firstName?: string;
      lastName?: string;
      displayName?: string;
      email?: string;
      phone?: string;
      avatarUrl?: string;
    };

    if (!populated._id) {
      return undefined;
    }

    return {
      firstName: populated.firstName,
      lastName: populated.lastName,
      displayName: populated.displayName,
      email: populated.email,
      phone: populated.phone,
      avatarUrl: populated.avatarUrl,
    };
  }
}

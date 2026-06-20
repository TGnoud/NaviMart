import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FamilyPermissions } from '../auth/decorators/family-permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FamilyPermissionGuard } from '../auth/guards/family-permission.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateFamilyDto } from './dto/create-family.dto';
import { CreateFamilyInviteDto } from './dto/create-family-invite.dto';
import { JoinFamilyDto } from './dto/join-family.dto';
import { UpdateMemberPermissionsDto } from './dto/update-member-permissions.dto';
import { FamiliesService } from './families.service';

@ApiTags('Family')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('family')
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Get()
  @ApiOkResponse({ description: 'Current active family.' })
  getCurrentFamily(@CurrentUser() user: AuthenticatedUser) {
    return this.familiesService.getCurrentFamily(user);
  }

  @Get('list')
  @ApiOkResponse({ description: 'List of user families.' })
  listForUser(@CurrentUser() user: AuthenticatedUser) {
    return this.familiesService.listForUser(user);
  }

  @Post(':id/switch')
  @ApiOkResponse({ description: 'Switch active family.' })
  switchFamily(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') familyId: string,
  ) {
    return this.familiesService.switchFamily(user, familyId);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Family created.' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createFamilyDto: CreateFamilyDto,
  ) {
    return this.familiesService.create(user, createFamilyDto);
  }

  @Post('invite')
  @UseGuards(JwtAuthGuard, FamilyPermissionGuard)
  @FamilyPermissions('manage_family')
  @ApiCreatedResponse({ description: 'Invite code created.' })
  createInvite(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createFamilyInviteDto: CreateFamilyInviteDto,
  ) {
    return this.familiesService.createInvite(user, createFamilyInviteDto);
  }

  @Post('join')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Joined family.' })
  join(
    @CurrentUser() user: AuthenticatedUser,
    @Body() joinFamilyDto: JoinFamilyDto,
  ) {
    return this.familiesService.join(user, joinFamilyDto);
  }

  @Patch('members/:memberId/permissions')
  @UseGuards(JwtAuthGuard, FamilyPermissionGuard)
  @FamilyPermissions('manage_family')
  @ApiOkResponse({ description: 'Family member permissions updated.' })
  updateMemberPermissions(
    @CurrentUser() user: AuthenticatedUser,
    @Param('memberId') memberId: string,
    @Body() updateMemberPermissionsDto: UpdateMemberPermissionsDto,
  ) {
    return this.familiesService.updateMemberPermissions(
      user,
      memberId,
      updateMemberPermissionsDto,
    );
  }

  @Delete('members/:memberId')
  @UseGuards(JwtAuthGuard, FamilyPermissionGuard)
  @FamilyPermissions('manage_family')
  @ApiOkResponse({ description: 'Family member removed.' })
  removeMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('memberId') memberId: string,
  ) {
    return this.familiesService.removeMember(user, memberId);
  }
}

import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ListUserInputLogsQueryDto } from './dto/list-user-input-logs-query.dto';
import { UpdateUserInputLogStatusDto } from './dto/update-user-input-log-status.dto';
import { UserInputLogsService } from './user-input-logs.service';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/input-logs')
export class UserInputLogsController {
  constructor(private readonly userInputLogsService: UserInputLogsService) {}

  @Get()
  @ApiOkResponse({ description: 'Paginated user-entered data logs.' })
  findAll(@Query() query: ListUserInputLogsQueryDto) {
    return this.userInputLogsService.findAll(query);
  }

  @Patch(':logId/status')
  @ApiOkResponse({ description: 'User-entered data log reviewed.' })
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('logId') logId: string,
    @Body() dto: UpdateUserInputLogStatusDto,
  ) {
    return this.userInputLogsService.updateStatus(user, logId, dto);
  }
}

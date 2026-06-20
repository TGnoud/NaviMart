import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
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
import { FamilyPermissionGuard } from '../auth/guards/family-permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CompleteShoppingListDto } from './dto/complete-shopping-list.dto';
import { CreateShoppingListItemDto } from './dto/create-shopping-list-item.dto';
import { CreateShoppingListDto } from './dto/create-shopping-list.dto';
import { ListShoppingListsQueryDto } from './dto/list-shopping-lists-query.dto';
import { UpdateShoppingListItemDto } from './dto/update-shopping-list-item.dto';
import { UpdateShoppingListDto } from './dto/update-shopping-list.dto';
import { ShoppingListsService } from './shopping-lists.service';

@ApiTags('Shopping Lists')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shopping-lists')
export class ShoppingListsController {
  constructor(private readonly shoppingListsService: ShoppingListsService) {}

  @Get()
  @ApiOkResponse({ description: 'Shopping lists for current family.' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListShoppingListsQueryDto,
  ) {
    return this.shoppingListsService.findAll(user, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, FamilyPermissionGuard)
  @FamilyPermissions('edit_lists')
  @ApiCreatedResponse({ description: 'Shopping list created.' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createShoppingListDto: CreateShoppingListDto,
  ) {
    return this.shoppingListsService.create(user, createShoppingListDto);
  }

  @Get(':listId')
  @ApiOkResponse({ description: 'Shopping list detail.' })
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('listId') listId: string,
  ) {
    return this.shoppingListsService.findOne(user, listId);
  }

  @Patch(':listId')
  @UseGuards(JwtAuthGuard, FamilyPermissionGuard)
  @FamilyPermissions('edit_lists')
  @ApiOkResponse({ description: 'Shopping list updated.' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('listId') listId: string,
    @Body() updateShoppingListDto: UpdateShoppingListDto,
  ) {
    return this.shoppingListsService.update(user, listId, updateShoppingListDto);
  }

  @Delete(':listId')
  @UseGuards(JwtAuthGuard, FamilyPermissionGuard)
  @FamilyPermissions('edit_lists')
  @ApiOkResponse({ description: 'Shopping list archived.' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('listId') listId: string,
    @Query('deleteAll') deleteAll?: string,
  ) {
    return this.shoppingListsService.remove(user, listId, deleteAll === 'true');
  }

  @Post(':listId/complete')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, FamilyPermissionGuard)
  @FamilyPermissions('edit_lists', 'edit_pantry')
  @ApiOkResponse({
    description: 'Shopping list completed and checked items added to pantry.',
  })
  complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('listId') listId: string,
    @Body() completeShoppingListDto: CompleteShoppingListDto,
  ) {
    return this.shoppingListsService.complete(
      user,
      listId,
      completeShoppingListDto,
    );
  }

  @Post(':listId/items')
  @UseGuards(JwtAuthGuard, FamilyPermissionGuard)
  @FamilyPermissions('edit_lists')
  @ApiCreatedResponse({ description: 'Shopping list item added.' })
  addItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('listId') listId: string,
    @Body() createShoppingListItemDto: CreateShoppingListItemDto,
  ) {
    return this.shoppingListsService.addItem(
      user,
      listId,
      createShoppingListItemDto,
    );
  }

  @Patch(':listId/items/:itemId')
  @UseGuards(JwtAuthGuard, FamilyPermissionGuard)
  @FamilyPermissions('edit_lists')
  @ApiOkResponse({ description: 'Shopping list item updated.' })
  updateItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('listId') listId: string,
    @Param('itemId') itemId: string,
    @Body() updateShoppingListItemDto: UpdateShoppingListItemDto,
  ) {
    return this.shoppingListsService.updateItem(
      user,
      listId,
      itemId,
      updateShoppingListItemDto,
    );
  }

  @Delete(':listId/items/:itemId')
  @UseGuards(JwtAuthGuard, FamilyPermissionGuard)
  @FamilyPermissions('edit_lists')
  @ApiOkResponse({ description: 'Shopping list item removed.' })
  removeItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('listId') listId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.shoppingListsService.removeItem(user, listId, itemId);
  }
}

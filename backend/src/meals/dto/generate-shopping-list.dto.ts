import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { SHOPPING_LIST_TYPES, ShoppingListType } from '../../shopping-lists/schemas/shopping-list.schema';

export class GenerateShoppingListDto {
  @ApiPropertyOptional({ example: 'Nguyen lieu bua toi' })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;

  @ApiPropertyOptional({ example: '2026-06-12T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  plannedFor?: Date;

  @ApiPropertyOptional({
    example: 2,
    description: 'Only used when generating from a recipe directly.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  servings?: number;

  @ApiPropertyOptional({ enum: SHOPPING_LIST_TYPES })
  @IsOptional()
  @IsEnum(SHOPPING_LIST_TYPES)
  type?: ShoppingListType;

  @ApiPropertyOptional({ example: '2026-12-31T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  recurrenceEndDate?: Date;
}

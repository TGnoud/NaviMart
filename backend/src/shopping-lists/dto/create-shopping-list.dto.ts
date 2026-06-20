import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsIn, IsOptional, IsString, Length } from 'class-validator';
import { SHOPPING_LIST_TYPES } from '../schemas/shopping-list.schema';

export class CreateShoppingListDto {
  @ApiProperty({ example: 'Cho cuoi tuan' })
  @IsString()
  @Length(1, 120)
  name!: string;

  @ApiPropertyOptional({ example: 'weekly', enum: SHOPPING_LIST_TYPES })
  @IsOptional()
  @IsIn(SHOPPING_LIST_TYPES)
  type?: (typeof SHOPPING_LIST_TYPES)[number];

  @ApiPropertyOptional({ example: '2026-06-13T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  plannedFor?: Date;

  @ApiPropertyOptional({ example: '2026-07-13T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  recurrenceEndDate?: Date;
}

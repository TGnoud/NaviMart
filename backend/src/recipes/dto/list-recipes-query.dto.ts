import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { RECIPE_DIFFICULTIES, RECIPE_STATUSES } from '../schemas/recipe.schema';

export const RECIPE_SORTS = ['newest', 'popular'] as const;

export class ListRecipesQueryDto {
  @ApiPropertyOptional({ example: 'thit bo' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: 'thit bo' })
  @IsOptional()
  @IsString()
  ingredient?: string;

  @ApiPropertyOptional({ example: '665f7b1e7c7a8f93df38b222' })
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'easy', enum: RECIPE_DIFFICULTIES })
  @IsOptional()
  @IsIn(RECIPE_DIFFICULTIES)
  difficulty?: (typeof RECIPE_DIFFICULTIES)[number];

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1440)
  maxCookTime?: number;

  @ApiPropertyOptional({ example: 'approved', enum: RECIPE_STATUSES })
  @IsOptional()
  @IsIn(RECIPE_STATUSES)
  status?: (typeof RECIPE_STATUSES)[number];

  @ApiPropertyOptional({ example: 'popular', enum: RECIPE_SORTS })
  @IsOptional()
  @IsIn(RECIPE_SORTS)
  sort?: (typeof RECIPE_SORTS)[number];

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;
}

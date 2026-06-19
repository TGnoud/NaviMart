import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { RECIPE_DIFFICULTIES, RECIPE_STATUSES, RECIPE_VISIBILITIES } from '../schemas/recipe.schema';
import { RecipeIngredientDto } from './recipe-ingredient.dto';
import { RecipeNutritionDto } from './recipe-nutrition.dto';

export class CreateRecipeDto {
  @ApiPropertyOptional({ example: 'personal', enum: RECIPE_VISIBILITIES })
  @IsOptional()
  @IsIn(RECIPE_VISIBILITIES)
  visibility?: (typeof RECIPE_VISIBILITIES)[number];

  @ApiProperty({ example: 'Thit bo xao rau cu' })
  @IsString()
  @Length(1, 200)
  name!: string;

  @ApiPropertyOptional({ example: 'Mon nhanh cho bua toi.' })
  @IsOptional()
  @IsString()
  @Length(1, 800)
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/recipe.jpg' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ example: 25 })
  @IsInt()
  @Min(1)
  @Max(1440)
  cookTimeMinutes!: number;

  @ApiPropertyOptional({ example: 'easy', enum: RECIPE_DIFFICULTIES })
  @IsOptional()
  @IsIn(RECIPE_DIFFICULTIES)
  difficulty?: (typeof RECIPE_DIFFICULTIES)[number];

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  servings?: number;

  @ApiProperty({ type: [RecipeIngredientDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  ingredients!: RecipeIngredientDto[];

  @ApiProperty({ example: ['So che nguyen lieu', 'Xao tren lua lon'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  steps!: string[];

  @ApiPropertyOptional({ type: RecipeNutritionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecipeNutritionDto)
  nutrition?: RecipeNutritionDto;

  @ApiPropertyOptional({ example: ['quick', 'dinner'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 'approved', enum: RECIPE_STATUSES })
  @IsOptional()
  @IsIn(RECIPE_STATUSES)
  status?: (typeof RECIPE_STATUSES)[number];
}

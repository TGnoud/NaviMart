import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsMongoId, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class ListFoodsQueryDto {
  @ApiPropertyOptional({ description: 'Only foods in this category.' })
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @ApiPropertyOptional({
    example: 'thit bo',
    description: 'Case-insensitive search on name, normalized name, and aliases.',
  })
  @IsOptional()
  @IsString()
  @Length(1, 150)
  q?: string;

  @ApiPropertyOptional({
    example: '8934673009012',
    description: 'Exact barcode match.',
  })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  barcode?: string;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 50, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

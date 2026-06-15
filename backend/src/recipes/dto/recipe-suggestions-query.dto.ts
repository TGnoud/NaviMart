import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class RecipeSuggestionsQueryDto {
  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;

  @ApiPropertyOptional({
    example: 0.5,
    description: 'Minimum matched/total ingredient ratio (0-1).',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  minMatch?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Rank recipes using soon-to-expire pantry items higher.',
  })
  @IsOptional()
  // Type(() => Boolean) would turn the query string 'false' into true.
  @Transform(({ value }) =>
    value === undefined ? undefined : value === true || value === 'true' || value === '1',
  )
  @IsBoolean()
  prioritizeExpiring?: boolean;
}

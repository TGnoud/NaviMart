import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Rau củ' })
  @IsString()
  @Length(1, 100)
  name!: string;

  @ApiPropertyOptional({
    example: 'rau-cu',
    description: 'Generated from name when omitted.',
  })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @ApiPropertyOptional({ example: 'Rau củ tươi theo mùa.' })
  @IsOptional()
  @IsString()
  @Length(1, 300)
  description?: string;

  @ApiPropertyOptional({ example: 'leaf' })
  @IsOptional()
  @IsString()
  @Length(1, 32)
  icon?: string;
}

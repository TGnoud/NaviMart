import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  USER_INPUT_LOG_SOURCES,
  USER_INPUT_LOG_STATUSES,
} from '../schemas/user-input-log.schema';

export class ListUserInputLogsQueryDto {
  @ApiPropertyOptional({ enum: USER_INPUT_LOG_STATUSES })
  @IsOptional()
  @IsIn(USER_INPUT_LOG_STATUSES)
  status?: (typeof USER_INPUT_LOG_STATUSES)[number];

  @ApiPropertyOptional({ enum: USER_INPUT_LOG_SOURCES })
  @IsOptional()
  @IsIn(USER_INPUT_LOG_SOURCES)
  source?: (typeof USER_INPUT_LOG_SOURCES)[number];

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}

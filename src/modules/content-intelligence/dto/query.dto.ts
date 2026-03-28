import { IsOptional, IsString, IsInt, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InsightType } from '../interfaces/insight-type.enum';
import { InsightStatus } from '../interfaces/insight-status.enum';

export class InsightsQueryDto {
  @ApiPropertyOptional({ description: 'Fecha YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Tipo de insight',
    enum: InsightType,
  })
  @IsOptional()
  @IsEnum(InsightType)
  type?: InsightType;

  @ApiPropertyOptional({
    description: 'Estado del insight',
    enum: InsightStatus,
  })
  @IsOptional()
  @IsEnum(InsightStatus)
  status?: InsightStatus;

  @ApiPropertyOptional({ description: 'Página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Resultados por página',
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}

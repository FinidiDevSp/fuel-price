import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StatsQueryDto {
  @ApiPropertyOptional({ description: 'Código del combustible (G95E5, GOA, etc.)' })
  @IsOptional()
  @IsString()
  fuel?: string;

  @ApiPropertyOptional({ description: 'Slug de la región' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: 'Número de días hacia atrás', default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  days?: number = 30;
}

export class TopMoversQueryDto {
  @ApiPropertyOptional({ description: 'Código del combustible', default: 'G95E5' })
  @IsOptional()
  @IsString()
  fuel?: string = 'G95E5';

  @ApiPropertyOptional({ description: 'Número de resultados', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

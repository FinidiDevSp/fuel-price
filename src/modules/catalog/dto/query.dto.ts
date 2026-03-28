import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;
}

export class StationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Slug de la comunidad autónoma' })
  @IsOptional()
  @IsString()
  community?: string;

  @ApiPropertyOptional({ description: 'Slug de la provincia' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ description: 'Slug de la marca' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'Código de combustible (G95E5, GOA, etc.)' })
  @IsOptional()
  @IsString()
  fuel?: string;

  @ApiPropertyOptional({ description: 'Texto de búsqueda (nombre, dirección, localidad)' })
  @IsOptional()
  @IsString()
  q?: string;
}

export class NearbyQueryDto {
  @ApiPropertyOptional({ description: 'Latitud' })
  @Type(() => Number)
  lat!: number;

  @ApiPropertyOptional({ description: 'Longitud' })
  @Type(() => Number)
  lng!: number;

  @ApiPropertyOptional({ description: 'Radio en km', default: 10 })
  @IsOptional()
  @Type(() => Number)
  radius: number = 10;

  @ApiPropertyOptional({ description: 'Código de combustible' })
  @IsOptional()
  @IsString()
  fuel?: string;

  @ApiPropertyOptional({ default: 20, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;
}

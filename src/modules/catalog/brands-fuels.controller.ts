import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';

@ApiTags('Marcas')
@Controller('brands')
export class BrandsController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las marcas de estaciones' })
  @ApiResponse({ status: 200, description: 'Lista de marcas' })
  async getBrands() {
    const data = await this.catalogService.getBrands();
    return { data };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Obtener una marca por slug' })
  @ApiParam({ name: 'slug', description: 'Slug de la marca' })
  @ApiResponse({ status: 200, description: 'Detalle de la marca' })
  async getBrand(@Param('slug') slug: string) {
    const data = await this.catalogService.getBrandBySlug(slug);
    if (!data) return { data: null, error: 'Marca no encontrada' };
    return { data };
  }
}

@ApiTags('Combustibles')
@Controller('fuel-types')
export class FuelTypesController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'Listar tipos de combustible activos' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de combustible' })
  async getFuelTypes() {
    const data = await this.catalogService.getFuelTypes();
    return { data };
  }

  @Get(':code')
  @ApiOperation({ summary: 'Obtener un tipo de combustible por código' })
  @ApiParam({ name: 'code', description: 'Código del combustible (G95E5, GOA, etc.)' })
  @ApiResponse({ status: 200, description: 'Detalle del combustible' })
  async getFuelType(@Param('code') code: string) {
    const data = await this.catalogService.getFuelTypeByCode(code);
    if (!data) return { data: null, error: 'Combustible no encontrado' };
    return { data };
  }
}

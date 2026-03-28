import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';

@ApiTags('Regiones')
@Controller('regions')
export class RegionsController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('communities')
  @ApiOperation({ summary: 'Listar comunidades autónomas' })
  @ApiResponse({ status: 200, description: 'Lista de comunidades' })
  async getCommunities() {
    const data = await this.catalogService.getCommunities();
    return { data };
  }

  @Get('provinces')
  @ApiOperation({
    summary: 'Listar provincias (opcionalmente filtrar por comunidad)',
  })
  @ApiResponse({ status: 200, description: 'Lista de provincias' })
  async getProvinces(@Query('community') community?: string) {
    const data = await this.catalogService.getProvinces(community);
    return { data };
  }

  @Get('municipalities/:provinceSlug')
  @ApiOperation({ summary: 'Listar municipios de una provincia' })
  @ApiParam({ name: 'provinceSlug', description: 'Slug de la provincia' })
  @ApiResponse({ status: 200, description: 'Lista de municipios' })
  async getMunicipalities(@Param('provinceSlug') provinceSlug: string) {
    const data = await this.catalogService.getMunicipalities(provinceSlug);
    return { data };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Obtener una región por slug' })
  @ApiParam({ name: 'slug', description: 'Slug de la región' })
  @ApiResponse({ status: 200, description: 'Detalle de la región' })
  @ApiResponse({ status: 404, description: 'Región no encontrada' })
  async getRegion(@Param('slug') slug: string) {
    const data = await this.catalogService.getRegionBySlug(slug);
    if (!data) return { data: null, error: 'Región no encontrada' };
    return { data };
  }
}

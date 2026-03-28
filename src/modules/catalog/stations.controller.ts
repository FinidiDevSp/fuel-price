import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import {
  StationQueryDto,
  NearbyQueryDto,
  StationHistoryQueryDto,
} from './dto/query.dto';

@ApiTags('Estaciones')
@Controller('stations')
export class StationsController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar estaciones con filtros y paginación',
    description:
      'Filtrar por comunidad, provincia, marca, combustible o búsqueda libre',
  })
  @ApiResponse({ status: 200, description: 'Lista paginada de estaciones' })
  async getStations(@Query() query: StationQueryDto) {
    return this.catalogService.getStations(query);
  }

  @Get('nearby')
  @ApiOperation({
    summary: 'Buscar estaciones cercanas por coordenadas',
    description: 'Fórmula Haversine para calcular distancia en km',
  })
  @ApiResponse({
    status: 200,
    description: 'Estaciones ordenadas por distancia',
  })
  async getNearby(@Query() query: NearbyQueryDto) {
    const data = await this.catalogService.getNearbyStations(query);
    return { data };
  }

  @Get(':slug/history')
  @ApiOperation({
    summary: 'Serie temporal de precios de una estación',
    description: 'Historial de precios agrupado por día',
  })
  @ApiParam({ name: 'slug', description: 'Slug de la estación' })
  @ApiResponse({ status: 200, description: 'Historial de precios' })
  @ApiResponse({ status: 404, description: 'Estación no encontrada' })
  async getStationHistory(
    @Param('slug') slug: string,
    @Query() query: StationHistoryQueryDto,
  ) {
    const station = await this.catalogService.getStationBySlug(slug);
    if (!station) return { data: null, error: 'Estación no encontrada' };

    const data = await this.catalogService.getStationHistory(
      station.id,
      query.fuel ?? 'G95E5',
      query.days ?? 30,
    );
    return { data };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Obtener detalle de una estación por slug' })
  @ApiParam({ name: 'slug', description: 'Slug de la estación' })
  @ApiResponse({
    status: 200,
    description: 'Detalle de la estación con precios',
  })
  @ApiResponse({ status: 404, description: 'Estación no encontrada' })
  async getStation(@Param('slug') slug: string) {
    const station = await this.catalogService.getStationBySlug(slug);
    if (!station) return { data: null, error: 'Estación no encontrada' };

    const prices = await this.catalogService.getStationPrices(station.id);
    return { data: { ...station, currentPrices: prices } };
  }
}

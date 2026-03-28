import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PricingAnalyticsService } from './pricing-analytics.service';
import { StatsQueryDto, TopMoversQueryDto } from './dto/query.dto';

@ApiTags('Analítica')
@Controller('analytics')
export class PricingAnalyticsController {
  constructor(
    private readonly analyticsService: PricingAnalyticsService,
  ) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Resumen nacional de precios por combustible',
    description: 'Media, mínimo, máximo y nº de estaciones por tipo de combustible',
  })
  @ApiResponse({ status: 200, description: 'Resumen nacional' })
  async getNationalSummary() {
    const data = await this.analyticsService.getNationalSummary();
    return { data, timestamp: new Date().toISOString() };
  }

  @Get('rankings/communities')
  @ApiOperation({
    summary: 'Ranking de comunidades autónomas por precio medio',
    description: 'Ordenado de más barata a más cara',
  })
  @ApiQuery({ name: 'fuel', required: false, description: 'Código combustible (default: G95E5)' })
  @ApiResponse({ status: 200, description: 'Ranking de comunidades' })
  async getRankingCommunities(@Query('fuel') fuel?: string) {
    const fuelCode = fuel || 'G95E5';
    const data = await this.analyticsService.getRankingByCommunities(fuelCode);
    return { data, fuelCode, timestamp: new Date().toISOString() };
  }

  @Get('rankings/provinces')
  @ApiOperation({
    summary: 'Ranking de provincias por precio medio',
  })
  @ApiQuery({ name: 'fuel', required: false })
  @ApiQuery({ name: 'community', required: false, description: 'Filtrar por slug de comunidad' })
  @ApiResponse({ status: 200, description: 'Ranking de provincias' })
  async getRankingProvinces(
    @Query('fuel') fuel?: string,
    @Query('community') community?: string,
  ) {
    const fuelCode = fuel || 'G95E5';
    const data = await this.analyticsService.getRankingByProvinces(
      fuelCode,
      community,
    );
    return { data, fuelCode, timestamp: new Date().toISOString() };
  }

  @Get('top-movers')
  @ApiOperation({
    summary: 'Estaciones con mayor variación de precio en las últimas 24h',
  })
  @ApiResponse({ status: 200, description: 'Top movers' })
  async getTopMovers(@Query() query: TopMoversQueryDto) {
    const data = await this.analyticsService.getTopMovers(
      query.fuel ?? 'G95E5',
      query.limit ?? 10,
    );
    return { data, timestamp: new Date().toISOString() };
  }

  @Get('series')
  @ApiOperation({
    summary: 'Serie temporal de precios por combustible y región',
    description: 'Devuelve evolución diaria de medias, mín, máx y desviación',
  })
  @ApiResponse({ status: 200, description: 'Serie temporal' })
  async getTimeSeries(@Query() query: StatsQueryDto) {
    const data = await this.analyticsService.getTimeSeries(
      query.fuel || 'G95E5',
      query.region,
      query.days,
    );
    return { data, timestamp: new Date().toISOString() };
  }

  @Post('calculate-daily')
  @ApiOperation({
    summary: 'Forzar cálculo de agregados diarios (uso manual/debug)',
    description: 'Recalcula medias, rankings y variaciones para hoy',
  })
  @ApiQuery({ name: 'date', required: false, description: 'Fecha YYYY-MM-DD (default: hoy)' })
  @ApiResponse({ status: 201, description: 'Cálculo completado' })
  async calculateDailyStats(@Query('date') date?: string) {
    const count = await this.analyticsService.calculateDailyStats(date);
    return {
      message: `Agregados diarios calculados: ${count} registros`,
      date: date || new Date().toISOString().split('T')[0],
    };
  }
}

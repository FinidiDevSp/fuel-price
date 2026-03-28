import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { SearchQueryDto } from './dto/query.dto';

@ApiTags('Búsqueda')
@Controller('search')
export class SearchController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @ApiOperation({
    summary: 'Búsqueda unificada de estaciones, regiones y marcas',
    description: 'Busca por nombre en estaciones, regiones y marcas',
  })
  @ApiResponse({ status: 200, description: 'Resultados de búsqueda' })
  async search(@Query() query: SearchQueryDto) {
    const data = await this.catalogService.search(query.q, query.limit ?? 10);
    return { data, timestamp: new Date().toISOString() };
  }
}

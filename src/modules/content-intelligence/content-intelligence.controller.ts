import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseIntPipe,
  NotFoundException,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ContentIntelligenceService } from './content-intelligence.service';
import { InsightsQueryDto } from './dto/query.dto';

@ApiTags('Insights')
@Controller('insights')
export class ContentIntelligenceController {
  constructor(private readonly service: ContentIntelligenceService) {}

  @Get()
  @ApiOperation({ summary: 'Listar insights con filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de insights',
  })
  async findAll(@Query() query: InsightsQueryDto) {
    return this.service.findAll(query);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Últimos insights publicados' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Insights recientes publicados',
  })
  async findLatest(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    return this.service.findLatestPublished(limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un insight' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Insight encontrado' })
  @ApiResponse({ status: 404, description: 'Insight no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const insight = await this.service.findOne(id);
    if (!insight) {
      throw new NotFoundException(`Insight #${id} no encontrado`);
    }
    return insight;
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generar insights manualmente' })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Fecha YYYY-MM-DD',
  })
  @ApiResponse({ status: 201, description: 'Insights generados' })
  async generate(@Query('date') date?: string) {
    const insights = await this.service.generateInsights(date);
    return {
      generated: insights.length,
      insights,
    };
  }
}

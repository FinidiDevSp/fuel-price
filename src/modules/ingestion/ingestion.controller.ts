import { Controller, Post, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IngestionService } from './ingestion.service';
import { IngestionRun } from './entities/ingestion-run.entity';

@ApiTags('Ingesta')
@Controller('ingestion')
export class IngestionController {
  private readonly logger = new Logger(IngestionController.name);

  constructor(
    private readonly ingestionService: IngestionService,
    @InjectRepository(IngestionRun)
    private readonly runRepo: Repository<IngestionRun>,
  ) {}

  @Post('run')
  @ApiOperation({
    summary: 'Ejecutar ingesta manualmente',
    description: 'Lanza un ciclo completo de ingesta de precios desde la API del Ministerio',
  })
  @ApiResponse({ status: 201, description: 'Ingesta completada' })
  @ApiResponse({ status: 500, description: 'Error en la ingesta' })
  async triggerIngestion() {
    this.logger.log('Ingesta manual solicitada');
    const run = await this.ingestionService.runFullIngestion();
    return {
      runId: run.id,
      status: run.status,
      recordsReceived: run.recordsReceived,
      recordsInserted: run.recordsInserted,
      recordsUpdated: run.recordsUpdated,
      recordsIgnored: run.recordsIgnored,
      errorCount: run.errorCount,
      duration: run.finishedAt
        ? `${(run.finishedAt.getTime() - run.startedAt.getTime()) / 1000}s`
        : null,
    };
  }

  @Get('runs')
  @ApiOperation({
    summary: 'Listar últimas ejecuciones de ingesta',
  })
  @ApiResponse({ status: 200, description: 'Lista de ejecuciones' })
  async listRuns() {
    const runs = await this.runRepo.find({
      order: { startedAt: 'DESC' },
      take: 20,
    });
    return { data: runs };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { IngestionService } from './ingestion.service';

@Injectable()
export class IngestionScheduler {
  private readonly logger = new Logger(IngestionScheduler.name);
  private readonly enabled: boolean;

  constructor(
    private readonly ingestionService: IngestionService,
    private readonly config: ConfigService,
  ) {
    this.enabled = this.config.get<boolean>('ingestion.enabled', true);
  }

  /**
   * Job programado de ingesta.
   * Por defecto se ejecuta cada 30 minutos de 7h a 22h.
   * Se puede desactivar con INGESTION_ENABLED=false.
   */
  @Cron(process.env['INGESTION_CRON'] || '0 */30 7-22 * * *', {
    name: 'fuel-price-ingestion',
    timeZone: 'Europe/Madrid',
  })
  async handleIngestionCron(): Promise<void> {
    if (!this.enabled) {
      this.logger.debug('Ingesta desactivada por configuración');
      return;
    }

    this.logger.log('Ejecutando ingesta programada...');

    try {
      const run = await this.ingestionService.runFullIngestion();
      this.logger.log(
        `Ingesta programada completada (run #${run.id}, status: ${run.status})`,
      );
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Ingesta programada fallida: ${errMsg}`);
    }
  }
}

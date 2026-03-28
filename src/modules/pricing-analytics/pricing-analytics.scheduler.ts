import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PricingAnalyticsService } from './pricing-analytics.service';

@Injectable()
export class PricingAnalyticsScheduler {
  private readonly logger = new Logger(PricingAnalyticsScheduler.name);

  constructor(
    private readonly analyticsService: PricingAnalyticsService,
  ) {}

  /**
   * Recalcula agregados diarios cada día a las 23:30 (hora Madrid).
   * Se ejecuta al final del día para tener el máximo de datos.
   */
  @Cron('0 30 23 * * *', {
    name: 'daily-stats-calculation',
    timeZone: 'Europe/Madrid',
  })
  async handleDailyStats(): Promise<void> {
    this.logger.log('Ejecutando cálculo de agregados diarios...');
    try {
      const count = await this.analyticsService.calculateDailyStats();
      this.logger.log(`Agregados diarios generados: ${count} registros`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error en cálculo de agregados: ${errMsg}`);
    }
  }
}

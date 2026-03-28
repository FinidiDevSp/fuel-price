import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ContentIntelligenceService } from './content-intelligence.service';

@Injectable()
export class ContentIntelligenceScheduler {
  private readonly logger = new Logger(ContentIntelligenceScheduler.name);

  constructor(private readonly service: ContentIntelligenceService) {}

  /**
   * Genera insights diarios a las 23:45 (hora Madrid).
   * Se ejecuta 15 minutos después del cálculo de agregados diarios (23:30).
   */
  @Cron('0 45 23 * * *', {
    name: 'daily-insight-generation',
    timeZone: 'Europe/Madrid',
  })
  async handleDailyInsightGeneration(): Promise<void> {
    this.logger.log('Ejecutando generación de insights diarios...');
    try {
      const insights = await this.service.generateInsights();
      this.logger.log(`Insights generados: ${insights.length}`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error generando insights: ${errMsg}`);
    }
  }
}

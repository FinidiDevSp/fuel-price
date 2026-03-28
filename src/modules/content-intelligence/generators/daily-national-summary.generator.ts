import { Injectable } from '@nestjs/common';
import { PricingAnalyticsService } from '@modules/pricing-analytics/pricing-analytics.service';
import { InsightTemplateEngine } from '../templates/insight-template.engine';
import { InsightScoringService } from '../scoring/insight-scoring.service';
import {
  InsightGenerator,
  RawInsightData,
} from '../interfaces/insight-generator.interface';
import { InsightType } from '../interfaces/insight-type.enum';

const KEY_FUELS = ['G95E5', 'GOA'];

@Injectable()
export class DailyNationalSummaryGenerator implements InsightGenerator {
  readonly type = InsightType.DAILY_NATIONAL_SUMMARY;

  constructor(
    private readonly analyticsService: PricingAnalyticsService,
    private readonly templateEngine: InsightTemplateEngine,
    private readonly scoringService: InsightScoringService,
  ) {}

  async generate(_date: string): Promise<RawInsightData[]> {
    const summary = await this.analyticsService.getNationalSummary();
    const insights: RawInsightData[] = [];

    for (const fuelCode of KEY_FUELS) {
      const fuel = summary.find((s) => s.fuelCode === fuelCode);
      if (!fuel) continue;

      // Obtener serie de 2 días para comparar con ayer
      const series = await this.analyticsService.getTimeSeries(
        fuelCode,
        undefined,
        2,
      );
      const yesterday = series.length >= 2 ? series[series.length - 2] : null;

      let changeVsPrevDayPct: number | null = null;
      let changeDirection: 'up' | 'down' | 'unchanged' = 'unchanged';

      if (yesterday?.avgPrice) {
        const prevAvg = parseFloat(yesterday.avgPrice);
        if (prevAvg !== 0) {
          changeVsPrevDayPct = parseFloat(
            (((fuel.avgPrice - prevAvg) / prevAvg) * 100).toFixed(2),
          );
          changeDirection =
            changeVsPrevDayPct > 0
              ? 'up'
              : changeVsPrevDayPct < 0
                ? 'down'
                : 'unchanged';
        }
      }

      const templateData: Record<string, unknown> = {
        fuelCode,
        fuelName: fuel.fuelName,
        avgPrice: fuel.avgPrice,
        changeVsPrevDayPct:
          changeVsPrevDayPct !== null ? Math.abs(changeVsPrevDayPct) : null,
        changeWord: changeDirection === 'up' ? 'más' : 'menos',
        changeDirection,
        stationCount: fuel.stationCount,
      };

      const payload = { ...templateData };

      insights.push({
        type: this.type,
        title: this.templateEngine.renderTitle(this.type, templateData),
        summary: this.templateEngine.renderSummary(this.type, templateData),
        score: this.scoringService.calculateScore(this.type, payload),
        payload,
      });
    }

    return insights;
  }
}

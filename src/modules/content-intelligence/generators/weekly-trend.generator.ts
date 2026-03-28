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
const FUEL_NAMES: Record<string, string> = {
  G95E5: 'Gasolina 95',
  GOA: 'Gasóleo A',
};

@Injectable()
export class WeeklyTrendGenerator implements InsightGenerator {
  readonly type = InsightType.WEEKLY_TREND;

  constructor(
    private readonly analyticsService: PricingAnalyticsService,
    private readonly templateEngine: InsightTemplateEngine,
    private readonly scoringService: InsightScoringService,
  ) {}

  async generate(_date: string): Promise<RawInsightData[]> {
    const insights: RawInsightData[] = [];

    for (const fuelCode of KEY_FUELS) {
      const series = await this.analyticsService.getTimeSeries(
        fuelCode,
        undefined,
        14,
      );

      if (series.length < 7) continue;

      // Dividir en dos semanas
      const midpoint = Math.floor(series.length / 2);
      const prevWeek = series.slice(0, midpoint);
      const thisWeek = series.slice(midpoint);

      const prevWeekAvg = this.calculateAverage(prevWeek);
      const thisWeekAvg = this.calculateAverage(thisWeek);

      if (prevWeekAvg === 0) continue;

      const changePct = parseFloat(
        (((thisWeekAvg - prevWeekAvg) / prevWeekAvg) * 100).toFixed(2),
      );
      const changeDirection: 'up' | 'down' | 'unchanged' =
        changePct > 0 ? 'up' : changePct < 0 ? 'down' : 'unchanged';

      const templateData: Record<string, unknown> = {
        fuelCode,
        fuelName: FUEL_NAMES[fuelCode] ?? fuelCode,
        weekStartAvg: prevWeekAvg,
        weekEndAvg: thisWeekAvg,
        changePct: Math.abs(changePct),
        changeDirection,
        changeWord: changeDirection === 'up' ? 'subido' : 'bajado',
        daysAnalyzed: series.length,
      };

      insights.push({
        type: this.type,
        title: this.templateEngine.renderTitle(this.type, templateData),
        summary: this.templateEngine.renderSummary(this.type, templateData),
        score: this.scoringService.calculateScore(this.type, {
          changePct,
        }),
        payload: { ...templateData },
      });
    }

    return insights;
  }

  private calculateAverage(series: Array<{ avgPrice: string }>): number {
    if (series.length === 0) return 0;
    const sum = series.reduce((acc, s) => acc + parseFloat(s.avgPrice), 0);
    return parseFloat((sum / series.length).toFixed(4));
  }
}

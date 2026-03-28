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
export class BiggestPriceDropGenerator implements InsightGenerator {
  readonly type = InsightType.BIGGEST_PRICE_DROP;

  constructor(
    private readonly analyticsService: PricingAnalyticsService,
    private readonly templateEngine: InsightTemplateEngine,
    private readonly scoringService: InsightScoringService,
  ) {}

  async generate(_date: string): Promise<RawInsightData[]> {
    const insights: RawInsightData[] = [];

    for (const fuelCode of KEY_FUELS) {
      const movers = await this.analyticsService.getTopMovers(fuelCode, 20);
      const drops = movers.filter((m) => m.direction === 'down');
      if (drops.length === 0) continue;

      // La mayor bajada en valor absoluto
      const biggest = drops[0];

      const templateData: Record<string, unknown> = {
        stationName: biggest.stationName,
        brandName: biggest.brandName,
        provinceName: biggest.provinceName,
        deltaAbs: (Math.abs(parseFloat(biggest.deltaAbs)) * 100).toFixed(1),
        deltaPct: Math.abs(parseFloat(biggest.deltaPct)).toFixed(2),
        previousPrice: biggest.previousPrice,
        newPrice: biggest.newPrice,
        fuelCode,
      };

      insights.push({
        type: this.type,
        title: this.templateEngine.renderTitle(this.type, templateData),
        summary: this.templateEngine.renderSummary(this.type, templateData),
        score: this.scoringService.calculateScore(this.type, {
          deltaAbs: biggest.deltaAbs,
        }),
        payload: { ...templateData },
      });
    }

    return insights;
  }
}

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
export class CheapestRegionGenerator implements InsightGenerator {
  readonly type = InsightType.CHEAPEST_REGION;

  constructor(
    private readonly analyticsService: PricingAnalyticsService,
    private readonly templateEngine: InsightTemplateEngine,
    private readonly scoringService: InsightScoringService,
  ) {}

  async generate(_date: string): Promise<RawInsightData[]> {
    const nationalSummary = await this.analyticsService.getNationalSummary();
    const insights: RawInsightData[] = [];

    for (const fuelCode of KEY_FUELS) {
      const national = nationalSummary.find((s) => s.fuelCode === fuelCode);
      if (!national) continue;

      const ranking =
        await this.analyticsService.getRankingByCommunities(fuelCode);
      if (ranking.length === 0) continue;

      const cheapest = ranking[0];
      const savingsVsNational = parseFloat(
        (national.avgPrice - cheapest.avgPrice).toFixed(4),
      );

      const templateData: Record<string, unknown> = {
        fuelCode,
        fuelName: national.fuelName,
        regionName: cheapest.regionName,
        avgPrice: cheapest.avgPrice,
        nationalAvg: national.avgPrice,
        savingsVsNational,
      };

      insights.push({
        type: this.type,
        title: this.templateEngine.renderTitle(this.type, templateData),
        summary: this.templateEngine.renderSummary(this.type, templateData),
        score: this.scoringService.calculateScore(this.type, templateData),
        payload: { ...templateData },
      });
    }

    return insights;
  }
}

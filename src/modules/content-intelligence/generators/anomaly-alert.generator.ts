import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Not, IsNull } from 'typeorm';
import { PriceChangeEvent } from '@modules/pricing-analytics/entities/price-change-event.entity';
import { InsightTemplateEngine } from '../templates/insight-template.engine';
import { InsightScoringService } from '../scoring/insight-scoring.service';
import {
  InsightGenerator,
  RawInsightData,
} from '../interfaces/insight-generator.interface';
import { InsightType } from '../interfaces/insight-type.enum';

const MAX_ANOMALIES = 3;
const MIN_ANOMALY_SCORE = 70;

@Injectable()
export class AnomalyAlertGenerator implements InsightGenerator {
  readonly type = InsightType.ANOMALY_ALERT;

  constructor(
    @InjectRepository(PriceChangeEvent)
    private readonly changeEventRepo: Repository<PriceChangeEvent>,
    private readonly templateEngine: InsightTemplateEngine,
    private readonly scoringService: InsightScoringService,
  ) {}

  async generate(_date: string): Promise<RawInsightData[]> {
    const since = new Date();
    since.setHours(since.getHours() - 24);

    const events = await this.changeEventRepo.find({
      where: {
        detectedAt: MoreThan(since),
        anomalyScore: Not(IsNull()),
      },
      relations: ['station', 'station.brand', 'regionProvince', 'fuelType'],
      order: {
        anomalyScore: 'DESC',
      },
      take: MAX_ANOMALIES * 2,
    });

    const anomalies = events.filter(
      (ev) =>
        ev.anomalyScore !== null &&
        parseFloat(ev.anomalyScore) >= MIN_ANOMALY_SCORE,
    );

    const insights: RawInsightData[] = [];

    for (const ev of anomalies.slice(0, MAX_ANOMALIES)) {
      const templateData: Record<string, unknown> = {
        stationName: ev.station?.name ?? 'Estación desconocida',
        brandName: ev.station?.brand?.name ?? null,
        provinceName: ev.regionProvince?.name ?? null,
        anomalyScore: parseFloat(ev.anomalyScore!),
        deltaAbs: (Math.abs(parseFloat(ev.deltaAbs)) * 100).toFixed(1),
        deltaPct: Math.abs(parseFloat(ev.deltaPct)).toFixed(2),
        fuelCode: ev.fuelType?.code ?? 'N/A',
      };

      insights.push({
        type: this.type,
        title: this.templateEngine.renderTitle(this.type, templateData),
        summary: this.templateEngine.renderSummary(this.type, templateData),
        score: this.scoringService.calculateScore(this.type, {
          anomalyScore: parseFloat(ev.anomalyScore!),
        }),
        payload: { ...templateData },
      });
    }

    return insights;
  }
}

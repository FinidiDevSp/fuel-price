import { Injectable } from '@nestjs/common';
import { InsightType } from '../interfaces/insight-type.enum';

@Injectable()
export class InsightScoringService {
  calculateScore(type: InsightType, payload: Record<string, unknown>): number {
    let score: number;

    switch (type) {
      case InsightType.DAILY_NATIONAL_SUMMARY:
        score = this.scoreDailyNational(payload);
        break;
      case InsightType.CHEAPEST_REGION:
        score = this.scoreCheapestRegion(payload);
        break;
      case InsightType.BIGGEST_PRICE_DROP:
        score = this.scorePriceChange(60, payload);
        break;
      case InsightType.BIGGEST_PRICE_RISE:
        score = this.scorePriceChange(65, payload);
        break;
      case InsightType.WEEKLY_TREND:
        score = this.scoreWeeklyTrend(payload);
        break;
      case InsightType.ANOMALY_ALERT:
        score = this.scoreAnomaly(payload);
        break;
      default:
        score = 50;
    }

    return Math.min(Math.max(score, 0), 99.99);
  }

  private scoreDailyNational(payload: Record<string, unknown>): number {
    const base = 50;
    const changePct = Math.abs(Number(payload['changeVsPrevDayPct']) || 0);
    const bonus = changePct > 2 ? 15 : 0;
    return base + changePct * 10 + bonus;
  }

  private scoreCheapestRegion(payload: Record<string, unknown>): number {
    const base = 40;
    const savings = Math.abs(Number(payload['savingsVsNational']) || 0);
    return base + savings * 500; // 0.01€ = +5 puntos
  }

  private scorePriceChange(
    base: number,
    payload: Record<string, unknown>,
  ): number {
    const deltaAbs = Math.abs(parseFloat(String(payload['deltaAbs'] ?? '0')));
    const deltaCents = deltaAbs * 100;
    const bonus = deltaCents > 5 ? 10 : 0;
    return base + deltaCents * 5 + bonus;
  }

  private scoreWeeklyTrend(payload: Record<string, unknown>): number {
    const base = 55;
    const changePct = Math.abs(Number(payload['changePct']) || 0);
    return base + changePct * 10;
  }

  private scoreAnomaly(payload: Record<string, unknown>): number {
    const base = 70;
    const anomalyScore = Number(payload['anomalyScore']) || 0;
    const bonus = anomalyScore > 80 ? 10 : 0;
    return base + anomalyScore * 0.2 + bonus;
  }
}

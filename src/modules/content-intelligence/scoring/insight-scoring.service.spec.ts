import { InsightScoringService } from './insight-scoring.service';
import { InsightType } from '../interfaces/insight-type.enum';

describe('InsightScoringService', () => {
  let service: InsightScoringService;

  beforeEach(() => {
    service = new InsightScoringService();
  });

  describe('calculateScore', () => {
    it('debe estar definido', () => {
      expect(service).toBeDefined();
    });

    it('debe asignar puntuación base de 50 para daily_national_summary sin cambio', () => {
      const score = service.calculateScore(
        InsightType.DAILY_NATIONAL_SUMMARY,
        { changeVsPrevDayPct: 0 },
      );
      expect(score).toBe(50);
    });

    it('debe aumentar puntuación para cambios diarios mayores', () => {
      const score = service.calculateScore(
        InsightType.DAILY_NATIONAL_SUMMARY,
        { changeVsPrevDayPct: 1.5 },
      );
      expect(score).toBeGreaterThan(50);
      expect(score).toBe(50 + 1.5 * 10);
    });

    it('debe añadir bonus de 15 para cambios mayores al 2%', () => {
      const score = service.calculateScore(
        InsightType.DAILY_NATIONAL_SUMMARY,
        { changeVsPrevDayPct: 3 },
      );
      expect(score).toBe(50 + 3 * 10 + 15);
    });

    it('debe asignar puntuación base de 40 para cheapest_region', () => {
      const score = service.calculateScore(
        InsightType.CHEAPEST_REGION,
        { savingsVsNational: 0 },
      );
      expect(score).toBe(40);
    });

    it('debe puntuar más alto regiones con mayor ahorro', () => {
      const score = service.calculateScore(
        InsightType.CHEAPEST_REGION,
        { savingsVsNational: 0.05 },
      );
      expect(score).toBeGreaterThan(40);
    });

    it('debe puntuar bajadas de precio con base 60', () => {
      const score = service.calculateScore(
        InsightType.BIGGEST_PRICE_DROP,
        { deltaAbs: '0.02' },
      );
      expect(score).toBeGreaterThanOrEqual(60);
    });

    it('debe puntuar subidas de precio con base 65', () => {
      const score = service.calculateScore(
        InsightType.BIGGEST_PRICE_RISE,
        { deltaAbs: '0.02' },
      );
      expect(score).toBeGreaterThanOrEqual(65);
    });

    it('debe puntuar anomalías con base 70', () => {
      const score = service.calculateScore(
        InsightType.ANOMALY_ALERT,
        { anomalyScore: 50 },
      );
      expect(score).toBeGreaterThanOrEqual(70);
    });

    it('debe limitar la puntuación al máximo de 99.99', () => {
      const score = service.calculateScore(
        InsightType.DAILY_NATIONAL_SUMMARY,
        { changeVsPrevDayPct: 100 },
      );
      expect(score).toBeLessThanOrEqual(99.99);
    });

    it('debe limitar la puntuación al mínimo de 0', () => {
      const score = service.calculateScore(
        InsightType.CHEAPEST_REGION,
        { savingsVsNational: -10 },
      );
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });
});

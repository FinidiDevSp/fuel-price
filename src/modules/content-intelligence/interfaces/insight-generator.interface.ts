import { InsightType } from './insight-type.enum';

export interface RawInsightData {
  type: InsightType;
  title: string;
  summary: string;
  score: number;
  payload: Record<string, unknown>;
}

export interface InsightGenerator {
  readonly type: InsightType;
  generate(date: string): Promise<RawInsightData[]>;
}

export const INSIGHT_GENERATORS = Symbol('INSIGHT_GENERATORS');

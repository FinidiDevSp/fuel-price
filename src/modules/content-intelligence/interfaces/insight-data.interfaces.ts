export interface DailyNationalSummaryPayload {
  fuelCode: string;
  fuelName: string;
  avgPrice: number;
  changeVsPrevDayPct: number | null;
  changeDirection: 'up' | 'down' | 'unchanged';
  stationCount: number;
}

export interface CheapestRegionPayload {
  fuelCode: string;
  fuelName: string;
  regionName: string;
  avgPrice: number;
  nationalAvg: number;
  savingsVsNational: number;
}

export interface BiggestPriceChangePayload {
  stationName: string;
  brandName: string | null;
  provinceName: string | null;
  deltaAbs: string;
  deltaPct: string;
  previousPrice: string;
  newPrice: string;
  fuelCode: string;
}

export interface WeeklyTrendPayload {
  fuelCode: string;
  fuelName: string;
  weekStartAvg: number;
  weekEndAvg: number;
  changePct: number;
  changeDirection: 'up' | 'down' | 'unchanged';
  daysAnalyzed: number;
}

export interface AnomalyAlertPayload {
  stationName: string;
  brandName: string | null;
  provinceName: string | null;
  anomalyScore: number;
  deltaAbs: string;
  deltaPct: string;
  fuelCode: string;
}

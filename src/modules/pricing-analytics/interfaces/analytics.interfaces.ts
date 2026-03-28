export interface RankingEntry {
  regionId: number;
  regionName: string;
  regionSlug: string;
  avgPrice: number;
  stationCount: number;
  changeVsPrevDay: number | null;
}

export interface NationalSummary {
  fuelCode: string;
  fuelName: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  stationCount: number;
}

// Tipos que reflejan las respuestas del backend API

export interface NationalSummary {
  fuelCode: string;
  fuelName: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  stationCount: number;
}

export interface RankingEntry {
  regionId: number;
  regionName: string;
  regionSlug: string;
  avgPrice: number;
  stationCount: number;
  changeVsPrevDay: number | null;
}

export interface TopMover {
  stationName: string;
  brandName: string | null;
  provinceName: string | null;
  previousPrice: string;
  newPrice: string;
  deltaAbs: string;
  deltaPct: string;
  direction: 'UP' | 'DOWN' | 'UNCHANGED';
  detectedAt: string;
}

export interface TimeSeriesPoint {
  date: string;
  avgPrice: string;
  minPrice: string;
  maxPrice: string;
  stationCount: string;
  stddevPrice: string | null;
  changeVsPrevDayAbs: string | null;
  changeVsPrevDayPct: string | null;
}

export interface HomePageData {
  summary: NationalSummary[];
  topMovers: TopMover[];
  communityRanking: RankingEntry[];
  mainSeries: TimeSeriesPoint[];
}

export interface Region {
  id: number;
  name: string;
  slug: string;
  code: string;
  type: 'COUNTRY' | 'COMMUNITY' | 'PROVINCE' | 'MUNICIPALITY';
  parentId: number | null;
  parent?: Region | null;
  children?: Region[];
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  normalizedName: string;
}

export interface FuelType {
  id: number;
  code: string;
  name: string;
  shortName: string | null;
  isActive: boolean;
}

export interface Station {
  id: number;
  externalStationId: string;
  name: string;
  slug: string;
  address: string | null;
  postalCode: string | null;
  lat: string;
  lng: string;
  openingHours: string | null;
  isActive: boolean;
  brand: Brand | null;
  regionCommunity: Region | null;
  regionProvince: Region | null;
  regionMunicipality: Region | null;
}

export interface StationCurrentPrice {
  id: number;
  price: string;
  previousPrice: string | null;
  deltaAbs: string | null;
  deltaPct: string | null;
  fuelType: FuelType;
  observedAt: string;
}

export interface StationHistoryPoint {
  date: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  observationCount: number;
}

export interface StationRankingEntry {
  stationName: string;
  stationSlug: string;
  brandName: string | null;
  provinceName: string;
  communityName: string;
  price: number;
  lastUpdated: string;
}

export interface RegionStats {
  region: Region;
  summary: NationalSummary[];
  nationalAvg: number | null;
  childRanking: RankingEntry[];
  series: TimeSeriesPoint[];
}

export interface SearchResults {
  stations: {
    name: string;
    slug: string;
    brand: string | null;
    province: string | null;
  }[];
  regions: {
    name: string;
    slug: string;
    type: string;
  }[];
  brands: {
    name: string;
    slug: string;
  }[];
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

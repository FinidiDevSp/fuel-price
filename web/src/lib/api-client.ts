import type {
  HomePageData,
  NationalSummary,
  RankingEntry,
  TopMover,
  TimeSeriesPoint,
  Station,
  StationCurrentPrice,
  StationHistoryPoint,
  StationRankingEntry,
  Region,
  RegionStats,
  Brand,
  FuelType,
  SearchResults,
  PaginatedResult,
} from './types';

// En el servidor usamos API_URL (interno), en el cliente NEXT_PUBLIC_API_URL
const API_BASE =
  typeof window === 'undefined'
    ? process.env.API_URL || 'http://localhost:3000/api'
    : process.env.NEXT_PUBLIC_API_URL || '/api';

interface FetchOptions {
  revalidate?: number | false;
  tags?: string[];
}

async function fetchApi<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const { revalidate = 300, tags } = options;

  const res = await fetch(url, {
    next: {
      revalidate: revalidate === false ? undefined : revalidate,
      tags,
    },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${url}`);
  }

  return res.json() as Promise<T>;
}

// ─── Home ────────────────────────────────────────

export function getHomePageData() {
  return fetchApi<HomePageData>('/analytics/home', {
    revalidate: 300,
    tags: ['home'],
  });
}

// ─── Analytics ───────────────────────────────────

export function getNationalSummary() {
  return fetchApi<NationalSummary[]>('/analytics/summary', {
    revalidate: 300,
    tags: ['summary'],
  });
}

export function getRankingCommunities(fuel: string) {
  return fetchApi<RankingEntry[]>(
    `/analytics/rankings/communities?fuel=${fuel}`,
    { revalidate: 300, tags: ['rankings'] },
  );
}

export function getRankingProvinces(fuel: string, community?: string) {
  const params = new URLSearchParams({ fuel });
  if (community) params.set('community', community);
  return fetchApi<RankingEntry[]>(
    `/analytics/rankings/provinces?${params.toString()}`,
    { revalidate: 300, tags: ['rankings'] },
  );
}

export function getStationRankings(params: {
  fuel?: string;
  community?: string;
  province?: string;
  order?: 'asc' | 'desc';
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params.fuel) searchParams.set('fuel', params.fuel);
  if (params.community) searchParams.set('community', params.community);
  if (params.province) searchParams.set('province', params.province);
  if (params.order) searchParams.set('order', params.order);
  if (params.limit) searchParams.set('limit', String(params.limit));
  return fetchApi<StationRankingEntry[]>(
    `/analytics/rankings/stations?${searchParams.toString()}`,
    { revalidate: 300, tags: ['rankings'] },
  );
}

export function getTopMovers(fuel: string, limit = 10) {
  return fetchApi<TopMover[]>(
    `/analytics/top-movers?fuel=${fuel}&limit=${limit}`,
    { revalidate: 300, tags: ['top-movers'] },
  );
}

export function getTimeSeries(fuel: string, region?: string, days = 30) {
  const params = new URLSearchParams({ fuel: fuel, days: String(days) });
  if (region) params.set('region', region);
  return fetchApi<TimeSeriesPoint[]>(
    `/analytics/series?${params.toString()}`,
    { revalidate: 600, tags: ['series'] },
  );
}

export function getRegionStats(slug: string, fuel = 'G95E5') {
  return fetchApi<RegionStats>(`/analytics/region/${slug}?fuel=${fuel}`, {
    revalidate: 300,
    tags: ['region-stats', slug],
  });
}

// ─── Catalog ─────────────────────────────────────

export function getCommunities() {
  return fetchApi<Region[]>('/regions/communities', {
    revalidate: 3600,
    tags: ['regions'],
  });
}

export function getProvinces(community?: string) {
  const params = community ? `?community=${community}` : '';
  return fetchApi<Region[]>(`/regions/provinces${params}`, {
    revalidate: 3600,
    tags: ['regions'],
  });
}

export function getRegionBySlug(slug: string) {
  return fetchApi<Region>(`/regions/${slug}`, {
    revalidate: 3600,
    tags: ['regions', slug],
  });
}

export function getBrands() {
  return fetchApi<Brand[]>('/brands', {
    revalidate: 3600,
    tags: ['brands'],
  });
}

export function getFuelTypes() {
  return fetchApi<FuelType[]>('/fuel-types', {
    revalidate: 3600,
    tags: ['fuel-types'],
  });
}

export function getStations(params: {
  page?: number;
  limit?: number;
  community?: string;
  province?: string;
  brand?: string;
  fuel?: string;
  q?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.community) searchParams.set('community', params.community);
  if (params.province) searchParams.set('province', params.province);
  if (params.brand) searchParams.set('brand', params.brand);
  if (params.fuel) searchParams.set('fuel', params.fuel);
  if (params.q) searchParams.set('q', params.q);
  return fetchApi<PaginatedResult<Station>>(
    `/stations?${searchParams.toString()}`,
    { revalidate: 300, tags: ['stations'] },
  );
}

export function getStationBySlug(slug: string) {
  return fetchApi<Station>(`/stations/${slug}`, {
    revalidate: 600,
    tags: ['stations', slug],
  });
}

export function getStationPrices(slug: string) {
  return fetchApi<StationCurrentPrice[]>(`/stations/${slug}/prices`, {
    revalidate: 300,
    tags: ['station-prices', slug],
  });
}

export function getStationHistory(
  slug: string,
  fuel = 'G95E5',
  days = 30,
) {
  return fetchApi<StationHistoryPoint[]>(
    `/stations/${slug}/history?fuel=${fuel}&days=${days}`,
    { revalidate: 600, tags: ['station-history', slug] },
  );
}

// ─── Search ──────────────────────────────────────

export function search(q: string, limit = 10) {
  return fetchApi<SearchResults>(
    `/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    { revalidate: 120, tags: ['search'] },
  );
}

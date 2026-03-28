// Combustibles principales para la UI
export const MAIN_FUEL_CODES = ['G95E5', 'GOA', 'G98E5', 'GOAP'] as const;

export const FUEL_LABELS: Record<string, string> = {
  G95E5: 'Gasolina 95',
  G98E5: 'Gasolina 98',
  GOA: 'Diésel',
  GOAP: 'Diésel Premium',
  GLP: 'GLP',
  GNC: 'GNC',
  B100: 'Biodiésel',
  BIE: 'Bioetanol',
  G95E10: 'Gasolina 95 E10',
  G95E5P: 'Gasolina 95 Premium',
  H2: 'Hidrógeno',
};

export const FUEL_SHORT_LABELS: Record<string, string> = {
  G95E5: 'G95',
  G98E5: 'G98',
  GOA: 'Diésel',
  GOAP: 'Diésel+',
};

export const DEFAULT_FUEL = 'G95E5';

export const TIME_RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '1A', days: 365 },
] as const;

export const DEFAULT_TIME_RANGE = 30;

export const SITE_NAME = 'Fuel Price';
export const SITE_DESCRIPTION =
  'Consulta precios de gasolina y diésel en España. Evolución, rankings por comunidad y provincia, estaciones más baratas.';

export const ROUTES = {
  home: '/',
  fuel: (code: string) => `/combustible/${code}`,
  community: (slug: string) => `/comunidad/${slug}`,
  province: (slug: string) => `/provincia/${slug}`,
  station: (slug: string) => `/estacion/${slug}`,
} as const;

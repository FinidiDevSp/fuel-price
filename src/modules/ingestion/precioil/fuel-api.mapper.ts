import { RawStation, FUEL_PRICE_FIELD_MAP } from './fuel-api.interfaces';

/** Estación normalizada lista para persistir */
export interface NormalizedStation {
  externalStationId: string;
  name: string;
  address: string;
  postalCode: string;
  lat: number;
  lng: number;
  openingHours: string;
  brandName: string;
  communityId: string;
  provinceId: string;
  municipalityId: string;
  municipalityName: string;
  provinceName: string;
  localityName: string;
  margin: string;
}

/** Precio normalizado de un combustible en una estación */
export interface NormalizedPrice {
  externalStationId: string;
  fuelCode: string;
  price: number;
}

/**
 * Convierte coordenadas con formato español (coma decimal) a número.
 * Ejemplo: "40,528028" → 40.528028
 */
function parseSpanishDecimal(value: string): number {
  if (!value || value.trim() === '') return 0;
  return parseFloat(value.replace(',', '.'));
}

/**
 * Parsea un precio del formato español a número.
 * Retorna null si el campo está vacío o no es un precio válido.
 */
function parsePrice(value: string): number | null {
  if (!value || value.trim() === '') return null;
  const parsed = parseFloat(value.replace(',', '.'));
  if (isNaN(parsed) || parsed <= 0) return null;
  return parsed;
}

/**
 * Normaliza el nombre de la marca para facilitar búsquedas.
 * Convierte a mayúsculas y elimina espacios extra.
 */
function normalizeBrandName(brand: string): string {
  return brand.trim().toUpperCase().replace(/\s+/g, ' ');
}

/**
 * Genera un slug limpio a partir de un texto.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Mapea una estación cruda de la API a datos normalizados de estación.
 */
export function mapRawStation(raw: RawStation): NormalizedStation {
  return {
    externalStationId: raw['IDEESS'].trim(),
    name: `${normalizeBrandName(raw['Rótulo'])} - ${raw['Localidad'].trim()}`,
    address: raw['Dirección'].trim(),
    postalCode: raw['C.P.'].trim(),
    lat: parseSpanishDecimal(raw['Latitud']),
    lng: parseSpanishDecimal(raw['Longitud (WGS84)']),
    openingHours: raw['Horario'].trim(),
    brandName: normalizeBrandName(raw['Rótulo']),
    communityId: raw['IDCCAA'].trim(),
    provinceId: raw['IDProvincia'].trim(),
    municipalityId: raw['IDMunicipio'].trim(),
    municipalityName: raw['Municipio'].trim(),
    provinceName: raw['Provincia'].trim(),
    localityName: raw['Localidad'].trim(),
    margin: raw['Margen'].trim(),
  };
}

/**
 * Extrae todos los precios disponibles de una estación cruda.
 * Solo devuelve precios válidos (no vacíos, positivos).
 */
export function extractPrices(raw: RawStation): NormalizedPrice[] {
  const prices: NormalizedPrice[] = [];
  const stationId = raw['IDEESS'].trim();

  for (const [apiField, fuelCode] of Object.entries(FUEL_PRICE_FIELD_MAP)) {
    const rawValue = raw[apiField as keyof RawStation];
    if (typeof rawValue !== 'string') continue;

    const price = parsePrice(rawValue);
    if (price !== null) {
      prices.push({
        externalStationId: stationId,
        fuelCode,
        price,
      });
    }
  }

  return prices;
}

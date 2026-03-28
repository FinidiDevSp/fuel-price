/**
 * Interfaces que modelan la respuesta cruda de la API del Ministerio (MITECO).
 * Fuente: https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/
 */

/** Respuesta raíz del endpoint EstacionesTerrestres */
export interface RawApiResponse {
  Fecha: string;
  ListaEESSPrecio: RawStation[];
  Nota: string;
  ResultadoConsulta: string;
}

/** Cada estación en la respuesta de la API */
export interface RawStation {
  'C.P.': string;
  'Dirección': string;
  'Horario': string;
  'Latitud': string;
  'Localidad': string;
  'Longitud (WGS84)': string;
  'Margen': string;
  'Municipio': string;
  'Provincia': string;
  'Remisión': string;
  'Rótulo': string;
  'Tipo Venta': string;
  'IDEESS': string;
  'IDMunicipio': string;
  'IDProvincia': string;
  'IDCCAA': string;

  // Campos de precios (string con coma decimal, vacío si no disponible)
  'Precio Biodiesel': string;
  'Precio Bioetanol': string;
  'Precio Gas Natural Comprimido': string;
  'Precio Gas Natural Licuado': string;
  'Precio Gases licuados del petróleo': string;
  'Precio Gasoleo A': string;
  'Precio Gasoleo B': string;
  'Precio Gasoleo Premium': string;
  'Precio Gasolina 95 E10': string;
  'Precio Gasolina 95 E5': string;
  'Precio Gasolina 95 E5 Premium': string;
  'Precio Gasolina 98 E10': string;
  'Precio Gasolina 98 E5': string;
  'Precio Hidrogeno': string;

  '% BioEtanol': string;
  '% Éster metílico': string;
}

/** Respuesta del endpoint Listados/ComunidadesAutonomas */
export interface RawCommunity {
  IDCCAA: string;
  CCAA: string;
}

/** Respuesta del endpoint Listados/Provincias */
export interface RawProvince {
  IDPovincia: string; // Sí, la API tiene un typo ("Povincia")
  Provincia: string;
  IDCCAA: string;
  CCAA: string;
}

/** Respuesta del endpoint Listados/Municipios */
export interface RawMunicipality {
  IDMunicipio: string;
  Municipio: string;
  IDProvincia: string;
  Provincia: string;
  IDCCAA: string;
  CCAA: string;
}

/** Respuesta del endpoint Listados/ProductosPetroliferos */
export interface RawFuelProduct {
  IDProducto: string;
  NombreProducto: string;
  NombreProductoAbreviatura: string;
}

/**
 * Mapa de campos de precio de la API → código interno del combustible.
 * Solo incluye los combustibles principales para la fase inicial.
 */
export const FUEL_PRICE_FIELD_MAP: Record<string, string> = {
  'Precio Gasolina 95 E5': 'G95E5',
  'Precio Gasolina 98 E5': 'G98E5',
  'Precio Gasoleo A': 'GOA',
  'Precio Gasoleo Premium': 'GOAP',
  'Precio Gasoleo B': 'GOB',
  'Precio Gasolina 95 E5 Premium': 'G95E5P',
  'Precio Gasolina 95 E10': 'G95E10',
  'Precio Gasolina 98 E10': 'G98E10',
  'Precio Gases licuados del petróleo': 'GLP',
  'Precio Gas Natural Comprimido': 'GNC',
  'Precio Gas Natural Licuado': 'GNL',
  'Precio Biodiesel': 'BIO',
  'Precio Bioetanol': 'BIOE',
  'Precio Hidrogeno': 'H2',
};

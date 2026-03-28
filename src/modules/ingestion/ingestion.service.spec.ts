import {
  mapRawStation,
  extractPrices,
  slugify,
} from './precioil/fuel-api.mapper';
import { RawStation } from './precioil/fuel-api.interfaces';

const mockRawStation: RawStation = {
  'C.P.': '28001',
  'Dirección': 'CALLE EJEMPLO 1',
  'Horario': 'L-D: 24H',
  'Latitud': '40,416775',
  'Localidad': 'MADRID',
  'Longitud (WGS84)': '-3,703790',
  'Margen': 'D',
  'Municipio': 'Madrid',
  'Provincia': 'MADRID',
  'Remisión': 'OM',
  'Rótulo': 'REPSOL',
  'Tipo Venta': 'P',
  'IDEESS': '12345',
  'IDMunicipio': '4354',
  'IDProvincia': '28',
  'IDCCAA': '13',
  'Precio Biodiesel': '',
  'Precio Bioetanol': '',
  'Precio Gas Natural Comprimido': '',
  'Precio Gas Natural Licuado': '',
  'Precio Gases licuados del petróleo': '',
  'Precio Gasoleo A': '1,459',
  'Precio Gasoleo B': '',
  'Precio Gasoleo Premium': '1,569',
  'Precio Gasolina 95 E10': '',
  'Precio Gasolina 95 E5': '1,555',
  'Precio Gasolina 95 E5 Premium': '',
  'Precio Gasolina 98 E10': '',
  'Precio Gasolina 98 E5': '1,789',
  'Precio Hidrogeno': '',
  '% BioEtanol': '0,0',
  '% Éster metílico': '0,0',
};

describe('FuelApiMapper', () => {
  describe('mapRawStation', () => {
    it('debe normalizar correctamente una estación cruda', () => {
      const result = mapRawStation(mockRawStation);

      expect(result.externalStationId).toBe('12345');
      expect(result.brandName).toBe('REPSOL');
      expect(result.lat).toBeCloseTo(40.416775, 5);
      expect(result.lng).toBeCloseTo(-3.70379, 5);
      expect(result.postalCode).toBe('28001');
      expect(result.communityId).toBe('13');
      expect(result.provinceId).toBe('28');
      expect(result.municipalityId).toBe('4354');
    });

    it('debe generar un nombre con marca y localidad', () => {
      const result = mapRawStation(mockRawStation);
      expect(result.name).toBe('REPSOL - MADRID');
    });
  });

  describe('extractPrices', () => {
    it('debe extraer solo los precios no vacíos', () => {
      const prices = extractPrices(mockRawStation);

      expect(prices.length).toBe(4);
      expect(prices.map((p) => p.fuelCode).sort()).toEqual([
        'G95E5',
        'G98E5',
        'GOA',
        'GOAP',
      ]);
    });

    it('debe parsear correctamente precios con coma decimal', () => {
      const prices = extractPrices(mockRawStation);
      const g95 = prices.find((p) => p.fuelCode === 'G95E5');

      expect(g95).toBeDefined();
      expect(g95!.price).toBeCloseTo(1.555, 3);
    });

    it('debe vincular cada precio a la estación correcta', () => {
      const prices = extractPrices(mockRawStation);

      for (const price of prices) {
        expect(price.externalStationId).toBe('12345');
      }
    });

    it('debe ignorar precios vacíos o cero', () => {
      const stationSinPrecios: RawStation = {
        ...mockRawStation,
        'Precio Gasolina 95 E5': '',
        'Precio Gasoleo A': '',
        'Precio Gasolina 98 E5': '',
        'Precio Gasoleo Premium': '',
      };

      const prices = extractPrices(stationSinPrecios);
      expect(prices.length).toBe(0);
    });
  });

  describe('slugify', () => {
    it('debe generar slugs limpios', () => {
      expect(slugify('Comunidad Valenciana')).toBe('comunidad-valenciana');
      expect(slugify('REPSOL - Madrid Centro')).toBe(
        'repsol-madrid-centro',
      );
      expect(slugify('Año 2024')).toBe('ano-2024');
    });

    it('debe eliminar acentos', () => {
      expect(slugify('Córdoba')).toBe('cordoba');
      expect(slugify('País Vasco')).toBe('pais-vasco');
    });
  });
});

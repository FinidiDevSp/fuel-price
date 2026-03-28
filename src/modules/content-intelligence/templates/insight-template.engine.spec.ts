import { InsightTemplateEngine } from './insight-template.engine';
import { InsightType } from '../interfaces/insight-type.enum';

describe('InsightTemplateEngine', () => {
  let engine: InsightTemplateEngine;

  beforeEach(() => {
    engine = new InsightTemplateEngine();
  });

  describe('render', () => {
    it('debe reemplazar placeholders simples {{key}}', () => {
      const result = engine.render('Precio: {{precio}} €/L', {
        precio: 1.456,
      });
      expect(result).toBe('Precio: 1.456 €/L');
    });

    it('debe manejar múltiples placeholders', () => {
      const result = engine.render('{{nombre}} cuesta {{precio}}', {
        nombre: 'Gasolina 95',
        precio: 1.456,
      });
      expect(result).toBe('Gasolina 95 cuesta 1.456');
    });

    it('debe devolver cadena vacía para placeholders no encontrados', () => {
      const result = engine.render('Valor: {{noExiste}}', {});
      expect(result).toBe('Valor: ');
    });

    it('debe procesar bloques condicionales {{#if}}...{{/if}} cuando el valor existe', () => {
      const result = engine.render(
        'Estación{{#if marca}} ({{marca}}){{/if}} en Madrid',
        { marca: 'Repsol' },
      );
      expect(result).toBe('Estación (Repsol) en Madrid');
    });

    it('debe omitir bloques condicionales cuando el valor es null', () => {
      const result = engine.render(
        'Estación{{#if marca}} ({{marca}}){{/if}} en Madrid',
        { marca: null },
      );
      expect(result).toBe('Estación en Madrid');
    });

    it('debe omitir bloques condicionales cuando el valor es cadena vacía', () => {
      const result = engine.render(
        'Estación{{#if marca}} ({{marca}}){{/if}} en Madrid',
        { marca: '' },
      );
      expect(result).toBe('Estación en Madrid');
    });

    it('debe formatear números grandes con 2 decimales', () => {
      const result = engine.render('Total: {{total}}', { total: 12345.6789 });
      expect(result).toBe('Total: 12345.68');
    });

    it('debe formatear números pequeños con 3 decimales', () => {
      const result = engine.render('Precio: {{precio}}', { precio: 1.4567 });
      expect(result).toBe('Precio: 1.457');
    });
  });

  describe('renderTitle', () => {
    it('debe renderizar el título de un insight de tipo daily_national_summary', () => {
      const result = engine.renderTitle(
        InsightType.DAILY_NATIONAL_SUMMARY,
        { fuelName: 'Gasolina 95', avgPrice: 1.456 },
      );
      expect(result).toContain('Gasolina 95');
      expect(result).toContain('1.456');
    });
  });

  describe('renderSummary', () => {
    it('debe renderizar el resumen de un insight con cambio diario', () => {
      const result = engine.renderSummary(
        InsightType.DAILY_NATIONAL_SUMMARY,
        {
          fuelName: 'Gasolina 95',
          avgPrice: 1.456,
          changeVsPrevDayPct: 0.8,
          changeWord: 'más',
          stationCount: 11000,
        },
      );
      expect(result).toContain('1.456');
      expect(result).toContain('más');
      expect(result).toContain('11000');
    });

    it('debe renderizar el resumen omitiendo cambio cuando no hay datos previos', () => {
      const result = engine.renderSummary(
        InsightType.DAILY_NATIONAL_SUMMARY,
        {
          fuelName: 'Gasolina 95',
          avgPrice: 1.456,
          changeVsPrevDayPct: null,
          stationCount: 11000,
        },
      );
      expect(result).not.toContain('que ayer');
    });
  });
});

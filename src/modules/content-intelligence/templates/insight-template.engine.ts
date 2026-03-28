import { Injectable } from '@nestjs/common';
import { InsightType } from '../interfaces/insight-type.enum';
import { INSIGHT_TEMPLATES } from './templates';

@Injectable()
export class InsightTemplateEngine {
  render(template: string, data: Record<string, unknown>): string {
    // 1. Procesar bloques condicionales {{#if key}}...{{/if}}
    let result = template.replace(
      /\{\{#if (\w+)\}\}(.*?)\{\{\/if\}\}/gs,
      (_match, key: string, content: string) => {
        const value = data[key];
        if (
          value !== null &&
          value !== undefined &&
          value !== '' &&
          value !== false
        ) {
          return this.replacePlaceholders(content, data);
        }
        return '';
      },
    );

    // 2. Reemplazar placeholders simples {{key}}
    result = this.replacePlaceholders(result, data);

    return result;
  }

  renderTitle(type: InsightType, data: Record<string, unknown>): string {
    const template = INSIGHT_TEMPLATES[type];
    return this.render(template.title, data);
  }

  renderSummary(type: InsightType, data: Record<string, unknown>): string {
    const template = INSIGHT_TEMPLATES[type];
    return this.render(template.summary, data);
  }

  private replacePlaceholders(
    text: string,
    data: Record<string, unknown>,
  ): string {
    return text.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
      const value = data[key];
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'number') {
        return this.formatNumber(value);
      }
      return String(value);
    });
  }

  private formatNumber(value: number): string {
    // Precios: 3 decimales; porcentajes y otros: 2 decimales
    if (Math.abs(value) < 10) {
      return value.toFixed(3);
    }
    return value.toFixed(2);
  }
}

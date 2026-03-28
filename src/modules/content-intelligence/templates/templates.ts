import { InsightType } from '../interfaces/insight-type.enum';

export interface InsightTemplate {
  title: string;
  summary: string;
}

export const INSIGHT_TEMPLATES: Record<InsightType, InsightTemplate> = {
  [InsightType.DAILY_NATIONAL_SUMMARY]: {
    title: 'Resumen diario: {{fuelName}} a {{avgPrice}} €/L',
    summary:
      'Hoy la {{fuelName}} cuesta de media {{avgPrice}} €/L{{#if changeVsPrevDayPct}}, un {{changeVsPrevDayPct}}% {{changeWord}} que ayer{{/if}}. Datos de {{stationCount}} estaciones.',
  },
  [InsightType.CHEAPEST_REGION]: {
    title: '{{regionName}}: la comunidad más barata para {{fuelName}}',
    summary:
      'La comunidad más barata para repostar {{fuelName}} es {{regionName}} con un precio medio de {{avgPrice}} €/L, {{savingsVsNational}} €/L menos que la media nacional.',
  },
  [InsightType.BIGGEST_PRICE_DROP]: {
    title: 'Mayor bajada: {{stationName}} baja {{deltaAbs}} céntimos',
    summary:
      'La mayor bajada del día: {{stationName}}{{#if brandName}} ({{brandName}}){{/if}} en {{provinceName}} ha bajado {{deltaAbs}} céntimos (de {{previousPrice}} a {{newPrice}} €/L).',
  },
  [InsightType.BIGGEST_PRICE_RISE]: {
    title: 'Alerta subida: {{stationName}} sube {{deltaAbs}} céntimos',
    summary:
      'La mayor subida del día ha sido de {{deltaAbs}} céntimos en {{stationName}}{{#if brandName}} ({{brandName}}){{/if}}, {{provinceName}} (de {{previousPrice}} a {{newPrice}} €/L).',
  },
  [InsightType.WEEKLY_TREND]: {
    title: 'Tendencia semanal: {{fuelName}} {{changeWord}} un {{changePct}}%',
    summary:
      'Esta semana la {{fuelName}} ha {{changeWord}} un {{changePct}}% respecto a la anterior (de {{weekStartAvg}} a {{weekEndAvg}} €/L). Análisis de {{daysAnalyzed}} días.',
  },
  [InsightType.ANOMALY_ALERT]: {
    title: 'Anomalía detectada en {{provinceName}}',
    summary:
      'Se detectó un movimiento inusual de precios en {{stationName}}{{#if brandName}} ({{brandName}}){{/if}}, {{provinceName}}: {{deltaAbs}} céntimos ({{deltaPct}}%). Puntuación de anomalía: {{anomalyScore}}.',
  },
};

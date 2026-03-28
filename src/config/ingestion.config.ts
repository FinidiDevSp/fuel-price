import { registerAs } from '@nestjs/config';

export default registerAs('ingestion', () => ({
  baseUrl:
    process.env['FUEL_API_BASE_URL'] ||
    'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes',
  timeout: parseInt(process.env['FUEL_API_TIMEOUT'] || '30000', 10),
  cron: process.env['INGESTION_CRON'] || '0 */30 7-22 * * *',
  enabled: process.env['INGESTION_ENABLED'] !== 'false',
}));

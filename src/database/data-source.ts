import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * DataSource para el CLI de TypeORM (migraciones).
 * Se usa exclusivamente con: npm run migration:*
 */
export default new DataSource({
  type: 'postgres',
  host: process.env['DB_HOST'] || 'localhost',
  port: parseInt(process.env['DB_PORT'] || '5432', 10),
  username: process.env['DB_USERNAME'] || 'fuel_user',
  password: process.env['DB_PASSWORD'] || 'fuel_password',
  database: process.env['DB_NAME'] || 'fuel_price',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './modules/health/health.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { PricingAnalyticsModule } from './modules/pricing-analytics/pricing-analytics.module';
import { ContentIntelligenceModule } from './modules/content-intelligence/content-intelligence.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import ingestionConfig from './config/ingestion.config';
import { RedisCacheModule } from './common/cache/redis-cache.module';

@Module({
  imports: [
    // Configuración centralizada con validación
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, ingestionConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Base de datos PostgreSQL
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.name'),
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: config.get<string>('NODE_ENV') === 'development',
        migrations: ['dist/database/migrations/*{.ts,.js}'],
        migrationsRun: config.get<string>('NODE_ENV') === 'production',
      }),
    }),

    // Tareas programadas (para ingesta periódica)
    ScheduleModule.forRoot(),

    // Cache Redis
    RedisCacheModule,

    // Módulos de la aplicación
    HealthModule,
    CatalogModule,
    IngestionModule,
    PricingAnalyticsModule,
    ContentIntelligenceModule,
    NotificationsModule,
  ],
})
export class AppModule {}

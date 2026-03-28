import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionRun } from './entities/ingestion-run.entity';
import { StationPriceObservation } from './entities/station-price-observation.entity';
import { Station } from '../catalog/entities/station.entity';
import { Brand } from '../catalog/entities/brand.entity';
import { FuelType } from '../catalog/entities/fuel-type.entity';
import { Region } from '../catalog/entities/region.entity';
import { StationCurrentPrice } from '../catalog/entities/station-current-price.entity';
import { PriceChangeEvent } from '../pricing-analytics/entities/price-change-event.entity';
import { FuelApiClient } from './precioil/fuel-api.client';
import { IngestionService } from './ingestion.service';
import { IngestionScheduler } from './ingestion.scheduler';
import { IngestionController } from './ingestion.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IngestionRun,
      StationPriceObservation,
      Station,
      Brand,
      FuelType,
      Region,
      StationCurrentPrice,
      PriceChangeEvent,
    ]),
  ],
  controllers: [IngestionController],
  providers: [FuelApiClient, IngestionService, IngestionScheduler],
  exports: [IngestionService],
})
export class IngestionModule {}

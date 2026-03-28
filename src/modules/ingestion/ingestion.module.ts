import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionRun } from './entities/ingestion-run.entity';
import { StationPriceObservation } from './entities/station-price-observation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IngestionRun, StationPriceObservation])],
  exports: [TypeOrmModule],
})
export class IngestionModule {}

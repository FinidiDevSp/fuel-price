import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Region } from './entities/region.entity';
import { Brand } from './entities/brand.entity';
import { FuelType } from './entities/fuel-type.entity';
import { Station } from './entities/station.entity';
import { StationCurrentPrice } from './entities/station-current-price.entity';
import { CatalogService } from './catalog.service';
import { RegionsController } from './regions.controller';
import { StationsController } from './stations.controller';
import {
  BrandsController,
  FuelTypesController,
} from './brands-fuels.controller';
import { SearchController } from './search.controller';
import { StationPriceObservation } from '../ingestion/entities/station-price-observation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Region,
      Brand,
      FuelType,
      Station,
      StationCurrentPrice,
      StationPriceObservation,
    ]),
  ],
  controllers: [
    RegionsController,
    StationsController,
    BrandsController,
    FuelTypesController,
    SearchController,
  ],
  providers: [CatalogService],
  exports: [CatalogService, TypeOrmModule],
})
export class CatalogModule {}

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
import { BrandsController, FuelTypesController } from './brands-fuels.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Region,
      Brand,
      FuelType,
      Station,
      StationCurrentPrice,
    ]),
  ],
  controllers: [
    RegionsController,
    StationsController,
    BrandsController,
    FuelTypesController,
  ],
  providers: [CatalogService],
  exports: [CatalogService, TypeOrmModule],
})
export class CatalogModule {}

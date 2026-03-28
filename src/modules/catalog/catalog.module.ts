import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Region } from './entities/region.entity';
import { Brand } from './entities/brand.entity';
import { FuelType } from './entities/fuel-type.entity';
import { Station } from './entities/station.entity';
import { StationCurrentPrice } from './entities/station-current-price.entity';

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
  exports: [TypeOrmModule],
})
export class CatalogModule {}

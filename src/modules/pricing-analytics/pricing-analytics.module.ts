import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceChangeEvent } from './entities/price-change-event.entity';
import { DailyRegionFuelStat } from './entities/daily-region-fuel-stat.entity';
import { DailyRanking } from './entities/daily-ranking.entity';
import { StationCurrentPrice } from '../catalog/entities/station-current-price.entity';
import { Station } from '../catalog/entities/station.entity';
import { FuelType } from '../catalog/entities/fuel-type.entity';
import { Region } from '../catalog/entities/region.entity';
import { PricingAnalyticsService } from './pricing-analytics.service';
import { PricingAnalyticsController } from './pricing-analytics.controller';
import { PricingAnalyticsScheduler } from './pricing-analytics.scheduler';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PriceChangeEvent,
      DailyRegionFuelStat,
      DailyRanking,
      StationCurrentPrice,
      Station,
      FuelType,
      Region,
    ]),
  ],
  controllers: [PricingAnalyticsController],
  providers: [PricingAnalyticsService, PricingAnalyticsScheduler],
  exports: [PricingAnalyticsService],
})
export class PricingAnalyticsModule {}

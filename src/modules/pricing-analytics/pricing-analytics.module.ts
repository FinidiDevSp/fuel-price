import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceChangeEvent } from './entities/price-change-event.entity';
import { DailyRegionFuelStat } from './entities/daily-region-fuel-stat.entity';
import { DailyRanking } from './entities/daily-ranking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PriceChangeEvent,
      DailyRegionFuelStat,
      DailyRanking,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class PricingAnalyticsModule {}

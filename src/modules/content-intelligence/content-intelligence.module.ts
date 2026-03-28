import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsightSnapshot } from './entities/insight-snapshot.entity';
import { PriceChangeEvent } from '@modules/pricing-analytics/entities/price-change-event.entity';
import { PricingAnalyticsModule } from '@modules/pricing-analytics/pricing-analytics.module';
import { ContentIntelligenceService } from './content-intelligence.service';
import { ContentIntelligenceController } from './content-intelligence.controller';
import { ContentIntelligenceScheduler } from './content-intelligence.scheduler';
import { InsightTemplateEngine } from './templates/insight-template.engine';
import { InsightScoringService } from './scoring/insight-scoring.service';
import { INSIGHT_GENERATORS } from './interfaces/insight-generator.interface';
import {
  DailyNationalSummaryGenerator,
  CheapestRegionGenerator,
  BiggestPriceDropGenerator,
  BiggestPriceRiseGenerator,
  WeeklyTrendGenerator,
  AnomalyAlertGenerator,
} from './generators';

@Module({
  imports: [
    TypeOrmModule.forFeature([InsightSnapshot, PriceChangeEvent]),
    PricingAnalyticsModule,
  ],
  controllers: [ContentIntelligenceController],
  providers: [
    InsightTemplateEngine,
    InsightScoringService,
    DailyNationalSummaryGenerator,
    CheapestRegionGenerator,
    BiggestPriceDropGenerator,
    BiggestPriceRiseGenerator,
    WeeklyTrendGenerator,
    AnomalyAlertGenerator,
    {
      provide: INSIGHT_GENERATORS,
      useFactory: (
        daily: DailyNationalSummaryGenerator,
        cheapest: CheapestRegionGenerator,
        drop: BiggestPriceDropGenerator,
        rise: BiggestPriceRiseGenerator,
        weekly: WeeklyTrendGenerator,
        anomaly: AnomalyAlertGenerator,
      ) => [daily, cheapest, drop, rise, weekly, anomaly],
      inject: [
        DailyNationalSummaryGenerator,
        CheapestRegionGenerator,
        BiggestPriceDropGenerator,
        BiggestPriceRiseGenerator,
        WeeklyTrendGenerator,
        AnomalyAlertGenerator,
      ],
    },
    ContentIntelligenceService,
    ContentIntelligenceScheduler,
  ],
  exports: [ContentIntelligenceService],
})
export class ContentIntelligenceModule {}

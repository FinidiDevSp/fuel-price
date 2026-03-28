import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsightSnapshot } from './entities/insight-snapshot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InsightSnapshot])],
  exports: [TypeOrmModule],
})
export class ContentIntelligenceModule {}

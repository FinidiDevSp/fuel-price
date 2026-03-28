import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { InsightSnapshot } from './entities/insight-snapshot.entity';
import { InsightStatus } from './interfaces/insight-status.enum';
import {
  InsightGenerator,
  INSIGHT_GENERATORS,
} from './interfaces/insight-generator.interface';
import { RedisCacheService } from '@common/cache/redis-cache.service';
import { InsightsQueryDto } from './dto/query.dto';

const AUTO_PUBLISH_THRESHOLD = 60;

@Injectable()
export class ContentIntelligenceService {
  private readonly logger = new Logger(ContentIntelligenceService.name);

  constructor(
    @InjectRepository(InsightSnapshot)
    private readonly insightRepo: Repository<InsightSnapshot>,
    @Inject(INSIGHT_GENERATORS)
    private readonly generators: InsightGenerator[],
    private readonly cacheService: RedisCacheService,
  ) {}

  async generateInsights(date?: string): Promise<InsightSnapshot[]> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    this.logger.log(`Generando insights para ${targetDate}...`);

    // Idempotencia: borrar borradores previos del mismo día
    await this.insightRepo.delete({
      statDate: targetDate,
      status: InsightStatus.DRAFT,
    });

    const allInsights: InsightSnapshot[] = [];

    for (const generator of this.generators) {
      try {
        const rawInsights = await generator.generate(targetDate);
        for (const raw of rawInsights) {
          const snapshot = this.insightRepo.create({
            statDate: targetDate,
            insightType: raw.type,
            title: raw.title,
            summary: raw.summary,
            score: raw.score.toFixed(2),
            payloadJson: raw.payload,
            generatedAt: new Date(),
            status: InsightStatus.DRAFT,
          });
          allInsights.push(await this.insightRepo.save(snapshot));
        }
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        this.logger.error(`Error en generador ${generator.type}: ${errMsg}`);
      }
    }

    // Auto-publicar insights con puntuación alta
    for (const insight of allInsights) {
      if (
        insight.score &&
        parseFloat(insight.score) >= AUTO_PUBLISH_THRESHOLD
      ) {
        insight.status = InsightStatus.PUBLISHED;
        insight.approvedAt = new Date();
        await this.insightRepo.save(insight);
      }
    }

    // Invalidar caché
    await this.cacheService.invalidateByPattern('insights:*');

    this.logger.log(
      `Insights generados: ${allInsights.length} para ${targetDate}`,
    );
    return allInsights;
  }

  async findAll(filters: InsightsQueryDto) {
    const where: FindOptionsWhere<InsightSnapshot> = {};
    if (filters.date) where.statDate = filters.date;
    if (filters.type) where.insightType = filters.type;
    if (filters.status) where.status = filters.status;

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const [data, total] = await this.insightRepo.findAndCount({
      where,
      order: { score: 'DESC', generatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<InsightSnapshot | null> {
    return this.insightRepo.findOne({ where: { id } });
  }

  async findLatestPublished(limit: number): Promise<InsightSnapshot[]> {
    return this.insightRepo.find({
      where: { status: InsightStatus.PUBLISHED },
      order: { generatedAt: 'DESC', score: 'DESC' },
      take: limit,
    });
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContentIntelligenceService } from './content-intelligence.service';
import { InsightSnapshot } from './entities/insight-snapshot.entity';
import { InsightStatus } from './interfaces/insight-status.enum';
import { InsightType } from './interfaces/insight-type.enum';
import { INSIGHT_GENERATORS } from './interfaces/insight-generator.interface';
import { RedisCacheService } from '@common/cache/redis-cache.service';

describe('ContentIntelligenceService', () => {
  let service: ContentIntelligenceService;

  const mockInsightRepo = {
    create: jest.fn().mockImplementation((data) => ({ id: 1, ...data })),
    save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
    delete: jest.fn().mockResolvedValue({ affected: 0 }),
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
  };

  const mockCacheService = {
    invalidateByPattern: jest.fn().mockResolvedValue(undefined),
  };

  const mockGenerator = {
    type: InsightType.DAILY_NATIONAL_SUMMARY,
    generate: jest.fn().mockResolvedValue([
      {
        type: InsightType.DAILY_NATIONAL_SUMMARY,
        title: 'Resumen diario: Gasolina 95 a 1.456 €/L',
        summary: 'Hoy la Gasolina 95 cuesta de media 1.456 €/L.',
        score: 65,
        payload: { fuelCode: 'G95E5', avgPrice: 1.456 },
      },
    ]),
  };

  const mockFailingGenerator = {
    type: InsightType.ANOMALY_ALERT,
    generate: jest.fn().mockRejectedValue(new Error('Sin datos')),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentIntelligenceService,
        {
          provide: getRepositoryToken(InsightSnapshot),
          useValue: mockInsightRepo,
        },
        {
          provide: INSIGHT_GENERATORS,
          useValue: [mockGenerator, mockFailingGenerator],
        },
        {
          provide: RedisCacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<ContentIntelligenceService>(
      ContentIntelligenceService,
    );
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('generateInsights', () => {
    it('debe generar insights para todos los generadores registrados', async () => {
      const results = await service.generateInsights('2026-03-28');

      expect(mockGenerator.generate).toHaveBeenCalledWith('2026-03-28');
      expect(mockInsightRepo.save).toHaveBeenCalled();
      expect(results.length).toBe(1);
    });

    it('debe manejar errores en generadores individuales sin fallar el lote', async () => {
      const results = await service.generateInsights('2026-03-28');

      // El generador que falla no impide al otro producir insights
      expect(mockFailingGenerator.generate).toHaveBeenCalled();
      expect(results.length).toBe(1);
    });

    it('debe auto-publicar insights con score >= 60', async () => {
      await service.generateInsights('2026-03-28');

      // El insight tiene score 65, debe auto-publicarse
      const savedCalls = mockInsightRepo.save.mock.calls;
      const lastSave = savedCalls[savedCalls.length - 1][0];
      expect(lastSave.status).toBe(InsightStatus.PUBLISHED);
    });

    it('debe ser idempotente (borrar borradores previos del mismo día)', async () => {
      await service.generateInsights('2026-03-28');

      expect(mockInsightRepo.delete).toHaveBeenCalledWith({
        statDate: '2026-03-28',
        status: InsightStatus.DRAFT,
      });
    });

    it('debe invalidar caché de Redis tras generar', async () => {
      await service.generateInsights('2026-03-28');

      expect(mockCacheService.invalidateByPattern).toHaveBeenCalledWith(
        'insights:*',
      );
    });

    it('debe usar la fecha actual si no se proporciona', async () => {
      const today = new Date().toISOString().split('T')[0];
      await service.generateInsights();

      expect(mockInsightRepo.delete).toHaveBeenCalledWith({
        statDate: today,
        status: InsightStatus.DRAFT,
      });
    });
  });

  describe('findAll', () => {
    it('debe devolver resultados paginados', async () => {
      mockInsightRepo.findAndCount.mockResolvedValueOnce([
        [{ id: 1 }],
        1,
      ]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('debe aplicar filtros de fecha y tipo', async () => {
      mockInsightRepo.findAndCount.mockResolvedValueOnce([[], 0]);

      await service.findAll({
        date: '2026-03-28',
        type: InsightType.DAILY_NATIONAL_SUMMARY,
      });

      expect(mockInsightRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            statDate: '2026-03-28',
            insightType: InsightType.DAILY_NATIONAL_SUMMARY,
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('debe devolver null si no existe', async () => {
      const result = await service.findOne(999);
      expect(result).toBeNull();
    });
  });

  describe('findLatestPublished', () => {
    it('debe buscar solo insights publicados', async () => {
      await service.findLatestPublished(5);

      expect(mockInsightRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: InsightStatus.PUBLISHED },
          take: 5,
        }),
      );
    });
  });
});

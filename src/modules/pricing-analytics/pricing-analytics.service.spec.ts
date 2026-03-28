import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PricingAnalyticsService } from './pricing-analytics.service';
import { DailyRegionFuelStat } from './entities/daily-region-fuel-stat.entity';
import { DailyRanking } from './entities/daily-ranking.entity';
import { PriceChangeEvent } from './entities/price-change-event.entity';
import { StationCurrentPrice } from '../catalog/entities/station-current-price.entity';
import { FuelType } from '../catalog/entities/fuel-type.entity';
import { Region } from '../catalog/entities/region.entity';

const mockQueryBuilder = {
  innerJoin: jest.fn().mockReturnThis(),
  innerJoinAndSelect: jest.fn().mockReturnThis(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  addGroupBy: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  getRawMany: jest.fn(),
  getRawOne: jest.fn(),
  getMany: jest.fn(),
};

const mockDailyStatRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

const mockRankingRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

const mockChangeEventRepo = {
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

const mockCurrentPriceRepo = {
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

const mockFuelTypeRepo = {
  find: jest.fn(),
};
const mockRegionRepo = {
  find: jest.fn(),
};

describe('PricingAnalyticsService', () => {
  let service: PricingAnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingAnalyticsService,
        { provide: getRepositoryToken(DailyRegionFuelStat), useValue: mockDailyStatRepo },
        { provide: getRepositoryToken(DailyRanking), useValue: mockRankingRepo },
        { provide: getRepositoryToken(PriceChangeEvent), useValue: mockChangeEventRepo },
        { provide: getRepositoryToken(StationCurrentPrice), useValue: mockCurrentPriceRepo },
        { provide: getRepositoryToken(FuelType), useValue: mockFuelTypeRepo },
        { provide: getRepositoryToken(Region), useValue: mockRegionRepo },
      ],
    }).compile();

    service = module.get<PricingAnalyticsService>(PricingAnalyticsService);
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('getNationalSummary', () => {
    it('debe calcular medias nacionales por combustible', async () => {
      mockCurrentPriceRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getRawMany.mockResolvedValue([
        {
          fuelCode: 'G95E5',
          fuelName: 'Gasolina 95 E5',
          avgPrice: '1.5550',
          minPrice: '1.3000',
          maxPrice: '1.8000',
          stationCount: '5000',
        },
        {
          fuelCode: 'GOA',
          fuelName: 'Gasóleo A',
          avgPrice: '1.4200',
          minPrice: '1.2000',
          maxPrice: '1.7000',
          stationCount: '5200',
        },
      ]);

      const result = await service.getNationalSummary();

      expect(result).toHaveLength(2);
      expect(result[0].fuelCode).toBe('G95E5');
      expect(result[0].avgPrice).toBeCloseTo(1.555, 3);
      expect(result[0].stationCount).toBe(5000);
      expect(result[1].fuelCode).toBe('GOA');
      expect(result[1].avgPrice).toBeCloseTo(1.42, 2);
    });
  });

  describe('getTopMovers', () => {
    it('debe devolver estaciones con más variación en 24h', async () => {
      mockChangeEventRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([
        {
          station: { name: 'REPSOL - MADRID', brand: { name: 'REPSOL' } },
          regionProvince: { name: 'Madrid' },
          previousPrice: '1.5000',
          newPrice: '1.5500',
          deltaAbs: '0.0500',
          deltaPct: '3.3333',
          changeDirection: 'up',
          detectedAt: new Date(),
        },
      ]);

      const result = await service.getTopMovers('G95E5', 10);

      expect(result).toHaveLength(1);
      expect(result[0].stationName).toBe('REPSOL - MADRID');
      expect(result[0].direction).toBe('up');
    });
  });

  describe('getTimeSeries', () => {
    it('debe consultar serie temporal con días y región', async () => {
      mockDailyStatRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { date: '2026-03-27', avgPrice: '1.5500' },
        { date: '2026-03-28', avgPrice: '1.5600' },
      ]);

      const result = await service.getTimeSeries('G95E5', undefined, 7);

      expect(result).toHaveLength(2);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });
  });

  describe('getRankingByCommunities', () => {
    it('debe devolver ranking ordenado por precio medio ascendente', async () => {
      mockCurrentPriceRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getRawMany.mockResolvedValue([
        {
          regionId: '1',
          regionName: 'Extremadura',
          regionSlug: 'extremadura',
          avgPrice: '1.4200',
          stationCount: '120',
        },
        {
          regionId: '2',
          regionName: 'Cataluña',
          regionSlug: 'cataluna',
          avgPrice: '1.5900',
          stationCount: '800',
        },
      ]);

      const result = await service.getRankingByCommunities('G95E5');

      expect(result).toHaveLength(2);
      expect(result[0].regionName).toBe('Extremadura');
      expect(result[0].avgPrice).toBeLessThan(result[1].avgPrice);
    });
  });
});

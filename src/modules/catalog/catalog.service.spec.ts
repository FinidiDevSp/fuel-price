import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CatalogService } from './catalog.service';
import { Region } from './entities/region.entity';
import { Brand } from './entities/brand.entity';
import { FuelType } from './entities/fuel-type.entity';
import { Station } from './entities/station.entity';
import { StationCurrentPrice } from './entities/station-current-price.entity';
import { RegionType } from './interfaces/region-type.enum';

const mockRegionRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
};

const mockBrandRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
};

const mockFuelTypeRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
};

const mockStationRepo = {
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockCurrentPriceRepo = {
  find: jest.fn(),
};

describe('CatalogService', () => {
  let service: CatalogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        { provide: getRepositoryToken(Region), useValue: mockRegionRepo },
        { provide: getRepositoryToken(Brand), useValue: mockBrandRepo },
        { provide: getRepositoryToken(FuelType), useValue: mockFuelTypeRepo },
        { provide: getRepositoryToken(Station), useValue: mockStationRepo },
        {
          provide: getRepositoryToken(StationCurrentPrice),
          useValue: mockCurrentPriceRepo,
        },
      ],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('getCommunities', () => {
    it('debe devolver comunidades ordenadas por nombre', async () => {
      const mockCommunities = [
        { id: 1, name: 'Andalucía', type: RegionType.COMMUNITY },
        { id: 2, name: 'Cataluña', type: RegionType.COMMUNITY },
      ];
      mockRegionRepo.find.mockResolvedValue(mockCommunities);

      const result = await service.getCommunities();

      expect(result).toEqual(mockCommunities);
      expect(mockRegionRepo.find).toHaveBeenCalledWith({
        where: { type: RegionType.COMMUNITY },
        order: { name: 'ASC' },
      });
    });
  });

  describe('getProvinces', () => {
    it('debe devolver todas las provincias sin filtro', async () => {
      mockRegionRepo.find.mockResolvedValue([]);

      await service.getProvinces();

      expect(mockRegionRepo.find).toHaveBeenCalledWith({
        where: { type: RegionType.PROVINCE },
        order: { name: 'ASC' },
      });
    });

    it('debe filtrar provincias por comunidad', async () => {
      const mockCommunity = { id: 5, slug: 'andalucia' };
      mockRegionRepo.findOne.mockResolvedValue(mockCommunity);
      mockRegionRepo.find.mockResolvedValue([]);

      await service.getProvinces('andalucia');

      expect(mockRegionRepo.findOne).toHaveBeenCalledWith({
        where: { slug: 'andalucia', type: RegionType.COMMUNITY },
      });
      expect(mockRegionRepo.find).toHaveBeenCalledWith({
        where: { type: RegionType.PROVINCE, parentId: 5 },
        order: { name: 'ASC' },
      });
    });

    it('debe devolver vacío si la comunidad no existe', async () => {
      mockRegionRepo.findOne.mockResolvedValue(null);

      const result = await service.getProvinces('inexistente');

      expect(result).toEqual([]);
    });
  });

  describe('getBrands', () => {
    it('debe devolver marcas ordenadas', async () => {
      const mockBrands = [
        { id: 1, name: 'BP', slug: 'bp' },
        { id: 2, name: 'REPSOL', slug: 'repsol' },
      ];
      mockBrandRepo.find.mockResolvedValue(mockBrands);

      const result = await service.getBrands();

      expect(result).toEqual(mockBrands);
    });
  });

  describe('getFuelTypes', () => {
    it('debe devolver solo combustibles activos', async () => {
      mockFuelTypeRepo.find.mockResolvedValue([]);

      await service.getFuelTypes();

      expect(mockFuelTypeRepo.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { name: 'ASC' },
      });
    });
  });

  describe('getStationPrices', () => {
    it('debe devolver precios de una estación con relación al tipo de combustible', async () => {
      const mockPrices = [
        { id: 1, stationId: 10, fuelTypeId: 1, price: '1.5500' },
      ];
      mockCurrentPriceRepo.find.mockResolvedValue(mockPrices);

      const result = await service.getStationPrices(10);

      expect(result).toEqual(mockPrices);
      expect(mockCurrentPriceRepo.find).toHaveBeenCalledWith({
        where: { stationId: 10 },
        relations: ['fuelType'],
        order: { fuelTypeId: 'ASC' },
      });
    });
  });
});

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { Region } from './entities/region.entity';
import { Brand } from './entities/brand.entity';
import { FuelType } from './entities/fuel-type.entity';
import { Station } from './entities/station.entity';
import { StationCurrentPrice } from './entities/station-current-price.entity';
import { RegionType } from './interfaces/region-type.enum';
import { StationQueryDto, NearbyQueryDto } from './dto/query.dto';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Region)
    private readonly regionRepo: Repository<Region>,
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
    @InjectRepository(FuelType)
    private readonly fuelTypeRepo: Repository<FuelType>,
    @InjectRepository(Station)
    private readonly stationRepo: Repository<Station>,
    @InjectRepository(StationCurrentPrice)
    private readonly currentPriceRepo: Repository<StationCurrentPrice>,
  ) {}

  // ──────────────────────────────────────────────
  // Regiones
  // ──────────────────────────────────────────────

  async getCommunities(): Promise<Region[]> {
    return this.regionRepo.find({
      where: { type: RegionType.COMMUNITY },
      order: { name: 'ASC' },
    });
  }

  async getProvinces(communitySlug?: string): Promise<Region[]> {
    if (communitySlug) {
      const community = await this.regionRepo.findOne({
        where: { slug: communitySlug, type: RegionType.COMMUNITY },
      });
      if (!community) return [];
      return this.regionRepo.find({
        where: { type: RegionType.PROVINCE, parentId: community.id },
        order: { name: 'ASC' },
      });
    }
    return this.regionRepo.find({
      where: { type: RegionType.PROVINCE },
      order: { name: 'ASC' },
    });
  }

  async getMunicipalities(provinceSlug: string): Promise<Region[]> {
    const province = await this.regionRepo.findOne({
      where: { slug: provinceSlug, type: RegionType.PROVINCE },
    });
    if (!province) return [];
    return this.regionRepo.find({
      where: { type: RegionType.MUNICIPALITY, parentId: province.id },
      order: { name: 'ASC' },
    });
  }

  async getRegionBySlug(slug: string): Promise<Region | null> {
    return this.regionRepo.findOne({
      where: { slug },
      relations: ['parent', 'children'],
    });
  }

  // ──────────────────────────────────────────────
  // Marcas
  // ──────────────────────────────────────────────

  async getBrands(): Promise<Brand[]> {
    return this.brandRepo.find({ order: { name: 'ASC' } });
  }

  async getBrandBySlug(slug: string): Promise<Brand | null> {
    return this.brandRepo.findOne({ where: { slug } });
  }

  // ──────────────────────────────────────────────
  // Combustibles
  // ──────────────────────────────────────────────

  async getFuelTypes(): Promise<FuelType[]> {
    return this.fuelTypeRepo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async getFuelTypeByCode(code: string): Promise<FuelType | null> {
    return this.fuelTypeRepo.findOne({ where: { code } });
  }

  // ──────────────────────────────────────────────
  // Estaciones
  // ──────────────────────────────────────────────

  async getStations(query: StationQueryDto): Promise<PaginatedResult<Station>> {
    const qb = this.stationRepo.createQueryBuilder('station')
      .leftJoinAndSelect('station.brand', 'brand')
      .leftJoinAndSelect('station.regionCommunity', 'community')
      .leftJoinAndSelect('station.regionProvince', 'province')
      .where('station.isActive = :active', { active: true });

    if (query.community) {
      qb.andWhere('community.slug = :communitySlug', {
        communitySlug: query.community,
      });
    }

    if (query.province) {
      qb.andWhere('province.slug = :provinceSlug', {
        provinceSlug: query.province,
      });
    }

    if (query.brand) {
      qb.andWhere('brand.slug = :brandSlug', { brandSlug: query.brand });
    }

    if (query.fuel) {
      qb.innerJoin(
        StationCurrentPrice,
        'cp',
        'cp.stationId = station.id',
      )
        .innerJoin(FuelType, 'ft', 'ft.id = cp.fuelTypeId')
        .andWhere('ft.code = :fuelCode', { fuelCode: query.fuel });
    }

    if (query.q) {
      qb.andWhere(
        '(station.name ILIKE :search OR station.address ILIKE :search OR station.postalCode LIKE :exactSearch)',
        { search: `%${query.q}%`, exactSearch: `${query.q}%` },
      );
    }

    qb.orderBy('station.name', 'ASC');

    const total = await qb.getCount();
    const data = await qb
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getMany();

    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async getStationBySlug(slug: string): Promise<Station | null> {
    return this.stationRepo.findOne({
      where: { slug },
      relations: [
        'brand',
        'regionCommunity',
        'regionProvince',
        'regionMunicipality',
      ],
    });
  }

  async getStationPrices(
    stationId: number,
  ): Promise<StationCurrentPrice[]> {
    return this.currentPriceRepo.find({
      where: { stationId },
      relations: ['fuelType'],
      order: { fuelTypeId: 'ASC' },
    });
  }

  async getNearbyStations(query: NearbyQueryDto): Promise<Station[]> {
    const qb = this.stationRepo.createQueryBuilder('station')
      .leftJoinAndSelect('station.brand', 'brand')
      .addSelect(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(CAST(station.lat AS double precision))) * cos(radians(CAST(station.lng AS double precision)) - radians(:lng)) + sin(radians(:lat)) * sin(radians(CAST(station.lat AS double precision)))))`,
        'distance',
      )
      .where('station.isActive = :active', { active: true })
      .setParameters({ lat: query.lat, lng: query.lng })
      .having(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(CAST(station.lat AS double precision))) * cos(radians(CAST(station.lng AS double precision)) - radians(:lng)) + sin(radians(:lat)) * sin(radians(CAST(station.lat AS double precision))))) < :radius`,
        { lat: query.lat, lng: query.lng, radius: query.radius },
      )
      .groupBy('station.id')
      .addGroupBy('brand.id')
      .orderBy('distance', 'ASC')
      .limit(query.limit);

    if (query.fuel) {
      qb.innerJoin(StationCurrentPrice, 'cp', 'cp.stationId = station.id')
        .innerJoin(FuelType, 'ft', 'ft.id = cp.fuelTypeId')
        .andWhere('ft.code = :fuelCode', { fuelCode: query.fuel })
        .addGroupBy('cp.id')
        .addGroupBy('ft.id');
    }

    return qb.getMany();
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { DailyRegionFuelStat } from './entities/daily-region-fuel-stat.entity';
import { DailyRanking } from './entities/daily-ranking.entity';
import { PriceChangeEvent } from './entities/price-change-event.entity';
import { StationCurrentPrice } from '../catalog/entities/station-current-price.entity';
import { FuelType } from '../catalog/entities/fuel-type.entity';
import { Region } from '../catalog/entities/region.entity';
import { RegionType } from '../catalog/interfaces/region-type.enum';
import {
  RankingEntry,
  NationalSummary,
} from './interfaces/analytics.interfaces';

@Injectable()
export class PricingAnalyticsService {
  private readonly logger = new Logger(PricingAnalyticsService.name);

  constructor(
    @InjectRepository(DailyRegionFuelStat)
    private readonly dailyStatRepo: Repository<DailyRegionFuelStat>,
    @InjectRepository(DailyRanking)
    private readonly rankingRepo: Repository<DailyRanking>,
    @InjectRepository(PriceChangeEvent)
    private readonly changeEventRepo: Repository<PriceChangeEvent>,
    @InjectRepository(StationCurrentPrice)
    private readonly currentPriceRepo: Repository<StationCurrentPrice>,
    @InjectRepository(FuelType)
    private readonly fuelTypeRepo: Repository<FuelType>,
    @InjectRepository(Region)
    private readonly regionRepo: Repository<Region>,
  ) {}

  // ──────────────────────────────────────────────
  // Resumen nacional en tiempo real
  // ──────────────────────────────────────────────

  async getNationalSummary(): Promise<NationalSummary[]> {
    const results = await this.currentPriceRepo
      .createQueryBuilder('cp')
      .innerJoin('cp.fuelType', 'ft')
      .select('ft.code', 'fuelCode')
      .addSelect('ft.name', 'fuelName')
      .addSelect('AVG(CAST(cp.price AS double precision))', 'avgPrice')
      .addSelect('MIN(CAST(cp.price AS double precision))', 'minPrice')
      .addSelect('MAX(CAST(cp.price AS double precision))', 'maxPrice')
      .addSelect('COUNT(cp.id)', 'stationCount')
      .where('ft.isActive = :active', { active: true })
      .groupBy('ft.code')
      .addGroupBy('ft.name')
      .orderBy('ft.name', 'ASC')
      .getRawMany();

    return results.map((r) => ({
      fuelCode: r.fuelCode,
      fuelName: r.fuelName,
      avgPrice: parseFloat(parseFloat(r.avgPrice).toFixed(4)),
      minPrice: parseFloat(parseFloat(r.minPrice).toFixed(4)),
      maxPrice: parseFloat(parseFloat(r.maxPrice).toFixed(4)),
      stationCount: parseInt(r.stationCount, 10),
    }));
  }

  // ──────────────────────────────────────────────
  // Rankings en tiempo real
  // ──────────────────────────────────────────────

  async getRankingByCommunities(fuelCode: string): Promise<RankingEntry[]> {
    return this.getRankingByRegionType(fuelCode, RegionType.COMMUNITY);
  }

  async getRankingByProvinces(
    fuelCode: string,
    communitySlug?: string,
  ): Promise<RankingEntry[]> {
    return this.getRankingByRegionType(
      fuelCode,
      RegionType.PROVINCE,
      communitySlug,
    );
  }

  private async getRankingByRegionType(
    fuelCode: string,
    regionType: RegionType,
    parentSlug?: string,
  ): Promise<RankingEntry[]> {
    const regionField =
      regionType === RegionType.COMMUNITY
        ? 'station.regionCommunityId'
        : 'station.regionProvinceId';

    const qb = this.currentPriceRepo
      .createQueryBuilder('cp')
      .innerJoin('cp.fuelType', 'ft')
      .innerJoin('cp.station', 'station')
      .innerJoin(Region, 'region', `region.id = ${regionField}`)
      .select('region.id', 'regionId')
      .addSelect('region.name', 'regionName')
      .addSelect('region.slug', 'regionSlug')
      .addSelect('AVG(CAST(cp.price AS double precision))', 'avgPrice')
      .addSelect('COUNT(cp.id)', 'stationCount')
      .where('ft.code = :fuelCode', { fuelCode })
      .andWhere('station.isActive = :active', { active: true })
      .groupBy('region.id')
      .addGroupBy('region.name')
      .addGroupBy('region.slug')
      .orderBy('avgPrice', 'ASC');

    if (parentSlug) {
      qb.innerJoin(Region, 'parent', 'parent.id = region.parentId').andWhere(
        'parent.slug = :parentSlug',
        { parentSlug },
      );
    }

    const results = await qb.getRawMany();

    return results.map((r) => ({
      regionId: parseInt(r.regionId, 10),
      regionName: r.regionName,
      regionSlug: r.regionSlug,
      avgPrice: parseFloat(parseFloat(r.avgPrice).toFixed(4)),
      stationCount: parseInt(r.stationCount, 10),
      changeVsPrevDay: null,
    }));
  }

  // ──────────────────────────────────────────────
  // Top movers (estaciones con más variación)
  // ──────────────────────────────────────────────

  async getTopMovers(fuelCode: string, limit: number) {
    const since = new Date();
    since.setHours(since.getHours() - 24);

    const events = await this.changeEventRepo
      .createQueryBuilder('ev')
      .innerJoinAndSelect('ev.station', 'station')
      .innerJoinAndSelect('station.brand', 'brand')
      .innerJoin('ev.fuelType', 'ft')
      .innerJoinAndSelect('ev.regionProvince', 'province')
      .where('ft.code = :fuelCode', { fuelCode })
      .andWhere('ev.detectedAt >= :since', { since })
      .orderBy('ABS(CAST(ev.deltaAbs AS double precision))', 'DESC')
      .limit(limit)
      .getMany();

    return events.map((ev) => ({
      stationName: ev.station.name,
      brandName: ev.station.brand?.name ?? null,
      provinceName: ev.regionProvince?.name ?? null,
      previousPrice: ev.previousPrice,
      newPrice: ev.newPrice,
      deltaAbs: ev.deltaAbs,
      deltaPct: ev.deltaPct,
      direction: ev.changeDirection,
      detectedAt: ev.detectedAt,
    }));
  }

  // ──────────────────────────────────────────────
  // Series temporales (agregados históricos)
  // ──────────────────────────────────────────────

  async getTimeSeries(
    fuelCode: string,
    regionSlug?: string,
    days: number = 30,
  ) {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);
    const since = sinceDate.toISOString().split('T')[0];

    const qb = this.dailyStatRepo
      .createQueryBuilder('stat')
      .innerJoin('stat.fuelType', 'ft')
      .innerJoin('stat.region', 'region')
      .select('stat.statDate', 'date')
      .addSelect('stat.avgPrice', 'avgPrice')
      .addSelect('stat.minPrice', 'minPrice')
      .addSelect('stat.maxPrice', 'maxPrice')
      .addSelect('stat.stationCount', 'stationCount')
      .addSelect('stat.stddevPrice', 'stddevPrice')
      .addSelect('stat.changeVsPrevDayAbs', 'changeVsPrevDayAbs')
      .addSelect('stat.changeVsPrevDayPct', 'changeVsPrevDayPct')
      .where('ft.code = :fuelCode', { fuelCode })
      .andWhere('stat.statDate >= :since', { since })
      .orderBy('stat.statDate', 'ASC');

    if (regionSlug) {
      qb.andWhere('region.slug = :regionSlug', { regionSlug });
    } else {
      qb.andWhere('region.type = :type', { type: RegionType.COUNTRY });
    }

    return qb.getRawMany();
  }

  // ──────────────────────────────────────────────
  // Datos agregados para la homepage
  // ──────────────────────────────────────────────

  async getHomePageData() {
    const [summary, topMovers, communityRanking, mainSeries] =
      await Promise.all([
        this.getNationalSummary(),
        this.getTopMovers('G95E5', 5),
        this.getRankingByCommunities('G95E5'),
        this.getTimeSeries('G95E5', undefined, 30),
      ]);

    return { summary, topMovers, communityRanking, mainSeries };
  }

  // ──────────────────────────────────────────────
  // Ranking de estaciones individuales
  // ──────────────────────────────────────────────

  async getStationRankings(params: {
    fuelCode: string;
    communitySlug?: string;
    provinceSlug?: string;
    order: 'asc' | 'desc';
    limit: number;
  }) {
    const qb = this.currentPriceRepo
      .createQueryBuilder('cp')
      .innerJoin('cp.fuelType', 'ft')
      .innerJoin('cp.station', 'station')
      .leftJoin('station.brand', 'brand')
      .leftJoin('station.regionProvince', 'province')
      .leftJoin('station.regionCommunity', 'community')
      .select('station.name', 'stationName')
      .addSelect('station.slug', 'stationSlug')
      .addSelect('brand.name', 'brandName')
      .addSelect('province.name', 'provinceName')
      .addSelect('community.name', 'communityName')
      .addSelect('CAST(cp.price AS double precision)', 'price')
      .addSelect('cp.observedAt', 'lastUpdated')
      .where('ft.code = :fuelCode', { fuelCode: params.fuelCode })
      .andWhere('station.isActive = :active', { active: true })
      .orderBy(
        'CAST(cp.price AS double precision)',
        params.order === 'asc' ? 'ASC' : 'DESC',
      )
      .limit(params.limit);

    if (params.communitySlug) {
      qb.andWhere('community.slug = :communitySlug', {
        communitySlug: params.communitySlug,
      });
    }

    if (params.provinceSlug) {
      qb.andWhere('province.slug = :provinceSlug', {
        provinceSlug: params.provinceSlug,
      });
    }

    const results = await qb.getRawMany();

    return results.map((r: Record<string, string>) => ({
      stationName: r.stationName,
      stationSlug: r.stationSlug,
      brandName: r.brandName ?? null,
      provinceName: r.provinceName ?? '',
      communityName: r.communityName ?? '',
      price: parseFloat(parseFloat(r.price).toFixed(4)),
      lastUpdated: r.lastUpdated,
    }));
  }

  // ──────────────────────────────────────────────
  // Datos agregados para una región
  // ──────────────────────────────────────────────

  async getRegionStats(regionSlug: string, fuelCode: string) {
    const region = await this.regionRepo.findOne({
      where: { slug: regionSlug },
      relations: ['parent', 'children'],
    });

    if (!region) return null;

    // Resumen del combustible para esta región
    const regionField = this.getRegionField(region.type);

    let regionSummary: Array<{
      fuelCode: string;
      fuelName: string;
      avgPrice: number;
      minPrice: number;
      maxPrice: number;
      stationCount: number;
    }> = [];

    if (regionField) {
      const summaryResults = await this.currentPriceRepo
        .createQueryBuilder('cp')
        .innerJoin('cp.fuelType', 'ft')
        .innerJoin('cp.station', 'station')
        .select('ft.code', 'fuelCode')
        .addSelect('ft.name', 'fuelName')
        .addSelect('AVG(CAST(cp.price AS double precision))', 'avgPrice')
        .addSelect('MIN(CAST(cp.price AS double precision))', 'minPrice')
        .addSelect('MAX(CAST(cp.price AS double precision))', 'maxPrice')
        .addSelect('COUNT(cp.id)', 'stationCount')
        .where('ft.isActive = :active', { active: true })
        .andWhere(`station.${regionField} = :regionId`, {
          regionId: region.id,
        })
        .andWhere('station.isActive = :sActive', { sActive: true })
        .groupBy('ft.code')
        .addGroupBy('ft.name')
        .getRawMany();

      regionSummary = summaryResults.map((r: Record<string, string>) => ({
        fuelCode: r.fuelCode,
        fuelName: r.fuelName,
        avgPrice: parseFloat(parseFloat(r.avgPrice).toFixed(4)),
        minPrice: parseFloat(parseFloat(r.minPrice).toFixed(4)),
        maxPrice: parseFloat(parseFloat(r.maxPrice).toFixed(4)),
        stationCount: parseInt(r.stationCount, 10),
      }));
    }

    // Media nacional para comparar
    const nationalSummary = await this.getNationalSummary();
    const nationalFuel = nationalSummary.find((s) => s.fuelCode === fuelCode);

    // Ranking de hijos (provincias si es comunidad)
    let childRanking: RankingEntry[] = [];
    if (region.type === RegionType.COMMUNITY) {
      childRanking = await this.getRankingByProvinces(fuelCode, regionSlug);
    }

    // Serie temporal
    const series = await this.getTimeSeries(fuelCode, regionSlug, 30);

    return {
      region: {
        id: region.id,
        name: region.name,
        slug: region.slug,
        type: region.type,
      },
      summary: regionSummary,
      nationalAvg: nationalFuel?.avgPrice ?? null,
      childRanking,
      series,
    };
  }

  // ──────────────────────────────────────────────
  // Cálculo de agregados diarios (batch)
  // ──────────────────────────────────────────────

  async calculateDailyStats(date?: string): Promise<number> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    this.logger.log(`Calculando agregados diarios para ${targetDate}`);

    const fuelTypes = await this.fuelTypeRepo.find({
      where: { isActive: true },
    });
    const regions = await this.regionRepo.find();

    let statsCreated = 0;

    for (const fuelType of fuelTypes) {
      for (const region of regions) {
        const stat = await this.calculateStatForRegionFuel(
          targetDate,
          region,
          fuelType,
        );
        if (stat) statsCreated++;
      }
    }

    // Calcular variaciones contra días previos
    await this.calculateVariations(targetDate);

    // Generar rankings materializados
    await this.generateDailyRankings(targetDate, fuelTypes);

    this.logger.log(
      `Agregados diarios completados: ${statsCreated} registros para ${targetDate}`,
    );
    return statsCreated;
  }

  private async calculateStatForRegionFuel(
    targetDate: string,
    region: Region,
    fuelType: FuelType,
  ): Promise<DailyRegionFuelStat | null> {
    const regionField = this.getRegionField(region.type);
    if (!regionField) return null;

    const qb = this.currentPriceRepo
      .createQueryBuilder('cp')
      .innerJoin('cp.station', 'station')
      .select('AVG(CAST(cp.price AS double precision))', 'avgPrice')
      .addSelect('MIN(CAST(cp.price AS double precision))', 'minPrice')
      .addSelect('MAX(CAST(cp.price AS double precision))', 'maxPrice')
      .addSelect('STDDEV(CAST(cp.price AS double precision))', 'stddevPrice')
      .addSelect('COUNT(cp.id)', 'stationCount')
      .where('cp.fuelTypeId = :fuelTypeId', { fuelTypeId: fuelType.id })
      .andWhere('station.isActive = :active', { active: true });

    if (region.type === RegionType.COUNTRY) {
      // Para el nivel país, no filtramos por región
    } else {
      qb.andWhere(`station.${regionField} = :regionId`, {
        regionId: region.id,
      });
    }

    const result = await qb.getRawOne();

    if (
      !result ||
      !result.avgPrice ||
      parseInt(result.stationCount, 10) === 0
    ) {
      return null;
    }

    // Buscar si ya existe para no duplicar
    const existing = await this.dailyStatRepo.findOne({
      where: {
        statDate: targetDate,
        regionId: region.id,
        fuelTypeId: fuelType.id,
      },
    });

    const data = {
      statDate: targetDate,
      regionId: region.id,
      fuelTypeId: fuelType.id,
      avgPrice: parseFloat(result.avgPrice).toFixed(4),
      minPrice: parseFloat(result.minPrice).toFixed(4),
      maxPrice: parseFloat(result.maxPrice).toFixed(4),
      stddevPrice: result.stddevPrice
        ? parseFloat(result.stddevPrice).toFixed(4)
        : null,
      stationCount: parseInt(result.stationCount, 10),
    };

    if (existing) {
      Object.assign(existing, data);
      return this.dailyStatRepo.save(existing);
    }

    return this.dailyStatRepo.save(this.dailyStatRepo.create(data));
  }

  private async calculateVariations(targetDate: string): Promise<void> {
    const todayStats = await this.dailyStatRepo.find({
      where: { statDate: targetDate },
    });

    const prevDay = new Date(targetDate);
    prevDay.setDate(prevDay.getDate() - 1);
    const prevDayStr = prevDay.toISOString().split('T')[0];

    const prev7d = new Date(targetDate);
    prev7d.setDate(prev7d.getDate() - 7);
    const prev7dStr = prev7d.toISOString().split('T')[0];

    const prev30d = new Date(targetDate);
    prev30d.setDate(prev30d.getDate() - 30);
    const prev30dStr = prev30d.toISOString().split('T')[0];

    for (const stat of todayStats) {
      const prevDayStat = await this.dailyStatRepo.findOne({
        where: {
          statDate: prevDayStr,
          regionId: stat.regionId,
          fuelTypeId: stat.fuelTypeId,
        },
      });

      const prev7dStat = await this.dailyStatRepo.findOne({
        where: {
          statDate: prev7dStr,
          regionId: stat.regionId,
          fuelTypeId: stat.fuelTypeId,
        },
      });

      const prev30dStat = await this.dailyStatRepo.findOne({
        where: {
          statDate: prev30dStr,
          regionId: stat.regionId,
          fuelTypeId: stat.fuelTypeId,
        },
      });

      const currentAvg = parseFloat(stat.avgPrice);

      if (prevDayStat) {
        const prevAvg = parseFloat(prevDayStat.avgPrice);
        stat.changeVsPrevDayAbs = (currentAvg - prevAvg).toFixed(4);
        stat.changeVsPrevDayPct =
          prevAvg !== 0
            ? (((currentAvg - prevAvg) / prevAvg) * 100).toFixed(4)
            : null;
      }

      if (prev7dStat) {
        stat.changeVs7dAbs = (
          currentAvg - parseFloat(prev7dStat.avgPrice)
        ).toFixed(4);
      }

      if (prev30dStat) {
        stat.changeVs30dAbs = (
          currentAvg - parseFloat(prev30dStat.avgPrice)
        ).toFixed(4);
      }

      await this.dailyStatRepo.save(stat);
    }
  }

  private async generateDailyRankings(
    targetDate: string,
    fuelTypes: FuelType[],
  ): Promise<void> {
    for (const ft of fuelTypes) {
      // Ranking de comunidades
      const communityRanking = await this.getRankingByCommunities(ft.code);
      if (communityRanking.length > 0) {
        await this.saveRanking(
          targetDate,
          'cheapest_communities',
          ft.id,
          null,
          communityRanking,
        );
      }

      // Ranking de provincias
      const provinceRanking = await this.getRankingByProvinces(ft.code);
      if (provinceRanking.length > 0) {
        await this.saveRanking(
          targetDate,
          'cheapest_provinces',
          ft.id,
          null,
          provinceRanking,
        );
      }
    }
  }

  private async saveRanking(
    statDate: string,
    rankingType: string,
    fuelTypeId: number,
    scopeRegionId: number | null,
    payload: unknown,
  ): Promise<void> {
    const existing = await this.rankingRepo.findOne({
      where: {
        statDate,
        rankingType,
        fuelTypeId,
        scopeRegionId: scopeRegionId ?? IsNull(),
      },
    });

    if (existing) {
      existing.payloadJson = payload as Record<string, unknown>;
      await this.rankingRepo.save(existing);
    } else {
      await this.rankingRepo.save(
        this.rankingRepo.create({
          statDate,
          rankingType,
          fuelTypeId,
          scopeRegionId,
          payloadJson: payload as Record<string, unknown>,
        }),
      );
    }
  }

  private getRegionField(type: RegionType): string | null {
    switch (type) {
      case RegionType.COMMUNITY:
        return 'regionCommunityId';
      case RegionType.PROVINCE:
        return 'regionProvinceId';
      case RegionType.MUNICIPALITY:
        return 'regionMunicipalityId';
      case RegionType.COUNTRY:
        return null;
      default:
        return null;
    }
  }
}

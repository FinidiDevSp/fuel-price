import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { IngestionRun } from './entities/ingestion-run.entity';
import { IngestionRunStatus } from './interfaces/ingestion-run-status.enum';
import { StationPriceObservation } from './entities/station-price-observation.entity';
import { Station } from '../catalog/entities/station.entity';
import { Brand } from '../catalog/entities/brand.entity';
import { FuelType } from '../catalog/entities/fuel-type.entity';
import { Region } from '../catalog/entities/region.entity';
import { StationCurrentPrice } from '../catalog/entities/station-current-price.entity';
import { PriceChangeEvent } from '../pricing-analytics/entities/price-change-event.entity';
import { ChangeDirection } from '../pricing-analytics/interfaces/change-direction.enum';
import { RegionType } from '../catalog/interfaces/region-type.enum';
import { FuelApiClient } from './precioil/fuel-api.client';
import {
  RawStation,
} from './precioil/fuel-api.interfaces';
import {
  mapRawStation,
  extractPrices,
  slugify,
  NormalizedPrice,
} from './precioil/fuel-api.mapper';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly apiClient: FuelApiClient,
    @InjectRepository(IngestionRun)
    private readonly runRepo: Repository<IngestionRun>,
    @InjectRepository(StationPriceObservation)
    private readonly observationRepo: Repository<StationPriceObservation>,
    @InjectRepository(Station)
    private readonly stationRepo: Repository<Station>,
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
    @InjectRepository(FuelType)
    private readonly fuelTypeRepo: Repository<FuelType>,
    @InjectRepository(Region)
    private readonly regionRepo: Repository<Region>,
    @InjectRepository(StationCurrentPrice)
    private readonly currentPriceRepo: Repository<StationCurrentPrice>,
    @InjectRepository(PriceChangeEvent)
    private readonly changeEventRepo: Repository<PriceChangeEvent>,
  ) {}

  /**
   * Ejecuta un ciclo completo de ingesta:
   * 1. Registra el run
   * 2. Consulta la API
   * 3. Sincroniza catálogos (regiones, marcas, combustibles, estaciones)
   * 4. Compara precios y detecta cambios
   * 5. Persiste observaciones y eventos
   * 6. Finaliza el run con estadísticas
   */
  async runFullIngestion(): Promise<IngestionRun> {
    const run = await this.createRun();

    try {
      this.logger.log(`Ingesta iniciada (run #${run.id})`);

      // 1. Consultar API
      const apiResponse = await this.apiClient.fetchAllStations();
      const rawStations = apiResponse.ListaEESSPrecio;

      if (apiResponse.ResultadoConsulta !== 'OK') {
        throw new Error(
          `La API respondió con: ${apiResponse.ResultadoConsulta}`,
        );
      }

      run.recordsReceived = rawStations.length;
      this.logger.log(`Recibidas ${rawStations.length} estaciones de la API`);

      // 2. Asegurar catálogos base
      await this.ensureFuelTypes();
      const regionCache = await this.buildRegionCache(rawStations);
      const brandCache = await this.buildBrandCache(rawStations);
      const fuelTypeCache = await this.buildFuelTypeCache();

      // 3. Procesar estaciones y precios
      const now = new Date();
      let inserted = 0;
      let updated = 0;
      let ignored = 0;
      let errors = 0;

      for (const raw of rawStations) {
        try {
          const normalized = mapRawStation(raw);

          // Resolver o crear estación
          const station = await this.resolveStation(
            normalized,
            regionCache,
            brandCache,
            now,
          );

          // Extraer precios de la estación
          const prices = extractPrices(raw);

          for (const priceData of prices) {
            const fuelType = fuelTypeCache.get(priceData.fuelCode);
            if (!fuelType) continue;

            const result = await this.processPrice(
              station,
              fuelType,
              priceData,
              run,
              now,
            );

            if (result === 'inserted') inserted++;
            else if (result === 'updated') updated++;
            else ignored++;
          }
        } catch (error) {
          errors++;
          const errMsg =
            error instanceof Error ? error.message : String(error);
          this.logger.warn(
            `Error procesando estación ${raw['IDEESS']}: ${errMsg}`,
          );
        }
      }

      // 4. Finalizar el run
      run.recordsInserted = inserted;
      run.recordsUpdated = updated;
      run.recordsIgnored = ignored;
      run.errorCount = errors;
      run.status =
        errors > 0 ? IngestionRunStatus.PARTIAL : IngestionRunStatus.SUCCESS;
      run.finishedAt = new Date();

      await this.runRepo.save(run);

      this.logger.log(
        `Ingesta completada (run #${run.id}): ` +
          `${inserted} nuevos, ${updated} actualizados, ${ignored} sin cambios, ${errors} errores`,
      );

      return run;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      run.status = IngestionRunStatus.FAILED;
      run.finishedAt = new Date();
      run.notes = errMsg;
      await this.runRepo.save(run);

      this.logger.error(`Ingesta fallida (run #${run.id}): ${errMsg}`);
      throw error;
    }
  }

  private async createRun(): Promise<IngestionRun> {
    const run = this.runRepo.create({
      sourceName: 'MITECO',
      startedAt: new Date(),
      status: IngestionRunStatus.RUNNING,
    });
    return this.runRepo.save(run);
  }

  /**
   * Asegura que los tipos de combustible principales existen en la BD.
   */
  private async ensureFuelTypes(): Promise<void> {
    const fuelDefs: { code: string; name: string; shortName: string }[] = [
      { code: 'G95E5', name: 'Gasolina 95 E5', shortName: 'G95' },
      { code: 'G98E5', name: 'Gasolina 98 E5', shortName: 'G98' },
      { code: 'GOA', name: 'Gasóleo A', shortName: 'Diésel' },
      { code: 'GOAP', name: 'Gasóleo A Premium', shortName: 'Diésel+' },
      { code: 'GOB', name: 'Gasóleo B', shortName: 'Gasóleo B' },
      { code: 'G95E5P', name: 'Gasolina 95 E5 Premium', shortName: 'G95+' },
      { code: 'G95E10', name: 'Gasolina 95 E10', shortName: 'G95E10' },
      { code: 'G98E10', name: 'Gasolina 98 E10', shortName: 'G98E10' },
      { code: 'GLP', name: 'Gases Licuados del Petróleo', shortName: 'GLP' },
      { code: 'GNC', name: 'Gas Natural Comprimido', shortName: 'GNC' },
      { code: 'GNL', name: 'Gas Natural Licuado', shortName: 'GNL' },
      { code: 'BIO', name: 'Biodiesel', shortName: 'Biodiesel' },
      { code: 'BIOE', name: 'Bioetanol', shortName: 'Bioetanol' },
      { code: 'H2', name: 'Hidrógeno', shortName: 'H2' },
    ];

    for (const def of fuelDefs) {
      const exists = await this.fuelTypeRepo.findOne({
        where: { code: def.code },
      });
      if (!exists) {
        await this.fuelTypeRepo.save(
          this.fuelTypeRepo.create({
            code: def.code,
            externalFuelTypeId: def.code,
            name: def.name,
            shortName: def.shortName,
          }),
        );
      }
    }
  }

  /**
   * Construye un caché de regiones (comunidades, provincias, municipios).
   * Crea las regiones que no existan.
   */
  private async buildRegionCache(
    rawStations: RawStation[],
  ): Promise<Map<string, Region>> {
    const cache = new Map<string, Region>();

    // Asegurar España como país raíz
    let spain = await this.regionRepo.findOne({
      where: { code: 'ES', type: RegionType.COUNTRY },
    });
    if (!spain) {
      spain = await this.regionRepo.save(
        this.regionRepo.create({
          type: RegionType.COUNTRY,
          name: 'España',
          code: 'ES',
          slug: 'espana',
        }),
      );
    }
    cache.set('country:ES', spain);

    // Extraer IDs únicos
    const communityIds = new Set<string>();
    const provinceIds = new Set<string>();
    const municipalityData = new Map<
      string,
      { name: string; provinceId: string; communityId: string }
    >();

    for (const raw of rawStations) {
      communityIds.add(raw['IDCCAA'].trim());
      provinceIds.add(raw['IDProvincia'].trim());
      const munId = raw['IDMunicipio'].trim();
      if (!municipalityData.has(munId)) {
        municipalityData.set(munId, {
          name: raw['Municipio'].trim(),
          provinceId: raw['IDProvincia'].trim(),
          communityId: raw['IDCCAA'].trim(),
        });
      }
    }

    // Obtener nombres de comunidades y provincias de la API
    const [apiCommunities, apiProvinces] = await Promise.all([
      this.apiClient.fetchCommunities(),
      this.apiClient.fetchProvinces(),
    ]);

    const communityNames = new Map(
      apiCommunities.map((c) => [c.IDCCAA, c.CCAA]),
    );
    const provinceInfo = new Map(
      apiProvinces.map((p) => [p.IDPovincia, { name: p.Provincia, ccaa: p.IDCCAA }]),
    );

    // Crear/resolver comunidades
    for (const ccaaId of communityIds) {
      const key = `community:${ccaaId}`;
      let region = await this.regionRepo.findOne({
        where: { code: `CCAA-${ccaaId}`, type: RegionType.COMMUNITY },
      });
      if (!region) {
        const name = communityNames.get(ccaaId) || `Comunidad ${ccaaId}`;
        region = await this.regionRepo.save(
          this.regionRepo.create({
            type: RegionType.COMMUNITY,
            name,
            code: `CCAA-${ccaaId}`,
            slug: slugify(name),
            parentId: spain.id,
          }),
        );
      }
      cache.set(key, region);
    }

    // Crear/resolver provincias
    for (const provId of provinceIds) {
      const key = `province:${provId}`;
      let region = await this.regionRepo.findOne({
        where: { code: `PROV-${provId}`, type: RegionType.PROVINCE },
      });
      if (!region) {
        const info = provinceInfo.get(provId);
        const name = info?.name || `Provincia ${provId}`;
        const parentCcaa = info?.ccaa || '';
        const parent = cache.get(`community:${parentCcaa}`);
        region = await this.regionRepo.save(
          this.regionRepo.create({
            type: RegionType.PROVINCE,
            name,
            code: `PROV-${provId}`,
            slug: slugify(name),
            parentId: parent?.id ?? spain.id,
          }),
        );
      }
      cache.set(key, region);
    }

    // Crear/resolver municipios
    for (const [munId, data] of municipalityData) {
      const key = `municipality:${munId}`;
      let region = await this.regionRepo.findOne({
        where: { code: `MUN-${munId}`, type: RegionType.MUNICIPALITY },
      });
      if (!region) {
        const parent = cache.get(`province:${data.provinceId}`);
        region = await this.regionRepo.save(
          this.regionRepo.create({
            type: RegionType.MUNICIPALITY,
            name: data.name,
            code: `MUN-${munId}`,
            slug: slugify(`${data.name}-${munId}`),
            parentId: parent?.id ?? spain.id,
          }),
        );
      }
      cache.set(key, region);
    }

    return cache;
  }

  /**
   * Construye un caché de marcas. Crea las que no existan.
   */
  private async buildBrandCache(
    rawStations: RawStation[],
  ): Promise<Map<string, Brand>> {
    const cache = new Map<string, Brand>();
    const brandNames = new Set(
      rawStations.map((s) => s['Rótulo'].trim().toUpperCase().replace(/\s+/g, ' ')),
    );

    for (const name of brandNames) {
      const slug = slugify(name);
      let brand = await this.brandRepo.findOne({
        where: { normalizedName: name },
      });
      if (!brand) {
        brand = await this.brandRepo.save(
          this.brandRepo.create({
            name: name,
            normalizedName: name,
            slug,
          }),
        );
      }
      cache.set(name, brand);
    }

    return cache;
  }

  /**
   * Construye un caché de tipos de combustible.
   */
  private async buildFuelTypeCache(): Promise<Map<string, FuelType>> {
    const all = await this.fuelTypeRepo.find({ where: { isActive: true } });
    const cache = new Map<string, FuelType>();
    for (const ft of all) {
      cache.set(ft.code, ft);
    }
    return cache;
  }

  /**
   * Resuelve o crea una estación en la BD.
   */
  private async resolveStation(
    normalized: ReturnType<typeof mapRawStation>,
    regionCache: Map<string, Region>,
    brandCache: Map<string, Brand>,
    now: Date,
  ): Promise<Station> {
    let station = await this.stationRepo.findOne({
      where: { externalStationId: normalized.externalStationId },
    });

    const brand = brandCache.get(normalized.brandName) ?? null;
    const community = regionCache.get(
      `community:${normalized.communityId}`,
    );
    const province = regionCache.get(`province:${normalized.provinceId}`);
    const municipality = regionCache.get(
      `municipality:${normalized.municipalityId}`,
    );

    if (station) {
      station.lastSeenAt = now;
      station.isActive = true;
      station.name = normalized.name;
      station.address = normalized.address;
      station.openingHours = normalized.openingHours;
      if (brand) station.brandId = brand.id;
      return this.stationRepo.save(station);
    }

    station = this.stationRepo.create({
      externalStationId: normalized.externalStationId,
      name: normalized.name,
      slug: slugify(
        `${normalized.brandName}-${normalized.localityName}-${normalized.externalStationId}`,
      ),
      brandId: brand?.id ?? null,
      regionCommunityId: community?.id ?? 0,
      regionProvinceId: province?.id ?? 0,
      regionMunicipalityId: municipality?.id ?? null,
      address: normalized.address,
      postalCode: normalized.postalCode,
      lat: String(normalized.lat),
      lng: String(normalized.lng),
      openingHours: normalized.openingHours,
      isActive: true,
      firstSeenAt: now,
      lastSeenAt: now,
    });

    return this.stationRepo.save(station);
  }

  /**
   * Procesa un precio individual: compara con el actual,
   * crea observación y, si hay cambio, crea evento.
   *
   * @returns 'inserted' | 'updated' | 'ignored'
   */
  private async processPrice(
    station: Station,
    fuelType: FuelType,
    priceData: NormalizedPrice,
    run: IngestionRun,
    now: Date,
  ): Promise<'inserted' | 'updated' | 'ignored'> {
    const priceStr = priceData.price.toFixed(4);

    // Buscar precio actual
    const current = await this.currentPriceRepo.findOne({
      where: { stationId: station.id, fuelTypeId: fuelType.id },
    });

    // Si el precio no ha cambiado, ignorar
    if (current && current.price === priceStr) {
      return 'ignored';
    }

    // Crear observación (histórico)
    const payloadHash = createHash('sha256')
      .update(`${station.externalStationId}:${fuelType.code}:${priceStr}:${now.toISOString()}`)
      .digest('hex')
      .substring(0, 64);

    await this.observationRepo.save(
      this.observationRepo.create({
        stationId: station.id,
        fuelTypeId: fuelType.id,
        price: priceStr,
        observedAt: now,
        ingestionRunId: run.id,
        rawPayloadHash: payloadHash,
      }),
    );

    if (current) {
      // Precio existente ha cambiado → actualizar + crear evento
      const previousPrice = current.price;
      const deltaAbs = (
        priceData.price - parseFloat(previousPrice)
      ).toFixed(4);
      const deltaPct =
        parseFloat(previousPrice) !== 0
          ? (
              ((priceData.price - parseFloat(previousPrice)) /
                parseFloat(previousPrice)) *
              100
            ).toFixed(4)
          : '0';

      const direction =
        priceData.price > parseFloat(previousPrice)
          ? ChangeDirection.UP
          : ChangeDirection.DOWN;

      // Actualizar precio actual
      current.previousPrice = previousPrice;
      current.price = priceStr;
      current.deltaAbs = deltaAbs;
      current.deltaPct = deltaPct;
      current.observedAt = now;
      current.updatedByIngestionRunId = run.id;
      await this.currentPriceRepo.save(current);

      // Crear evento de cambio
      await this.changeEventRepo.save(
        this.changeEventRepo.create({
          stationId: station.id,
          fuelTypeId: fuelType.id,
          previousPrice,
          newPrice: priceStr,
          deltaAbs,
          deltaPct,
          detectedAt: now,
          changeDirection: direction,
          regionCommunityId: station.regionCommunityId,
          regionProvinceId: station.regionProvinceId,
          regionMunicipalityId: station.regionMunicipalityId,
        }),
      );

      return 'updated';
    } else {
      // Primer precio para esta estación/combustible
      await this.currentPriceRepo.save(
        this.currentPriceRepo.create({
          stationId: station.id,
          fuelTypeId: fuelType.id,
          price: priceStr,
          observedAt: now,
          updatedByIngestionRunId: run.id,
        }),
      );

      return 'inserted';
    }
  }
}

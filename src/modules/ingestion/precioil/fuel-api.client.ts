import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  RawApiResponse,
  RawCommunity,
  RawProvince,
  RawMunicipality,
  RawFuelProduct,
} from './fuel-api.interfaces';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

@Injectable()
export class FuelApiClient {
  private readonly logger = new Logger(FuelApiClient.name);
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>(
      'ingestion.baseUrl',
      'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes',
    );
    this.timeout = this.config.get<number>('ingestion.timeout', 30000);
  }

  /** Obtener todas las estaciones terrestres con precios actuales */
  async fetchAllStations(): Promise<RawApiResponse> {
    return this.get<RawApiResponse>('/EstacionesTerrestres/');
  }

  /** Obtener listado de comunidades autónomas */
  async fetchCommunities(): Promise<RawCommunity[]> {
    return this.get<RawCommunity[]>('/Listados/ComunidadesAutonomas/');
  }

  /** Obtener listado de provincias */
  async fetchProvinces(): Promise<RawProvince[]> {
    return this.get<RawProvince[]>('/Listados/Provincias/');
  }

  /** Obtener listado de municipios */
  async fetchMunicipalities(): Promise<RawMunicipality[]> {
    return this.get<RawMunicipality[]>('/Listados/Municipios/');
  }

  /** Obtener listado de productos petrolíferos */
  async fetchFuelProducts(): Promise<RawFuelProduct[]> {
    return this.get<RawFuelProduct[]>('/Listados/ProductosPetroliferos/');
  }

  /**
   * GET genérico con reintentos y backoff exponencial.
   */
  private async get<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        this.logger.debug(`GET ${path} (intento ${attempt}/${MAX_RETRIES})`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return (await response.json()) as T;
      } catch (error) {
        const isLastAttempt = attempt === MAX_RETRIES;
        const errMsg = error instanceof Error ? error.message : String(error);

        if (isLastAttempt) {
          this.logger.error(
            `Fallo tras ${MAX_RETRIES} intentos en ${path}: ${errMsg}`,
          );
          throw error;
        }

        const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        this.logger.warn(
          `Intento ${attempt} fallido en ${path}: ${errMsg}. Reintentando en ${delay}ms...`,
        );
        await this.sleep(delay);
      }
    }

    throw new Error('Unreachable');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

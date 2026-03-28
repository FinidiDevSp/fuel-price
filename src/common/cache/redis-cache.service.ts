import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get<string>('redis.host', 'localhost'),
      port: this.configService.get<number>('redis.port', 6379),
      password: this.configService.get<string>('redis.password') || undefined,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
    });

    this.client.on('error', (err: Error) => {
      this.logger.warn(`Redis no disponible: ${err.message}`);
    });

    this.client.connect().catch(() => {
      this.logger.warn('No se pudo conectar a Redis, caché deshabilitada');
    });
  }

  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    factory: () => Promise<T>,
  ): Promise<T> {
    try {
      if (this.client.status === 'ready') {
        const cached = await this.client.get(key);
        if (cached) {
          return JSON.parse(cached) as T;
        }
      }
    } catch {
      // Si Redis falla, seguimos sin caché
    }

    const fresh = await factory();

    try {
      if (this.client.status === 'ready') {
        await this.client.setex(key, ttlSeconds, JSON.stringify(fresh));
      }
    } catch {
      // Ignorar fallos de escritura en caché
    }

    return fresh;
  }

  async invalidateByPattern(pattern: string): Promise<void> {
    try {
      if (this.client.status !== 'ready') return;

      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
        this.logger.log(`Cache invalidada: ${keys.length} claves (${pattern})`);
      }
    } catch {
      // Ignorar fallos de invalidación
    }
  }

  async onModuleDestroy() {
    await this.client.quit().catch(() => {});
  }
}

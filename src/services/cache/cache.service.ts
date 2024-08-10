import { Inject, Injectable } from '@nestjs/common';
import { ICacheService } from './icache.service';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements ICacheService {
  _redis = new Redis();

  async set(key: string, value: any, exp: number = 0) {
    if (exp > 0) await this._redis.set(key, value, 'EX', exp)
    else await this._redis.set(key, value)
  }

  async get(key: string): Promise<any> {
    return await this._redis.get(key)
  }

  async delete(key: string) {
    await this._redis.del(key)
  }
}

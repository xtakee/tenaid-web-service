import { Injectable } from "@nestjs/common";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Permission } from "./model/permission";
import { ManagedAccount } from "../account/model/managed.account";
import { CacheService } from "src/services/cache/cache.service";

@Injectable()
export class AuthRepository {
  constructor(private readonly cache: CacheService) { }

 
  /**
   * 
   * @param key 
   * @param token 
   * @returns 
   */
  async saveAuthToken(key: string, token: string): Promise<void> {
    return await this.cache.set(key, token)
  }

  /**
   * 
   * @param key 
   * @returns 
   */
  async invalidateAuthToken(key: string): Promise<void> {
    return await this.cache.delete(key)
  }

  /**
   * 
   * @param key 
   * @returns 
   */
  async getAuthToken(key: string): Promise<string> {
    return await this.cache.get(key)
  }

 
}
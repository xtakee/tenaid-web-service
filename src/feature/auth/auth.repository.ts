import { Injectable } from "@nestjs/common";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Permission } from "./model/permission";
import { ManagedAccount } from "./model/managed.account";
import { CacheService } from "src/services/cache/cache.service";

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(ManagedAccount.name) private readonly authModel: Model<ManagedAccount>,
    private readonly cache: CacheService
  ) { }

  /**
   * 
   * @param user 
   * @param addOnType 
   * @param status 
   * @returns AuthRole
   */
  async setPermissions(user: string, permissions: Permission[]): Promise<ManagedAccount> {
    const roles = await this.authModel.findOne({
      account: new Types.ObjectId(user),
      owner: new Types.ObjectId(user)
    })
    
    if (!roles) {
      const role: ManagedAccount = {
        account: new Types.ObjectId(user),
        owner: new Types.ObjectId(user),
        permissions: permissions
      }

      return await this.authModel.create(role)
    }

    return await this.authModel.findByIdAndUpdate((roles as any)._id, {
      permissions: permissions
    }, { returnDocument: 'after' }).exec()
  }

  /**
   * 
   * @param user 
   * @returns 
   */
  async getOwnPermissions(user: string): Promise<any> {
    return await this.authModel
      .findOne({ account: new Types.ObjectId(user), owner: new Types.ObjectId(user), }, '_id permissions')
  }

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

  /**
   * 
   * @param user 
   * @returns 
   */
  async getOwnManagedAccounts(user: string): Promise<any> {
    return await this.authModel.find({ account: new Types.ObjectId(user) }, '_id owner account')
      .populate({
        path: 'owner',
        select: '_id firstName lastName photo',
        strictPopulate: false
      }
      ).exec()
  }
}
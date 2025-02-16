import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { E2eeKey } from "./model/e2ee.key";

@Injectable()
export class E2eeRepository {
  constructor(@InjectModel(E2eeKey.name) private readonly e2eeKeysModel: Model<E2eeKey>) { }

  /**
   * 
   * @param user 
   * @param platform 
   */
  async getAccountKeys(user: string, platform: string): Promise<E2eeKey> {
    return this.e2eeKeysModel.findOne({
      account: new Types.ObjectId(user),
      platform: platform
    })
  }

  /**
   * 
   * @param user 
   * @param parentKey 
   * @param publicKey 
   * @param sharedKey 
   * @param platform 
   * @param device 
   */
  async saveAccountKeys(
    user: string,
    parentKey: string,
    privateKey: string,
    publicKey: string,
    sharedKey: string,
    platform: string): Promise<void> {

    await this.e2eeKeysModel.findOneAndUpdate({
      account: new Types.ObjectId(user),
      platform: platform
    }, {
      account: new Types.ObjectId(user),
      parentKey: parentKey,
      privateKey: privateKey,
      sharedKey: sharedKey,
      publicKey: publicKey,
      platform: platform
    }, { upsert: true, new: true }).exec()
  }

}

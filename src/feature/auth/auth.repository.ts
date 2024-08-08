import { Injectable } from "@nestjs/common";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Permission } from "./model/permission";
import { ManagedAccount } from "./model/managed.account";

@Injectable()
export class AuthRepository {
  constructor(@InjectModel(ManagedAccount.name) private readonly authModel: Model<ManagedAccount>) { }

  /**
   * 
   * @param user 
   * @param addOnType 
   * @param status 
   * @returns AuthRole
   */
  async setOwnerPermissions(user: string, permissions: Permission[], status: string): Promise<ManagedAccount> {
    const role: ManagedAccount = {
      account: new Types.ObjectId(user),
      status: status,
      owner: new Types.ObjectId(user),
      permissions: permissions
    }

    return await this.authModel.create(role)
  }

  async getOwnPermissions(user: string): Promise<any> {
    return await this.authModel
      .findOne({ account: new Types.ObjectId(user), owner: new Types.ObjectId(user), }, '_id permissions')
  }

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
import { Injectable } from "@nestjs/common";
import { AccountAdmin } from "./model/account.admin.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateAdminDto } from "src/feature/admin/dto/request/create.admin.dto";
import { Permission } from "../auth/model/permission";

@Injectable()
export class AdminRepository {
  constructor(@InjectModel(AccountAdmin.name) private readonly adminModel: Model<AccountAdmin>) { }

  /**
   * 
   * @param data 
   * @param permissions 
   * @returns 
   */
  async create(data: CreateAdminDto, permissions: Permission[]): Promise<AccountAdmin> {
    const admin: AccountAdmin = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      password: data.password,
      permissions: permissions,
      email: {
        value: data.email
      }
    }

    return await this.adminModel.create(admin)
  }

  /**
   * 
   * @param id 
   * @returns 
   */
  async getOneById(id: string): Promise<AccountAdmin> {
    return await this.adminModel.findById(id)
  }

  /**
   * 
   * @param email 
   * @returns 
   */
  async getOneByEmail(email: string): Promise<AccountAdmin> {
    return await this.adminModel.findOne({ 'email.value': email })
  }

}

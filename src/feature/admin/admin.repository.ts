import { Injectable } from "@nestjs/common";
import { AccountAdmin } from "./model/account.admin.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class AdminRepository {
  constructor(@InjectModel(AccountAdmin.name) private readonly adminModel: Model<AccountAdmin>) { }

  
}
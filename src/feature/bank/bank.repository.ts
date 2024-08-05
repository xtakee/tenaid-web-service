import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Bank } from "./model/bank.model";
import { Model } from "mongoose";

@Injectable()
export class BankRepository {
  constructor(@InjectModel(Bank.name) private readonly bankModel: Model<Bank>) { }

  /**
   * Get all registered banks
   * @returns Bank[]
   */
  async findAll(): Promise<Bank[]> {
    return await this.bankModel.find()
  }

  /**
   * 
   * @param id 
   * @returns Bank
   */
  async findOneById(id: string): Promise<Bank> {
    return await this.bankModel.findById(id)
  }
}

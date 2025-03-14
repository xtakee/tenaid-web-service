import { Injectable } from "@nestjs/common"
import { Billing } from "./model/billing"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"
import { Billable } from "./model/billable"
import { CreateBillableDto } from "./dto/request/create.billable.dto"

@Injectable()
export class BillingRepository {
  constructor(
    @InjectModel(Billing.name) private readonly billingModel: Model<Billing>,
    @InjectModel(Billable.name) private readonly billableModel: Model<Billable>,
  ) { }

  /**
   * 
   * @param user 
   * @param data 
   * @returns 
   */
  async createBillable(user: string, data: CreateBillableDto): Promise<Billable> {
    const billable: Billable = {
      community: new Types.ObjectId(data.community),
      account: new Types.ObjectId(user),
      name: data.name,
      description: data.description,
      status: data.status,
      amount: data.amount,
      type: data.type,
      startDate: new Date(data.startDate),
      billClass: data.billClass,
      frequency: data.frequency
    }

    return await this.billableModel.create(billable)
  }

  /**
   * 
   * @param community 
   * @param name 
   */
  async getBillableByName(community: string, name: string): Promise<Billable> {
    return await this.billableModel.findOne({ name: name, community: new Types.ObjectId(community) })
  }

  /**
   * 
   * @param community 
   * @param billable 
   * @returns 
   */
  async getBillable(community: string, billable: string): Promise<Billable> {
    return await this.billableModel.findOne({ _id: new Types.ObjectId(billable), community: new Types.ObjectId(community) })
  }
}
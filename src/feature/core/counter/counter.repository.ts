import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { COUNTER_TYPE } from "./constants";
import { Counter } from "./model/counter.model";

@Injectable()
export class CounterRepository {
  constructor(@InjectModel(Counter.name) private readonly counterModel: Model<Counter>) { }

  async getCounter(type: COUNTER_TYPE): Promise<number> {
    const counter = await this.counterModel.findOneAndUpdate(
      { type },
      { $inc: { value: 1 } },
      { new: true, upsert: true },
    ).exec()

    return counter.value
  }
}

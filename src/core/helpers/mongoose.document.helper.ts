import { Injectable } from "@nestjs/common"
import { Model } from "mongoose"

@Injectable()
export class MongooseDocumentHelper {
  async count(
    model: Model<any>,
    query: any,
    startDate?: string,
    endDate?: string
  ): Promise<number> {
    // Add date range filter if provided
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) }
    } else if (startDate) {
      query.createdAt = { $gte: new Date(startDate) }
    }

    const result = await model.aggregate([
      { $match: query },
      { $count: 'total' }
    ])

    return result.length > 0 ? result[0].total : 0
  }
}
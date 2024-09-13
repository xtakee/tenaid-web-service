import { Injectable } from '@nestjs/common';
import { Model, FilterQuery, PopulateOptions } from 'mongoose';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: any;
  select?: string | string[];
  populate?: PopulateOptions | (PopulateOptions | string)[] // Add populate option
}

export interface PaginatedResult<T> {
  docs: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

@Injectable()
export class Paginator {

  async paginate<T>(
    model: Model<T>,
    query: FilterQuery<T> = {},
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<T>> {
    const page = options.page || 1
    const limit = options.limit || 10
    const sort = options.sort || { createdAt: -1 }
    const select = options.select || ''
    const populate = options.populate || ''

    // Calculate total items and total pages
    const totalItems = await model.countDocuments(query).exec()
    const totalPages = Math.ceil(totalItems / limit)

    // Fetch paginated results with optional population
    const queryBuilder = model.find(query).sort(sort).select(select).skip((page - 1) * limit).limit(limit)

    if (populate) queryBuilder.populate(populate)

    const docs = await queryBuilder.exec();

    // Return paginated object
    return {
      docs,
      totalItems,
      totalPages,
      currentPage: page * 1,
      itemsPerPage: limit * 1,
    };
  }
}

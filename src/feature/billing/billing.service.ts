import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBillableDto } from './dto/request/create.billable.dto';
import { BillableDtoMapper } from './mapper/billable.dto.mapper';
import { BillingRepository } from './billing.repository';
import { BillableDto } from './dto/response/billable.dto';
import { PaginatedResult } from 'src/core/helpers/paginator';
import { PaginationRequestDto } from '../core/dto/pagination.request.dto';
import { Billable } from './model/billable';

@Injectable()
export class BillingService {

  constructor(
    private readonly billableMapper: BillableDtoMapper,
    private readonly billingRepository: BillingRepository
  ) { }

  /**
   * 
   * @param user 
   * @param data 
   */
  async createBillable(user: string, data: CreateBillableDto): Promise<BillableDto> {
    const billable = await this.billingRepository.createBillable(user, data)

    if (billable) return this.billableMapper.map(billable)

    throw new BadRequestException()
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @returns 
   */
  async getAllCommunityBillables(community: string, paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.billingRepository.getAllCommunityBillables(community, paginate)
  }

}

import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BasicAuth } from '../auth/guards/auth.decorator';
import { User } from 'src/core/decorators/user';
import { CreateBillableDto } from './dto/request/create.billable.dto';
import { BillableDto } from './dto/response/billable.dto';
import { BillingService } from './billing.service';
import { PaginationRequestDto } from '../core/dto/pagination.request.dto';
import { PaginatedResult } from 'src/core/helpers/paginator';

@Controller({
  version: '1',
  path: "billing",
})
@ApiTags('Billing')
export class BillingController {

  constructor(
    private readonly billingService: BillingService
  ) { }

  @Post('/billable')
  @BasicAuth()
  @ApiOperation({ summary: 'Create a community billable' })
  async createBillable(@User() user: string, @Body() body: CreateBillableDto): Promise<BillableDto> {
    return await this.billingService.createBillable(user, body)
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @returns 
   */
  @Get('/:community/billable')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community billables' })
  async getAllCommunityBillables(@Param('community') community: string, @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.billingService.getAllCommunityBillables(community, paginate)
  }
}

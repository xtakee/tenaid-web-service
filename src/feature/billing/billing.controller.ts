import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BasicAuth } from '../auth/guards/auth.decorator';
import { User } from 'src/core/decorators/user';
import { CreateBillableDto } from './dto/request/create.billable.dto';

@Controller({
  version: '1',
  path: "billing",
})
@ApiTags('Billing')
export class BillingController {

  @Post('/billable')
  @BasicAuth()
  async createBillable(@User() user: string, @Body() body: CreateBillableDto): Promise<void> {
      
  }
}

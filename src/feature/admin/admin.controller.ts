import { Body, Controller, NotImplementedException, Param, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { User } from 'src/core/decorators/current.user';
import { ReviewAddOnRequestDto } from 'src/domain/admin/dto/request/review.add.on.request.dto';

@Controller({
  version: '1',
  path: "admin",
})
@ApiTags('Admin')
export class AdminController {

  constructor(private readonly adminService: AdminService) { }

  // @Post('')
  // async create(@Body() body: CreateAdminDto): Promise<AccountAdminAuthResponseDto> {
  //   return await this.adminService.create(body)
  // }

  @Post('add-on/review')
  @ApiOperation({ summary: 'Review Add On Request' })
  async reviewAddOnRequest(@User() admin: string, @Body() data: ReviewAddOnRequestDto): Promise<void> {

  }
}

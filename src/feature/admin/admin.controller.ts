import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { User } from 'src/core/decorators/current.user';
import { ReviewAddOnRequestDto } from 'src/domain/admin/dto/request/review.add.on.request.dto';
import { Auth } from '../auth/guards/auth.decorator';
import { MongoAbility } from '@casl/ability';
import { ADMIN_SYSTEM_FEATURES, CLAIM } from '../auth/auth.constants';
import { CheckPolicies } from '../auth/guards/casl/policies.guard';

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
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, ADMIN_SYSTEM_FEATURES.MANAGERS))
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, ADMIN_SYSTEM_FEATURES.AGENTS))
  async reviewAddOnRequest(@User() admin: string, @Body() data: ReviewAddOnRequestDto): Promise<void> {
    return await this.adminService.reviewAddOnRequest(admin, data)
  }
}

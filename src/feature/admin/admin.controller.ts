import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { User } from 'src/core/decorators/current.user';
import { ReviewAddOnRequestDto } from 'src/feature/admin/dto/request/review.add.on.request.dto';
import { Auth } from '../auth/guards/auth.decorator';
import { MongoAbility } from '@casl/ability';
import { ADMIN_SYSTEM_FEATURES, CLAIM } from '../auth/auth.constants';
import { CheckPolicies } from '../auth/guards/casl/policies.guard';
import { PaginatedResult } from 'src/core/helpers/paginator';
import { PaginationRequestDto } from '../core/dto/pagination.request.dto';

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

  @Get('account/can-lease')
  @ApiOperation({ summary: 'Get all registered tenants' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, ADMIN_SYSTEM_FEATURES.TENANTS))
  async getAllTenants(@Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.adminService.getAllRegisteredTenants(paginate.page, paginate.limit)
  }

  @Get('account/can-publish')
  @ApiOperation({ summary: 'Get all registered Agents' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, ADMIN_SYSTEM_FEATURES.AGENTS))
  async getAllAgents(@Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.adminService.getAllRegisteredAgents(paginate.page, paginate.limit)
  }

  @Get('account/can-own')
  @ApiOperation({ summary: 'Get all registered Managers/Lanlords' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, ADMIN_SYSTEM_FEATURES.MANAGERS))
  async getAllManagers(@Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.adminService.getAllRegisteredManagers(paginate.page, paginate.limit)
  }

  @Get('account/add-on-requests')
  @ApiOperation({ summary: 'Get all Add On Requests' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, ADMIN_SYSTEM_FEATURES.MANAGERS))
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, ADMIN_SYSTEM_FEATURES.AGENTS))
  async getAllAddOnRequests(@Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.adminService.getAllAddOnRequests(paginate.page, paginate.limit)
  }
}

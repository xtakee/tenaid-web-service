import { Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { CreateAdminDto } from 'src/feature/admin/dto/request/create.admin.dto';
import { Permission } from '../auth/model/permission';
import { ADMIN_SYSTEM_FEATURES, CLAIM } from '../auth/auth.constants';
import { ReviewAddOnRequestDto } from 'src/feature/admin/dto/request/review.add.on.request.dto';
import { AccountRepository } from '../account/account.respository';
import { PaginatedResult } from 'src/core/helpers/paginator';
import { Account } from '../account/model/account.model';
import { AddOnRequest } from '../account/model/add.on.request.model';
import { AccountAdminResponseDto } from 'src/feature/admin/dto/response/account.admin.response.dto';
import { AccountAdminToDtoMapper } from './mapper/account.admin.to.dto.mapper';
import { AccountService } from '../account/account.service';

const adminPermissions: Permission[] = [
  { authorization: ADMIN_SYSTEM_FEATURES.APPLICATIONS, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: ADMIN_SYSTEM_FEATURES.TENANTS, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: ADMIN_SYSTEM_FEATURES.DASHBOARD, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: ADMIN_SYSTEM_FEATURES.MANAGERS, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: ADMIN_SYSTEM_FEATURES.LISTING, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: ADMIN_SYSTEM_FEATURES.TRANSACTIONS, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: ADMIN_SYSTEM_FEATURES.PERSONA, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: ADMIN_SYSTEM_FEATURES.PROPERTIES, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: ADMIN_SYSTEM_FEATURES.AGENTS, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] }
]

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly mapper: AccountAdminToDtoMapper,
    private readonly accountService: AccountService,
    private readonly accountRepository: AccountRepository
  ) { }

  /**
   * 
   * @param data 
   * @returns 
   */
  async create(data: CreateAdminDto): Promise<AccountAdminResponseDto> {
    const admin = await this.adminRepository.create(data, adminPermissions)

    return this.mapper.map(admin)
  }

  /**
   * 
   * @param admin 
   * @param data 
   */
  async reviewAddOnRequest(admin: string, data: ReviewAddOnRequestDto): Promise<void> {
    const request = await this.accountRepository.reviewAddOnRequest(data.request, data.status, data.comment, admin)
    if (!request) throw new NotFoundException()

    await this.accountService.setAddOnPermissions(request.account.toString(), request.addOn)
    await this.accountService.setAccountType(request.account.toString(), request.addOn, true)
  }

  /**
   * 
   * @param page 
   * @param limit 
   * @returns 
   */
  async getAllRegisteredTenants(page?: number, limit?: number): Promise<PaginatedResult<Account>> {
    return await this.accountRepository.getAllRegisteredTenants(page, limit)
  }

  /**
  * 
  * @param page 
  * @param limit 
  * @returns 
  */
  async getAllRegisteredAgents(page?: number, limit?: number): Promise<PaginatedResult<Account>> {
    return await this.accountRepository.getAllRegisteredAgents(page, limit)
  }

  /**
 * 
 * @param page 
 * @param limit 
 * @returns 
 */
  async getAllAddOnRequests(page?: number, limit?: number): Promise<PaginatedResult<AddOnRequest>> {
    return await this.accountRepository.getAllAddOnRequests(page, limit)
  }

  /**
  * 
  * @param page 
  * @param limit 
  * @returns 
  */
  async getAllRegisteredManagers(page?: number, limit?: number): Promise<PaginatedResult<Account>> {
    return await this.accountRepository.getAllRegisteredManagers(page, limit)
  }

}

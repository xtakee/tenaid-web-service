import { Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { CreateAdminDto } from 'src/domain/admin/dto/request/create.admin.dto';
import { AccountAdminAuthResponseDto } from 'src/domain/admin/dto/response/account.admin.auth.response';
import { Permission } from '../auth/model/permission';
import { ADMIN_SYSTEM_FEATURES, CLAIM } from '../auth/auth.constants';
import { AuthService } from '../auth/auth.service';
import { ReviewAddOnRequestDto } from 'src/domain/admin/dto/request/review.add.on.request.dto';
import { AccountRepository } from '../account/account.respository';

const adminPermissions: Permission[] = [
  { authorization: ADMIN_SYSTEM_FEATURES.APPLICATIONS, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: ADMIN_SYSTEM_FEATURES.TENANTS, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: ADMIN_SYSTEM_FEATURES.DASHBOARD, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: ADMIN_SYSTEM_FEATURES.MANAGERS, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: ADMIN_SYSTEM_FEATURES.LISTING, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: ADMIN_SYSTEM_FEATURES.TRANSACTIONS, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: ADMIN_SYSTEM_FEATURES.PERSONA, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: ADMIN_SYSTEM_FEATURES.PROPERTIES, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] }
]

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly authService: AuthService,
    private readonly accountRepository: AccountRepository
  ) { }

  /**
   * 
   * @param data 
   * @returns 
   */
  async create(data: CreateAdminDto): Promise<AccountAdminAuthResponseDto> {
    const admin = await this.adminRepository.create(data, adminPermissions)

    return await this.authService.signAdmin((admin as any)._id)
  }

  async reviewAddOnRequest(admin: string, data: ReviewAddOnRequestDto): Promise<void> {
    const request = await this.accountRepository.reviewAddOnRequest(data.request, data.status, data.comment)

    if (request) {
      request.status = data.status
    }

    throw new NotFoundException()
  }

}

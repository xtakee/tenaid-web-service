import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AccountRepository } from '../account/account.respository';
import { Account } from '../account/model/account.model';
import { AccountToDtoMapper } from '../account/mapper/account.to.dto.mapper';
import { AccountAuthResponseDto, PermissionDto, RoleDto } from 'src/domain/auth/dto/response/account.auth.response.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthHelper } from 'src/core/helpers/auth.helper';
import { Permission } from './model/permission';
import { ACCEPTED_STATUS, CLAIM, MANAGER, PENDING_STATUS, SYSTEM_FEATURES } from './auth.constants';
import { AuthRepository } from './auth.repository';
import { permission } from 'process';



interface AuthRole {
  permissions: PermissionDto[]
  accounts: RoleDto[]
}

const defaultManagerPermissions: Permission[] = [
  { authorization: SYSTEM_FEATURES.MESSAGES, claim: CLAIM.WRITE },
  { authorization: SYSTEM_FEATURES.TENANTS, claim: CLAIM.WRITE },
  { authorization: SYSTEM_FEATURES.PERSONA, claim: CLAIM.WRITE },
  { authorization: SYSTEM_FEATURES.TICKETS, claim: CLAIM.WRITE },
  { authorization: SYSTEM_FEATURES.TRANSACTIONS, claim: CLAIM.WRITE },
  { authorization: SYSTEM_FEATURES.PROPERTIES, claim: CLAIM.WRITE }
]

const defaultAgentPermissions: Permission[] = [
  { authorization: SYSTEM_FEATURES.MESSAGES, claim: CLAIM.WRITE },
  { authorization: SYSTEM_FEATURES.PERSONA, claim: CLAIM.WRITE },
  { authorization: SYSTEM_FEATURES.LISTING, claim: CLAIM.WRITE },
]

const defaultPermissions: Permission[] = [
  { authorization: SYSTEM_FEATURES.PERSONA, claim: CLAIM.WRITE }
]

@Injectable()
export class AuthService {

  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly authRepository: AuthRepository,
    private readonly accountToDtoMapper: AccountToDtoMapper,
    private readonly jwtService: JwtService,
    private readonly authHelper: AuthHelper
  ) { }

  /**
   * 
   * @param user 
   * @returns AuthRole
   */
  private async getManageAccountAndPermission(user: string): Promise<AuthRole> {
    const permissions = await this.authRepository.getOwnPermissions(user)
    const accounts = await this.authRepository.getOwnManagedAccounts(user)
    const manageAccounts = accounts.map(r => {
      return {
        name: `${r.owner.firstName} ${r.owner.lastName}`,
        photo: r.owner.photo,
        id: r.owner._id
      }
    })

    return {
      accounts: manageAccounts,
      permissions: permissions.permissions.map(permission => {
        return {
          authorization: permission.authorization,
          claim: permission.claim
        }
      })
    }
  }

  /**
   * 
   * @param account 
   * @returns AccountAuthResponseDto
   */
  private async getAuthorizationResponse(account: Account): Promise<AccountAuthResponseDto> {
    const dto = this.accountToDtoMapper.map(account)
    const manageAccountsAndPermission = await this.getManageAccountAndPermission((account as any)._id)

    const payload = { sub: (account as any)._id, permission: manageAccountsAndPermission.permissions };
    const auth = this.jwtService.sign(payload)

    return {
      account: dto,
      authorization: auth,
      managedAccounts: manageAccountsAndPermission.accounts.length > 1
        ? manageAccountsAndPermission.accounts
        : null
    }
  }

  /**
   * Logs in a registered account
   * @param username 
   * @param password 
   * @returns AccountAuthResponseDto
   */
  async login(username: string, password: string): Promise<AccountAuthResponseDto> {

    const account: Account = await this.accountRepository.getOneByEmail(username)

    if (account) {
      const isMatch = await this.authHelper.isMatch(password, account.password);

      if (isMatch) {
        return await this.getAuthorizationResponse(account)
      }
    }

    throw new UnauthorizedException();
  }

  /**
   * 
   * @param addOnType 
   * @param user 
   */
  async setDefaultOwnerPermissions(addOnType: string, user: string): Promise<void> {
    const permissions = addOnType === MANAGER ? defaultManagerPermissions : defaultAgentPermissions
    await this.authRepository.setOwnerPermissions(user, permissions, PENDING_STATUS)
  }

  /**
   * 
   * @param addOnType 
   * @param user 
   */
  async setPersonaPermissions(user: string): Promise<void> {
    const permissions = defaultPermissions
    await this.authRepository.setOwnerPermissions(user, permissions, ACCEPTED_STATUS)
  }

  /**
   * Signs and returns a account authorization payload
   * @param id 
   * @returns AccountAuthResponseDto
   */
  async sign(id: string): Promise<AccountAuthResponseDto> {
    const account: Account = await this.accountRepository.getOneById(id)
    if (account) return await this.getAuthorizationResponse(account)
    throw new UnauthorizedException();
  }
}

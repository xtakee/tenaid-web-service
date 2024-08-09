import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AccountRepository } from '../account/account.respository';
import { Account } from '../account/model/account.model';
import { AccountToDtoMapper } from '../account/mapper/account.to.dto.mapper';
import { AccountAuthResponseDto } from 'src/domain/auth/dto/response/account.auth.response.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthHelper } from 'src/core/helpers/auth.helper';
import { MANAGER, defaultAgentPermissions, defaultManagerPermissions, defaultPermissions } from './auth.constants';
import { AuthRepository } from './auth.repository';
import { AdminRepository } from '../admin/admin.repository';
import { PermissionDto } from 'src/domain/core/model/permission';
import { AccountAdminAuthResponseDto } from 'src/domain/admin/dto/response/account.admin.auth.response';
import { AccountAdmin } from '../admin/model/account.admin.model';
import { AccountAdminToDtoMapper } from '../admin/mapper/account.admin.to.dto.mapper';
import { Role } from 'src/domain/account/dto/response/account.response.dto';

interface AuthRole {
  permissions: PermissionDto[]
  accounts: Role[]
}

@Injectable()
export class AuthService {

  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly authRepository: AuthRepository,
    private readonly accountToDtoMapper: AccountToDtoMapper,
    private readonly adminRepository: AdminRepository,
    private readonly adminAccountMapper: AccountAdminToDtoMapper,
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
    const manageAccounts = accounts.map(response => {
      return {
        name: `${response.owner.firstName} ${response.owner.lastName}`,
        photo: response.owner.photo,
        id: response.owner._id
      }
    })

    return {
      accounts: manageAccounts,
      permissions: permissions.permissions.map((permission: PermissionDto) => {
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

    const payload = { sub: (account as any)._id, permissions: manageAccountsAndPermission.permissions };
    const token = this.jwtService.sign(payload)

    dto.managedAccounts = manageAccountsAndPermission.accounts.length > 1
      ? manageAccountsAndPermission.accounts
      : []

    const key = (account as any)._id.toString()
    const authorization = this.authHelper.encrypt(key)
    await this.authRepository.saveAuthToken(key, token)

    return {
      account: dto,
      authorization: authorization
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
 * Logs in a registered account
 * @param username 
 * @param password 
 * @returns AccountAdminAuthResponseDto
 */
  async loginAdmin(username: string, password: string): Promise<AccountAdminAuthResponseDto> {

    const account: AccountAdmin = await this.adminRepository.getOneByEmail(username)

    if (account) {
      const isMatch = await this.authHelper.isMatch(password, account.password);

      if (isMatch) {
        return await this.getAdminAuthorizationResponse(account)
      }
    }

    throw new UnauthorizedException();
  }

  /**
   * 
   * @param user 
   * @returns void
   */
  async logout(user: string): Promise<void> {
    return await this.authRepository.invalidateAuthToken(user)
  }

  /**
   * 
   * @param addOnType 
   * @param user 
   */
  async setDefaultOwnerPermissions(addOnType: string, user: string): Promise<void> {
    const permissions = addOnType === MANAGER ? defaultManagerPermissions : defaultAgentPermissions
    await this.authRepository.setPermissions(user, permissions)
  }

  /**
   * 
   * @param addOnType 
   * @param user 
   */
  async setPersonaPermissions(user: string): Promise<void> {
    await this.authRepository.setPermissions(user, defaultPermissions)
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

  /**
   * 
   * @param account 
   * @returns AccountAdminAuthResponseDto
   */
  private async getAdminAuthorizationResponse(account: AccountAdmin): Promise<AccountAdminAuthResponseDto> {
    const dto = this.adminAccountMapper.map(account)

    const permissions: PermissionDto[] = account.permissions?.map((permission => {
      return {
        authorization: permission.authorization,
        claim: permission.claim
      }
    }))

    const payload = { sub: (account as any)._id, permissions: permissions };
    const token = this.jwtService.sign(payload)

    const key = (account as any)._id.toString()
    const authorization = this.authHelper.encrypt(key)
    await this.authRepository.saveAuthToken(key, token)

    return {
      account: dto,
      authorization: authorization
    }
  }

  /**
   * 
   * @param id 
   * @returns AccountAdminAuthResponseDto
   */
  async signAdmin(id: string): Promise<AccountAdminAuthResponseDto> {
    const admin = await this.adminRepository.getOneById(id)
    if (admin) return await this.getAdminAuthorizationResponse(admin)

    throw new UnauthorizedException()
  }
}

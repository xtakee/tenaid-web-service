import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AccountRepository } from '../account/account.respository';
import { Account } from '../account/model/account.model';
import { AccountToDtoMapper } from '../account/mapper/account.to.dto.mapper';
import { AccountAuthResponseDto } from 'src/feature/auth/dto/response/account.auth.response.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthHelper } from 'src/core/helpers/auth.helper';
import { MANAGER, defaultAgentPermissions, defaultManagerPermissions, defaultPermissions } from './auth.constants';
import { AuthRepository } from './auth.repository';
import { AdminRepository } from '../admin/admin.repository';
import { PermissionDto } from 'src/feature/core/model/permission';
import { AccountAdminAuthResponseDto } from 'src/feature/admin/dto/response/account.admin.auth.response';
import { AccountAdmin } from '../admin/model/account.admin.model';
import { AccountAdminToDtoMapper } from '../admin/mapper/account.admin.to.dto.mapper';
import { CodeGenerator } from 'src/core/helpers/code.generator';

@Injectable()
export class AuthService {

  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly authRepository: AuthRepository,
    private readonly accountToDtoMapper: AccountToDtoMapper,
    private readonly adminRepository: AdminRepository,
    private readonly adminAccountMapper: AccountAdminToDtoMapper,
    private readonly jwtService: JwtService,
    private readonly authHelper: AuthHelper,
    private readonly codeGenerator: CodeGenerator
  ) { }

  /**
   * 
   * @param user 
   * @returns PermissionDto[]
   */
  private async getUserManageAccountPermissions(user: string): Promise<PermissionDto[]> {
    const permissions = await this.accountRepository.getOwnPermissions(user)

    return permissions.permissions.map((permission: PermissionDto) => {
      return {
        authorization: permission.authorization,
        claim: permission.claim
      }
    })
  }

  /**
 * 
 * @param user 
 * @returns PermissionDto[]
 */
  private async getManageAccountPermissions(id: string): Promise<PermissionDto[]> {
    const managedAccounts = await this.accountRepository.getManagedAccountById(id)

    return managedAccounts.permissions.map((permission: PermissionDto) => {
      return {
        authorization: permission.authorization,
        claim: permission.claim,
        account: managedAccounts.account.toString(),
        owner: managedAccounts.owner.toString()
      }
    })
  }

  /**
   * 
   * @param account 
   * @returns AccountAuthResponseDto
   */
  private async getAuthorizationResponse(account: Account): Promise<AccountAuthResponseDto> {
    const dto = this.accountToDtoMapper.map(account)

    const permissions = await this.getUserManageAccountPermissions((account as any)._id)

    const payload = { sub: (account as any)._id, sub_0: (account as any)._id, permissions: permissions };
    const token = this.jwtService.sign(payload)

    const key = (account as any)._id.toString()
    const authorization = this.authHelper.encrypt(key)
    this.authRepository.saveAuthToken(key, token)

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
    await this.accountRepository.setPermissions(user, permissions)
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
    this.authRepository.saveAuthToken(key, token)

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

  async signManagedAccount(user: string, id: string): Promise<AccountAuthResponseDto> {
    const permissions = await this.getManageAccountPermissions(id)
    if (permissions) {
      if (permissions[0].account !== user) throw new UnauthorizedException()

      const account = await this.accountRepository.getOneById(permissions[0].account)
      const owner = await this.accountRepository.getOneById(permissions[0].owner)
      if (account && owner) {
        account.primaryAccountType = owner.primaryAccountType
        account.accountTypes = owner.accountTypes

        const dto = this.accountToDtoMapper.map(account)
        const payload = { sub: (owner as any)._id, sub_0: (account as any)._id, permissions: permissions };

        const token = this.jwtService.sign(payload)

        const key = (account as any)._id.toString()
        const authorization = this.authHelper.encrypt(key)
        this.authRepository.saveAuthToken(key, token)

        return {
          account: dto,
          authorization: authorization
        }
      }

      throw new UnauthorizedException()
    }

    throw new NotFoundException()
  }
}

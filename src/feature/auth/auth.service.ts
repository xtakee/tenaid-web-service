import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
import { INVALID_LOGIN_ERROR } from 'src/core/strings';
import { CommunityRepository } from '../community/community.repository';
import { AccessPointAuthResponseDto } from './dto/response/access.point.auth.response.dto';
import { CommunityToDtoMapper } from '../community/mapper/community.to.dto.mapper';
import { Community } from '../community/model/community';
import { E2eeService } from '../e2ee/e2ee.service';
import { MessageRepository } from '../message/message.repository';

@Injectable()
export class AuthService {

  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly authRepository: AuthRepository,
    private readonly e2eeService: E2eeService,
    private readonly accountToDtoMapper: AccountToDtoMapper,
    private readonly adminRepository: AdminRepository,
    private readonly adminAccountMapper: AccountAdminToDtoMapper,
    private readonly jwtService: JwtService,
    private readonly communityMapper: CommunityToDtoMapper,
    private readonly authHelper: AuthHelper,
    private readonly messageRepository: MessageRepository,
    private readonly communityRepository: CommunityRepository
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
  private async getAuthorizationResponse(account: Account, publicKey: string, platform: string): Promise<AccountAuthResponseDto> {

    const dto = this.accountToDtoMapper.map(account)
    const primaryManagedCommunity = await this.communityRepository.getAccountPrimaryManagedCommunity((account as any)._id.toString())

    if (primaryManagedCommunity) {
      dto.communityKycAcknowledged = account.kyc.profileCompleted && primaryManagedCommunity.kycAcknowledged

      // add account primary community
      dto.primaryCommunityId = (primaryManagedCommunity as any)._id
      dto.communitySetup = {
        street: primaryManagedCommunity.communitySetup?.street === true,
        building: primaryManagedCommunity.communitySetup?.building === true,
        member: primaryManagedCommunity.communitySetup?.member === true
      }
    }

    const permissions = await this.getUserManageAccountPermissions((account as any)._id)

    const payload = {
      sub: (account as any)._id,
      sub_0: (account as any)._id,
      permissions: permissions,
      email: account.email.value,
      platform: platform
    }

    const token = this.jwtService.sign(payload)

    const platformKey = `${(account as any)._id.toString()}-${platform}`

    const authorization = this.authHelper.encrypt(platformKey)
    this.authRepository.saveAuthToken(platformKey, token)

    const encKey = await this.e2eeService.generateKeys((account as any)._id.toString(), {
      platform: platform,
      publicKey: publicKey
    })

    return {
      account: dto,
      authorization: authorization,
      key: encKey
    }
  }

  /**
   * Logs in a registered account
   * @param username 
   * @param password 
   * @returns AccountAuthResponseDto
   */
  async login(username: string, password: string, publicKey: string, platform: string): Promise<AccountAuthResponseDto> {
    const account: Account = await this.accountRepository.getOneByEmail(username.trim().toLowerCase())

    if (account) {
      const isMatch = await this.authHelper.isMatch(password, account.password)

      if (isMatch) {
        return await this.getAuthorizationResponse(account, publicKey, platform)
      }
    }

    throw new BadRequestException(INVALID_LOGIN_ERROR)
  }

  /**
 * Logs in a registered account
 * @param username 
 * @param password 
 * @returns AccountAdminAuthResponseDto
 */
  async loginAdmin(username: string, password: string): Promise<AccountAdminAuthResponseDto> {

    const account: AccountAdmin = await this.adminRepository.getOneByEmail(username.trim().toLowerCase())

    if (account) {
      const isMatch = await this.authHelper.isMatch(password, account.password);

      if (isMatch) {
        return await this.getAdminAuthorizationResponse(account)
      }
    }

    throw new BadRequestException(INVALID_LOGIN_ERROR);
  }

  /**
   * 
   * @param user 
   * @returns void
   */
  async logout(user: string, platform: string): Promise<void> {
    await this.authRepository.invalidateAuthToken(`${user}-${platform}`)
    await this.accountRepository.deleteDeviceToken(user, platform)
    await this.messageRepository.removeAccountMessageNode(user, platform)
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

    const payload = { sub: (account as any)._id, permissions: permissions, email: account.email.value };
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

    throw new BadRequestException()
  }

  /**
   * 
   * @param community 
   * @param access 
   * @param password 
   * @returns 
   */
  async signInCommunityAccessPoint(community: string, access: string, password: string): Promise<AccessPointAuthResponseDto> {
    const accessPoint = await this.communityRepository.getCommunityAccessPoint(community, access)
    if (accessPoint) {
      const isMatch = await this.authHelper.isMatch(password, accessPoint.password)
      if (isMatch) {
        const payload = { sub: (accessPoint as any).community._id.toString(), sub_0: (accessPoint as any).account };
        const token = this.jwtService.sign(payload)

        const key = (accessPoint as any)._id.toString()
        const authorization = this.authHelper.encrypt(key)
        this.authRepository.saveAuthToken(key, token)

        return {
          account: {
            id: (accessPoint as any)._id,
            name: accessPoint.name,
            description: accessPoint.description,
            community: this.communityMapper.map(accessPoint.community as Community)
          },
          authorization
        }
      }
    }

    throw new BadRequestException()
  }

  /**
   * 
   * @param user 
   * @param id 
   * @returns 
   */
  async signManagedAccount(user: string, id: string): Promise<AccountAuthResponseDto> {
    const permissions = await this.getManageAccountPermissions(id)
    if (permissions) {
      if (permissions[0].account !== user) throw new BadRequestException()

      const account = await this.accountRepository.getOneById(permissions[0].account)
      const owner = await this.accountRepository.getOneById(permissions[0].owner)
      if (account && owner) {
        account.primaryAccountType = owner.primaryAccountType
        account.accountTypes = owner.accountTypes

        const dto = this.accountToDtoMapper.map(account)
        const payload = { sub: (owner as any)._id, sub_0: (account as any)._id, permissions: permissions, email: owner.email.value };

        const token = this.jwtService.sign(payload)

        const key = (account as any)._id.toString()
        const authorization = this.authHelper.encrypt(key)
        this.authRepository.saveAuthToken(key, token)

        return {
          account: dto,
          authorization: authorization
        }
      }

      throw new BadRequestException()
    }

    throw new NotFoundException()
  }
}

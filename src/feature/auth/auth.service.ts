import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { AccountRepository } from '../account/account.respository'
import { Account } from '../account/model/account'
import { AccountToDtoMapper } from '../account/mapper/account.to.dto.mapper'
import { AccountAuthResponseDto } from 'src/feature/auth/dto/response/account.auth.response.dto'
import { JwtService } from '@nestjs/jwt'
import { AuthHelper } from 'src/core/helpers/auth.helper'
import { AuthRepository } from './auth.repository'
import { AdminRepository } from '../admin/admin.repository'
import { PermissionDto } from 'src/feature/core/model/permission'
import { AccountAdminAuthResponseDto } from 'src/feature/admin/dto/response/account.admin.auth.response'
import { AccountAdmin } from '../admin/model/account.admin.model'
import { AccountAdminToDtoMapper } from '../admin/mapper/account.admin.to.dto.mapper'
import { INVALID_LOGIN_ERROR } from 'src/core/strings'
import { CommunityRepository } from '../community/community.repository'
import { AccessPointAuthResponseDto } from './dto/response/access.point.auth.response.dto'
import { E2eeService } from '../e2ee/e2ee.service'
import { MessageRepository } from '../message/message.repository'
import { AccessPointAuthRequestDto } from './dto/request/access.point.auth.request.dto'
import { defaultCommunityGuardPermissions } from './auth.constants'

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
    private readonly authHelper: AuthHelper,
    private readonly messageRepository: MessageRepository,
    private readonly communityRepository: CommunityRepository
  ) { }

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
        account: managedAccounts.account.toString()
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
    const primaryMemberCommunity = await this.communityRepository.getAccountPrimaryCommunity((account as any)._id.toString())

    if (primaryManagedCommunity) {
      dto.communityKycAcknowledged = account.kyc.profileCompleted && primaryManagedCommunity.kycAcknowledged

      dto.communitySetup = {
        street: primaryManagedCommunity.communitySetup?.street === true,
        building: primaryManagedCommunity.communitySetup?.building === true,
        member: primaryManagedCommunity.communitySetup?.member === true
      }
    }

    const primaryAccountId = primaryManagedCommunity ? (primaryManagedCommunity as any)?._id?.toString() : null
    const permissions = primaryManagedCommunity ?
      await this.accountRepository.getOwnPermissions(primaryAccountId, (account as any)._id)
      : []

    const payload = {
      sub: (account as any)._id,
      sub_0: (account as any)._id,
      permissions: permissions,
      primaryMember: primaryMemberCommunity?._id.toString(),
      primaryCommunity: primaryMemberCommunity?.community?.id.toString(),
      primaryManagedCommunity: primaryAccountId,
      email: account.email.value,
      platform: platform
    }

    const token = this.jwtService.sign(payload)

    const platformKey = `${(account as any)._id.toString()}-${platform}`

    const authorization = this.authHelper.encrypt(platformKey)
    await this.authRepository.saveAuthToken(platformKey, token)

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
      const isMatch = await this.authHelper.isMatch(password, account.password)

      if (isMatch) {
        return await this.getAdminAuthorizationResponse(account)
      }
    }

    throw new BadRequestException(INVALID_LOGIN_ERROR)
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

    const payload = { sub: (account as any)._id, permissions: permissions, email: account.email.value }
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

    throw new BadRequestException()
  }

  /**
   * 
   * @param community 
   * @param access 
   * @param password 
   * @returns 
   */
  async signInCommunityAccessPoint(community: string, data: AccessPointAuthRequestDto): Promise<AccessPointAuthResponseDto> {
    const gaurd = await this.communityRepository.getCommunityGuardByEmail(community, data.email)
    if (!gaurd) throw new BadRequestException()

    console.log(gaurd)
    const isMatch = await this.authHelper.isMatch(data.password, gaurd.password)
    if (isMatch) {
      const payload = {
        sub: (gaurd as any)._id,
        sub_0: community,
        permissions: defaultCommunityGuardPermissions,
        primaryCommunity: community,
        primaryManagedCommunity: community,
        email: gaurd.email.value,
        platform: 'mobile'
      }

      const token = this.jwtService.sign(payload)

      const key = (gaurd as any)._id.toString()
      const authorization = this.authHelper.encrypt(key)
      await this.authRepository.saveAuthToken(key, token)

      return {
        account: {
          _id: (gaurd as any)._id,
          name: gaurd.fullName,
          community: community,
          email: gaurd.email
        },
        authorization
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
        const payload = { sub: (owner as any)._id, sub_0: (account as any)._id, permissions: permissions, email: owner.email.value }

        const token = this.jwtService.sign(payload)

        const key = (account as any)._id.toString()
        const authorization = this.authHelper.encrypt(key)
        await this.authRepository.saveAuthToken(key, token)

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

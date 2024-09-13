import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { AccountRepository } from "./account.respository";
import { AccountCreateDto } from "src/feature/account/dto/request/account.create.dto";
import { AccountUpdateDto } from "src/feature/account/dto/request/account.update.dto";
import { AccountResponseDto, Role } from "src/feature/account/dto/response/account.response.dto";
import { AccountToDtoMapper } from "./mapper/account.to.dto.mapper";
import { AddBankAccountDto } from "src/feature/account/dto/request/add.bank.account.dto";
import { BankAccountResponseDto } from "src/feature/account/dto/response/bank.account.response.dts";
import { BankRepository } from "../bank/bank.repository";
import { BankAccountToDtoMapper } from "./mapper/bank.account.to.dto.mapper";
import { AccountProfileDto } from "src/feature/account/dto/request/account.profile.dto";
import { AddressDto } from "src/feature/core/dto/address.dto";
import { ADD_ON, CLAIM, SYSTEM_FEATURES, defaultAgentPermissions, defaultManagerPermissions, defaultPermissions } from "../auth/auth.constants";
import { UpdateBankAccountDto } from "src/feature/account/dto/request/update.bank.account.dto";
import { Permission } from "../auth/model/permission";
import { DUPLICATE_ACCOUNT_ERROR, DUPLICATE_ADD_ON_REQUEST_ERROR, DUPLICATE_BANK_ERROR, INVALID_OTP } from "src/core/strings";
import { ForgotPasswordResponseDto } from "src/feature/account/dto/response/forgot.password.response.dto";
import { AuthHelper } from "src/core/helpers/auth.helper";
import { Types } from "mongoose";
import { ResetForgotPasswordDto } from "src/feature/account/dto/request/reset.password.dto";
import { CommunityRepository } from "../community/community.repository";
import { PaginatedResult } from "src/core/helpers/paginator";
import { DeviceTokenRequestDto } from "./dto/request/device.token.request.dto";

@Injectable()
export class AccountService {

  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly mapper: AccountToDtoMapper,
    private readonly authHelper: AuthHelper,
    private readonly communityRepository: CommunityRepository,
    private readonly bankRepository: BankRepository,
    private readonly bankMapper: BankAccountToDtoMapper
  ) { }

  /**
   * 
   * @param type 
   * @returns 
   */
  private getPermissons(type: string): Permission[] {
    switch (type) {
      case ADD_ON.AGENT: return defaultAgentPermissions
      case ADD_ON.MANAGER: return defaultManagerPermissions
    }
  }

  /**
   * 
   * @param data 
   * @returns AccountAuthResponseDto
   */
  async create(data: AccountCreateDto): Promise<AccountResponseDto> {
    let account = await this.accountRepository.getOneByEmail(data.email.trim().toLowerCase())

    if (!account) {
      account = await this.accountRepository.create(data)
      await this.setPersonaPermissions((account as any)._id)
      return this.mapper.map(account)
    }

    throw new ForbiddenException(DUPLICATE_ACCOUNT_ERROR)
  }

  /**
 * 
 * @param addOnType 
 * @param user 
 */
  async setPersonaPermissions(user: string): Promise<void> {
    await this.accountRepository.setPermissions(user, defaultPermissions)
  }

  /**
   * 
   * @param user 
   * @param addOn 
   */
  async setAddOnPermissions(user: string, addOn: string): Promise<void> {
    this.accountRepository.setPermissions(user, this.getPermissons(addOn))
  }

  /**
   *
   * @param data 
   * @param id 
   * @returns AccountResponseDto
   */
  async updateAccount(data: AccountUpdateDto, id: string): Promise<AccountResponseDto> {
    let account = await this.accountRepository.updateAccount(id, data)
    if (account) return this.mapper.map(account)

    throw new NotFoundException()
  }

  /**
   * 
   * @param data 
   * @param id 
   * @returns AccountResponseDto
   */
  async updateAddress(data: AddressDto, id: string): Promise<AccountResponseDto> {
    let account = await this.accountRepository.updateAddress(id, data)
    if (account) {
      account = await this.accountRepository.setAddressKyc(id)

      // community permissions
      await this.accountRepository.addPermission(id, {
        authorization: SYSTEM_FEATURES.COMMUNITIES,
        claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE]
      })
      return this.mapper.map(account)
    }

    throw new NotFoundException()
  }

  /**
   * 
   * @param data 
   * @param id 
   * @returns BankAccountResponseDto
   */
  async addBankAccount(data: AddBankAccountDto, id: string): Promise<BankAccountResponseDto> {
    const bank = await this.bankRepository.findOneById(data.bank)
    const existing = await this.accountRepository.getBankAccountByNumber((bank as any)._id, data.number, id)

    if (existing) throw new ForbiddenException(DUPLICATE_BANK_ERROR)

    if (bank) {
      const account = await this.accountRepository.addBankAccount(id, data.number, bank, data.isPrimary)
      this.accountRepository.setBankingKyc(id)
      return this.bankMapper.map(account)
    }
    throw new NotFoundException()
  }

  /**
   * 
   * @param data 
   * @param user 
   * @returns 
   */
  async updateBankAccount(data: UpdateBankAccountDto, user: string): Promise<BankAccountResponseDto> {
    const bank = await this.bankRepository.findOneById(data.bank)

    if (bank) {
      const account = await this.accountRepository.updateBankAccount(user, data.account, data.number, bank, data.isPrimary)
      return this.bankMapper.map(account)
    }

    throw new NotFoundException()
  }

  /**
   * 
   * @param user 
   * @returns 
   */
  async getManagedAccounts(user: string): Promise<Role[]> {
    const accounts = await this.accountRepository.getOwnManagedAccounts(user)

    return accounts.map(response => {
      return {
        name: `${response.owner.firstName} ${response.owner.lastName}`,
        photo: response.owner.photo,
        email: response.owner.email.value,
        id: response._id,
        isOwner: response.owner._id.toString() === user
      }
    })
  }

  /**
   * 
   * @param data 
   * @param id 
   * @returns 
   */
  async requestAddOn(type: string, id: string): Promise<void> {
    const prev = await this.accountRepository.getExistingAddOnRequest(id, type)
    if (prev) throw new ForbiddenException(DUPLICATE_ADD_ON_REQUEST_ERROR)

    const request = await this.accountRepository.requestAddOn(id, type)

    if (request) return
    throw new BadRequestException()
  }

  /**
   * 
   * @param user 
   * @param addOn 
   * @returns AccountResponseDto
   */
  async setAccountType(user: string, addOn: string, status: boolean): Promise<AccountResponseDto> {
    const account = await this.accountRepository.setAccountType(user, addOn, status)
    if (account) {
      if (addOn !== ADD_ON.TENANT) {
        await this.requestAddOn(addOn, user)
      }
      return this.mapper.map(account)
    }

    throw new ForbiddenException(DUPLICATE_ADD_ON_REQUEST_ERROR)
  }

  /**
   * 
   * @param user 
   * @param bank 
   * @returns BankAccountResponseDto
   */
  async getBankAccount(user: string, bank: string): Promise<BankAccountResponseDto> {
    let account = await this.accountRepository.getBankAccount(bank, user)
    if (account) return this.bankMapper.map(account)

    throw new NotFoundException()
  }

  /**
   * 
   * @param user 
   * @returns BankAccountResponseDto[]
   */
  async getBankAccounts(user: string): Promise<BankAccountResponseDto[]> {
    let accounts = await this.accountRepository.getBankAccounts(user)
    return accounts.map(b => this.bankMapper.map(b))
  }

  /**
   * AccountResponseDto
   * @param user 
   * @returns AccountResponseDto
   */
  async getOwnAccount(user: string): Promise<AccountResponseDto> {
    const account = await this.accountRepository.getOneById(user)
    if (account) return this.mapper.map(account)

    throw new NotFoundException()
  }

  /**
   * 
   * @param user 
   * @param data 
   * @returns AccountResponseDto
   */
  async updateProfile(user: string, data: AccountProfileDto): Promise<AccountResponseDto> {
    let account = await this.accountRepository.updateProfile(user, data)
    if (account) return this.mapper.map(account)

    throw new NotFoundException()
  }

  async forgotPassword(email: string): Promise<ForgotPasswordResponseDto> {
    const account = await this.accountRepository.getOneByEmail(email)
    let signature: string = ''
    const otp: string = this.authHelper.randomDigits(6)

    if (account) {
      const key = (account as any)._id.toString()
      signature = this.authHelper.encrypt(key)
      await this.accountRepository.saveOtp(key, otp)
      // send otp to user email address
    } else {
      signature = this.authHelper.encrypt((new Types.ObjectId()).toString())
    }

    return {
      signature
    }
  }

  /**
   * 
   * @param signature 
   * @param otp 
   */
  async resetPassword(data: ResetForgotPasswordDto): Promise<void> {
    try {
      const key = this.authHelper.decrypt(data.signature)
      const savedOtp = await this.accountRepository.getOtp(key)

      if (savedOtp === data.otp) {
        const account = await this.accountRepository.updatePassword(key, data.password)
        if (account) return
      }

    } catch (error) { }

    throw new BadRequestException(INVALID_OTP)
  }

  /**
   * 
   * @param user 
   * @param password 
   */
  async changePassword(user: string, password: string): Promise<void> {
    const account = await this.accountRepository.updatePassword(user, password)
    if (account) return

    throw new UnauthorizedException()
  }

  /**
 * 
 * @param user 
 * @param page 
 * @param limit 
 * @returns 
 */
  async getAccountCommunities(user: string, page: number, limit: number): Promise<PaginatedResult<any>> {
    return await this.communityRepository.getAllAccountCommunities(user, page, limit)
  }

  /**
   * 
   * @param user 
   * @param body 
   */
  async setDevicePushToken(user: string, body: DeviceTokenRequestDto): Promise<void> {
    await this.accountRepository.setDevicePushToken(user, body)
  }
}

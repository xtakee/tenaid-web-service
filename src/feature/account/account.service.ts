import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { AccountRepository } from "./account.respository";
import { AccountCreateDto } from "src/domain/account/dto/request/account.create.dto";
import { AuthService } from "../auth/auth.service";
import { AccountAuthResponseDto } from "src/domain/auth/dto/response/account.auth.response.dto";
import { AccountUpdateDto } from "src/domain/account/dto/request/account.update.dto";
import { AccountResponseDto } from "src/domain/account/dto/response/account.response.dto";
import { AccountToDtoMapper } from "./mapper/account.to.dto.mapper";
import { AddBankAccountDto } from "src/domain/account/dto/request/add.bank.account.dto";
import { BankAccountResponseDto } from "src/domain/account/dto/response/bank.account.response.dts";
import { BankRepository } from "../bank/bank.repository";
import { BankAccountToDtoMapper } from "./mapper/bank.account.to.dto.mapper";
import { AccountProfileDto } from "src/domain/account/dto/request/account.profile.dto";
import { AddressUpdateDto } from "src/domain/account/dto/request/address.update.dto";
import { ADD_ON } from "../auth/auth.constants";

@Injectable()
export class AccountService {

  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly authService: AuthService,
    private readonly mapper: AccountToDtoMapper,
    private readonly bankRepository: BankRepository,
    private readonly bankMapper: BankAccountToDtoMapper
  ) { }

  /**
   * 
   * @param data 
   * @returns AccountAuthResponseDto
   */
  async create(data: AccountCreateDto): Promise<AccountAuthResponseDto> {
    let account = await this.accountRepository.getOneByEmail(data.email)

    if (!account) {
      account = await this.accountRepository.create(data)
      await this.authService.setPersonaPermissions((account as any)._id)
      return await this.authService.sign((account as any)._id)
    }

    throw new ForbiddenException('Duplicate')
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
  async updateAddress(data: AddressUpdateDto, id: string): Promise<AccountResponseDto> {
    let account = await this.accountRepository.updateAddress(id, data)
    if (account) return this.mapper.map(account)

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

    if (existing) throw new ForbiddenException('Duplicate')

    if (bank) {
      const account = await this.accountRepository.addBankAccount(id, data.number, bank, data.isPrimary)
      return this.bankMapper.map(account)
    }
    throw new NotFoundException()
  }

  /**
   * 
   * @param data 
   * @param id 
   * @returns 
   */
  async requestAddOn(type: string, id: string): Promise<void> {
    const prev = await this.accountRepository.getExistingAddOnRequest(id, type)
    if (prev) throw new ForbiddenException()

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
  async setAccountType(user: string, addOn: string): Promise<AccountResponseDto> {
    const account = await this.accountRepository.setAccountType(user, addOn)
    if (account) {
      if (addOn !== ADD_ON.TENANT) {
        await this.requestAddOn(addOn, user)
      }
      return this.mapper.map(account)
    }

    throw new ForbiddenException()
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
  async updateProfilee(user: string, data: AccountProfileDto): Promise<AccountResponseDto> {
    let account = await this.accountRepository.updateProfile(user, data)
    if (account) return this.mapper.map(account)

    throw new NotFoundException()
  }
}

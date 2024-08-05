import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
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

@Injectable()
export class AccountService {

  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly authService: AuthService,
    private readonly mapper: AccountToDtoMapper,
    private readonly bankRepository: BankRepository,
    private readonly bankMapper: BankAccountToDtoMapper
  ) { }

  async create(data: AccountCreateDto): Promise<AccountAuthResponseDto> {
    let account = await this.accountRepository.getOneByEmail(data.email)

    if (!account) {
      account = await this.accountRepository.create(data)
      return await this.authService.sign((account as any)._id)
    }

    throw new ForbiddenException('Duplicate')
  }

  async updateAccount(data: AccountUpdateDto, id: string): Promise<AccountResponseDto> {
    let account = await this.accountRepository.updateAccount(id, data)
    if (account) {
      return this.mapper.map(account)
    }
    throw new NotFoundException()
  }

  async addBankAccount(data: AddBankAccountDto, id: string): Promise<BankAccountResponseDto> {
    const bank = await this.bankRepository.findOneById(data.bank)
    const existing = await this.accountRepository.getBankAccountByNumber((bank as any)._id, data.number, id)

    if(existing) throw new ForbiddenException('Duplicate')

    if (bank) {
      const account = await this.accountRepository.addBankAccount(id, data.number, bank, data.isPrimary)
      return this.bankMapper.map(account)
    }
    throw new NotFoundException()
  }

  /**
   * 
   * @param user 
   * @param bank 
   * @returns BankAccountResponseDto
   */
  async getBankAccount(user: string, bank: string): Promise<BankAccountResponseDto> {
    let account = await this.accountRepository.getBankAccount(bank, user)
    if (account) {
      return this.bankMapper.map(account)
    }
    throw new NotFoundException()
  }

  async getBankAccounts(user: string): Promise<BankAccountResponseDto[]> {
    let accounts = await this.accountRepository.getBankAccounts(user)
    return accounts.map(b => this.bankMapper.map(b))
  }

}

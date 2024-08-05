import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { AccountCreateDto } from "../../domain/account/dto/request/account.create.dto";
import { AccountService } from "./account.service";
import { AccountAuthResponseDto } from "src/domain/auth/dto/response/account.auth.response.dto";
import { AccountUpdateDto } from "src/domain/account/dto/request/account.update.dto";
import { AccountResponseDto } from "src/domain/account/dto/response/account.response.dto";
import { CurrentUser } from "src/core/decorators/current.user";
import { JwtAuthGuard } from "../auth/jwt.auth.gaurd";
import { AddBankAccountDto } from "src/domain/account/dto/request/add.bank.account.dto";
import { BankAccountResponseDto } from "src/domain/account/dto/response/bank.account.response.dts";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";

@Controller({
  version: '1',
  path: "account",
})
export class AccountController {

  constructor(private readonly accountService: AccountService) { }

  @Post('bank')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a bank account' })
  @UseGuards(JwtAuthGuard)
  async addBankAccount(@Body() body: AddBankAccountDto, @CurrentUser('id') id: string): Promise<BankAccountResponseDto> {
    return await this.accountService.addBankAccount(body, id)
  }

  @Post('')
  @ApiOperation({ summary: 'Create an account' })
  async create(@Body() body: AccountCreateDto): Promise<AccountAuthResponseDto> {
    return await this.accountService.create(body)
  }

  @Patch('')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update first and last names' })
  @UseGuards(JwtAuthGuard)
  async updateAccount(@Body() body: AccountUpdateDto, @CurrentUser('id') id: string): Promise<AccountResponseDto> {
    return await this.accountService.updateAccount(body, id)
  }

  @Get('bank')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all account\'s Bank Accounts' })
  @UseGuards(JwtAuthGuard)
  async getBankAccounts(@CurrentUser('id') user: string): Promise<BankAccountResponseDto[]> {
    return await this.accountService.getBankAccounts(user)
  }

  @Get('bank/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an account\'s Bank Account' })
  @UseGuards(JwtAuthGuard)
  async getBankAccount(@Param('id') bank: string, @CurrentUser('id') user: string): Promise<BankAccountResponseDto> {
    return await this.accountService.getBankAccount(user, bank)
  }
}

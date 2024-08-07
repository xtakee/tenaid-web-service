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
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AccountProfileDto } from "src/domain/account/dto/request/account.profile.dto";
import { AddressUpdateDto } from "src/domain/account/dto/request/address.update.dto";
import { AddOnRequestDto } from "src/domain/account/dto/request/add.on.request.dto";

@Controller({
  version: '1',
  path: "account",
})
@ApiTags('Account')
export class AccountController {

  constructor(private readonly accountService: AccountService) { }

  /**
   * 
   * @param body 
   * @param id 
   * @returns BankAccountResponseDto
   */
  @Post('bank')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a bank account' })
  @UseGuards(JwtAuthGuard)
  async addBankAccount(@Body() body: AddBankAccountDto, @CurrentUser('id') id: string): Promise<BankAccountResponseDto> {
    return await this.accountService.addBankAccount(body, id)
  }

  /**
   * 
   * @param body 
   * @param id 
   * @returns 
   */
  @Post('add-on')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set account type' })
  @UseGuards(JwtAuthGuard)
  async setCanOwnProperty(@Body() body: AddOnRequestDto, @CurrentUser('id') id: string): Promise<AccountResponseDto> {
    return await this.accountService.setAddOn(body, id)
  }

  /**
   * 
   * @param body 
   * @returns AccountAuthResponseDto
   */
  @Post('')
  @ApiOperation({ summary: 'Create an account' })
  async create(@Body() body: AccountCreateDto): Promise<AccountAuthResponseDto> {
    return await this.accountService.create(body)
  }

  /**
   * 
   * @param body 
   * @param id 
   * @returns AccountResponseDto
   */
  @Patch('name')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update first and last names' })
  @UseGuards(JwtAuthGuard)
  async updateName(@Body() body: AccountUpdateDto, @CurrentUser('id') id: string): Promise<AccountResponseDto> {
    return await this.accountService.updateAccount(body, id)
  }

  /**
   * 
   * @param body 
   * @param id 
   * @returns AccountResponseDto
   */
  @Patch('address')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Address' })
  @UseGuards(JwtAuthGuard)
  async updateAddess(@Body() body: AddressUpdateDto, @CurrentUser('id') id: string): Promise<AccountResponseDto> {
    return await this.accountService.updateAddress(body, id)
  }

  /**
   * 
   * @param body 
   * @param id 
   * @returns AccountResponseDto
   */
  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update dob, phone, photo and proof-of-ID' })
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Body() body: AccountProfileDto, @CurrentUser('id') id: string): Promise<AccountResponseDto> {
    return await this.accountService.updateProfilee(id, body)
  }

  /**
   * 
   * @param user 
   * @returns BankAccountResponseDto
   */
  @Get('bank')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all account\'s Bank Accounts' })
  @UseGuards(JwtAuthGuard)
  async getBankAccounts(@CurrentUser('id') user: string): Promise<BankAccountResponseDto[]> {
    return await this.accountService.getBankAccounts(user)
  }

  /**
   * 
   * @param id 
   * @returns AccountResponseDto
   */
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Own Account Details' })
  @UseGuards(JwtAuthGuard)
  async getOwnAcccount(@CurrentUser('id') id: string): Promise<AccountResponseDto> {
    return await this.accountService.getOwnAccount(id)
  }

  /**
   * 
   * @param bank 
   * @param user 
   * @returns BankAccountResponseDto
   */
  @Get('bank/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an account\'s Bank Account' })
  @UseGuards(JwtAuthGuard)
  async getBankAccount(@Param('id') bank: string, @CurrentUser('id') user: string): Promise<BankAccountResponseDto> {
    return await this.accountService.getBankAccount(user, bank)
  }
}

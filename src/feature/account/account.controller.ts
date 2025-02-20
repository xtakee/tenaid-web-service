import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { AccountCreateDto } from "./dto/request/account.create.dto";
import { AccountService } from "./account.service";
import { AccountUpdateDto } from "src/feature/account/dto/request/account.update.dto";
import { AccountResponseDto, Role } from "src/feature/account/dto/response/account.response.dto";
import { AddBankAccountDto } from "src/feature/account/dto/request/add.bank.account.dto";
import { BankAccountResponseDto } from "src/feature/account/dto/response/bank.account.response.dts";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AccountProfileDto } from "src/feature/account/dto/request/account.profile.dto";
import { AddOnRequestDto } from "src/feature/account/dto/request/add.on.request.dto";
import { CheckPolicies } from "../auth/guards/casl/policies.guard";
import { ADD_ON, CLAIM, SYSTEM_FEATURES } from "../auth/auth.constants";
import { Auth, BasicAuth } from "../auth/guards/auth.decorator";
import { MongoAbility } from "@casl/ability";
import { UpdateBankAccountDto } from "src/feature/account/dto/request/update.bank.account.dto";
import { isEmail, IsEmail, isMongoId } from "class-validator";
import { ForgotPasswordDto } from "src/feature/account/dto/request/forgot.password.dto";
import { ForgotPasswordResponseDto } from "src/feature/account/dto/response/forgot.password.response.dto";
import { ResetForgotPasswordDto } from "src/feature/account/dto/request/reset.password.dto";
import { ChangePasswordDto } from "src/feature/account/dto/request/change.password.dto";
import { AddressDto } from "src/feature/core/dto/address.dto";
import { PaginatedResult } from "src/core/helpers/paginator";
import { DateDto, PaginationRequestDto } from "../core/dto/pagination.request.dto";
import { DeviceTokenRequestDto } from "./dto/request/device.token.request.dto";
import { UpdateInfoDto } from "./dto/request/update.info.dto";
import { User } from "src/core/decorators/user";
import { RootUser } from "src/core/decorators/root.user";
import { Email } from "src/core/decorators/email";
import { Platform } from "src/core/decorators/platfom";

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
  @ApiOperation({ summary: 'Add a bank account' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.BANK_ACCOUNT))
  async addBankAccount(@Body() body: AddBankAccountDto, @User() id: string): Promise<BankAccountResponseDto> {
    return await this.accountService.addBankAccount(body, id)
  }

  /**
 * 
 * @param body 
 * @param id 
 * @returns BankAccountResponseDto
 */
  @Patch('bank')
  @ApiOperation({ summary: 'Update a bank account' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.BANK_ACCOUNT))
  async updateBankAccount(@Body() body: UpdateBankAccountDto, @User() id: string): Promise<BankAccountResponseDto> {
    return await this.accountService.updateBankAccount(body, id)
  }

  /**
   * 
   * @param body 
   * @param id 
   * @returns 
   */
  @Post('add-on')
  @ApiOperation({ summary: 'Request Account AddOn' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.PERSONA))
  async requestAddOn(@Body() body: AddOnRequestDto, @User() id: string): Promise<void> {
    return await this.accountService.requestAddOn(body.addOn, id)
  }

  @Post('type')
  @ApiOperation({ summary: 'Set Primary Account Type' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.PERSONA))
  async setAccountType(@Body() body: AddOnRequestDto, @User() id: string): Promise<AccountResponseDto> {
    return await this.accountService.setAccountType(id, body.addOn, body.addOn === ADD_ON.TENANT)
  }

  /**
   * 
   * @param body 
   * @returns AccountAuthResponseDto
   */
  @Post('')
  @ApiOperation({ summary: 'Create an account' })
  async create(@Body() body: AccountCreateDto): Promise<AccountResponseDto> {
    return await this.accountService.create(body)
  }

  /**
   * 
   * @param body 
   * @param id 
   * @returns AccountResponseDto
   */
  @Patch('name')
  @ApiOperation({ summary: 'Update first and last names' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.PERSONA))
  async updateName(@Body() body: AccountUpdateDto, @User() id: string): Promise<AccountResponseDto> {
    return await this.accountService.updateAccount(body, id)
  }

  /**
  * 
  * @param user 
  * @param community 
  * @param body 
  * @returns 
  */
  @Post('/:community/kyc/acknowledge')
  @ApiOperation({ summary: 'Acknowledge account community kyc' })
  @BasicAuth()
  async acknowledgeAccountCommunityKyc(
    @User() user: string,
    @Param('community') community: string): Promise<void> {
    if (!isMongoId(community)) throw new BadRequestException()
    await this.accountService.acknowledgeAccountCommunityKyc(user, community)
  }

  /**
   * 
   * @param body 
   * @param id 
   * @returns AccountResponseDto
   */
  @Patch('address')
  @ApiOperation({ summary: 'Update Address' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.PERSONA))
  async updateAddess(@Body() body: AddressDto, @User() id: string): Promise<AccountResponseDto> {
    return await this.accountService.updateAddress(body, id)
  }

  /**
   * 
   * @param body 
   * @param id 
   * @returns AccountResponseDto
   */
  @Patch('profile')
  @ApiOperation({ summary: 'Update dob, phone, photo and proof-of-ID' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.PERSONA))
  async updateProfile(@Body() body: AccountProfileDto, @User() id: string): Promise<AccountResponseDto> {
    return await this.accountService.updateProfile(id, body)
  }

  @Patch('info')
  @ApiOperation({ summary: 'Update dob, phone, photo, firstname and lastname' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.PERSONA))
  async updateProfileInfo(@Body() body: UpdateInfoDto, @User() id: string): Promise<AccountResponseDto> {
    return await this.accountService.updateProfileInfo(id, body)
  }

  /**
   * 
   * @param id 
   * @returns 
   */
  @Get('managed')
  @ApiOperation({ summary: 'Get Managed Accounts' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, SYSTEM_FEATURES.PERSONA))
  async getManagedAccounts(@User() id: string): Promise<Role[]> {
    return await this.accountService.getManagedAccounts(id)
  }

  /**
   * 
   * @param user 
   * @returns BankAccountResponseDto
   */
  @Get('bank')
  @ApiOperation({ summary: 'Get all account\'s Bank Accounts' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, SYSTEM_FEATURES.PERSONA))
  async getBankAccounts(@User() user: string): Promise<BankAccountResponseDto[]> {
    return await this.accountService.getBankAccounts(user)
  }

  /**
   * 
   * @param id 
   * @returns AccountResponseDto
   */
  @Get('me')
  @ApiOperation({ summary: 'Get Own Account Details' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, SYSTEM_FEATURES.PERSONA))
  async getOwnAcccount(@User() id: string): Promise<AccountResponseDto> {
    return await this.accountService.getOwnAccount(id)
  }

  /**
   * 
   * @param bank 
   * @param user 
   * @returns BankAccountResponseDto
   */
  @Get('bank/:id')
  @ApiOperation({ summary: 'Get an account\'s Bank Account' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, SYSTEM_FEATURES.PERSONA))
  async getBankAccount(@Param('id') bank: string, @User() user: string): Promise<BankAccountResponseDto> {
    if (!isMongoId(bank)) throw new BadRequestException()
    return await this.accountService.getBankAccount(user, bank)
  }

  /**
   * 
   * @param body 
   * @returns 
   */
  @Post('forgot-password')
  @ApiOperation({ summary: 'Forgot Password' })
  async forgotPassword(@Body() body: ForgotPasswordDto): Promise<ForgotPasswordResponseDto> {
    return await this.accountService.forgotPassword(body.email)
  }

  /**
   * 
   * @param email 
   * @returns 
   */
  @Get('exists')
  @BasicAuth()
  @ApiOperation({ summary: 'Check if an account exists using email address' })
  async getAccountByEmail(@Query('email') email: string): Promise<any> {
    if (!isEmail(email)) throw new BadRequestException()
    return await this.accountService.getAccountByEmail(email)
  }

  /**
   * 
   * @param body 
   * @returns 
   */
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset Password' })
  async resetPassword(@Body() body: ResetForgotPasswordDto): Promise<void> {
    return await this.accountService.resetPassword(body)
  }

  /**
   * 
   * @param user 
   * @param body 
   * @returns 
   */
  @Post('change-password')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.PERSONA))
  async changePassword(@RootUser() user: string, @Body() body: ChangePasswordDto): Promise<void> {
    return await this.accountService.changePassword(user, body.password)
  }
  /**
   * 
   * @param user 
   * @returns 
   */
  @Get('community/managed')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all account managed communities' })
  async getAccountManagedCommunities(@User() user: string, @Platform() platform: string, @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.accountService.getAccountManagedCommunities(user, platform, paginate)
  }

  @Get('/last-message/unread')
  @BasicAuth()
  @ApiOperation({ summary: 'Get latest unread account message' })
  @ApiQuery({ name: 'date', required: false, type: String })
  async getCommunityLatestUnreadMessage(
    @User() user: string,
    @Query() date?: DateDto,
  ): Promise<any> {
    return await this.accountService.getCommunityLatestUnreadMessage(user, date.date)
  }

  /**
 * 
 * @param community 
 * @param limit 
 * @param page 
 * @returns 
 */
  @Get('community/')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all account communities' })
  async getAccountCommunities(@User() user: string, @Platform() platform: string, @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.accountService.getAccountCommunities(user, platform, paginate)
  }

  /**
   * 
   * @param email 
   * @returns 
   */
  @Get('community/pending-invite')
  @BasicAuth()
  @ApiOperation({ summary: 'Get account pending community invite' })
  async getAccountPendingCommunityInvites(@Email() email: string): Promise<PaginatedResult<any>> {
    return await this.accountService.getAccountPendingCommunityInvites(email)
  }

  @Post('push-token')
  @BasicAuth()
  @ApiOperation({ summary: 'Update account device push token' })
  async setDevicePushToken(@User() user: string, @Body() body: DeviceTokenRequestDto): Promise<void> {
    return await this.accountService.setDevicePushToken(user, body)
  }
}

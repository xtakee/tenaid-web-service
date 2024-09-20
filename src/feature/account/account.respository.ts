import { AccountCreateDto } from "src/feature/account/dto/request/account.create.dto";
import { IAccountRepository } from "src/domain/account/iaccount.repository";
import { Account, AccountType } from "./model/account.model";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AccountUpdateDto } from "src/feature/account/dto/request/account.update.dto";
import { BankAccount } from "./model/bank.account.model";
import { Bank } from "../bank/model/bank.model";
import { AccountProfileDto } from "src/feature/account/dto/request/account.profile.dto";
import { AddressDto } from "src/feature/core/dto/address.dto";
import { Address } from "../core/model/address.model";
import { AddOnRequest } from "./model/add.on.request.model";
import { PaginatedResult, Paginator } from "src/core/helpers/paginator";
import { ManagedAccount } from "./model/managed.account";
import { Permission } from "../auth/model/permission";
import { CacheService } from "src/services/cache/cache.service";
import { mergeArray } from "src/core/helpers/array.helper";
import { DeviceToken } from "./model/device.token";
import { DeviceTokenRequestDto } from "./dto/request/device.token.request.dto";
import { UpdateInfoDto } from "./dto/request/update.info.dto";

@Injectable()
export class AccountRepository implements IAccountRepository {

  constructor(
    @InjectModel(Account.name) private readonly accountModel: Model<Account>,
    private readonly paginator: Paginator,
    private readonly cache: CacheService,
    @InjectModel(AddOnRequest.name) private readonly addOnRequestModel: Model<AddOnRequest>,
    @InjectModel(DeviceToken.name) private readonly deviceTokenModel: Model<DeviceToken>,
    @InjectModel(ManagedAccount.name) private readonly managedAccountModel: Model<ManagedAccount>,
    @InjectModel(BankAccount.name) private readonly bankAccountModel: Model<BankAccount>) { }

  /**
   * 
   * @param email 
   * @returns Account
   */
  async getOneByEmail(email: string): Promise<Account> {
    return await this.accountModel.findOne({ "email.value": email }).exec();
  }

  /**
   * 
   * @param user 
   * @param addOn 
   * @param status 
   * @returns 
   */
  async setAccountType(user: string, addOn: string, status: boolean): Promise<Account> {
    const account = await this.accountModel.findById(user)

    if (!account) return null
    // Only tenants accounts are approved by default
    const type = { type: addOn, approved: status }

    let types: AccountType[] = account.accountTypes
    if (types.length === 0) types = [type]
    else {
      // prevent duplicate account types
      if (types.find(t => t.type === addOn)) return null
      types.push(type)
    }

    return await this.accountModel.findByIdAndUpdate(user, {
      primaryAccountType: addOn,
      accountTypes: types
    }, { returnDocument: 'after' }).exec()
  }

  /**
   * 
   * @param id 
   * @returns Account
   */
  async getOneById(id: string): Promise<Account> {
    return await this.accountModel.findById(id);
  }

  async updateAccount(id: string, data: AccountUpdateDto): Promise<Account> {
    return this.accountModel.findByIdAndUpdate(id, {
      firstName: data.firstName,
      lastName: data.lastName
    }, { returnDocument: 'after' }).exec()
  }

  /**
   * 
   * @param id 
   * @param data 
   * @returns Account
   */
  async updateAddress(id: string, data: AddressDto): Promise<Account> {
    const address: Address = {
      address: data.address,
      proofOfAddress: data.proofOfAddress,
      city: data.city,
      country: data.country,
      postalCode: data.postalCode
    }

    return this.accountModel.findByIdAndUpdate(id, {
      address: address
    }, { returnDocument: 'after' }).exec()
  }

  /**
   * 
   * @param id 
   * @param data 
   * @returns Account
   */
  async updateProfile(id: string, data: AccountProfileDto): Promise<Account> {
    return await this.accountModel.findByIdAndUpdate(id, {
      dob: data.dob,
      phone: data.phone,
      photo: data.photo,
      proofOfId: data.proofOfId,
      'kyc.profileCompleted': true
    }, { returnDocument: 'after' }).exec()
  }

  /**
   * 
   * @param id 
   * @param data 
   * @returns 
   */
  async updateProfileInfo(id: string, data: UpdateInfoDto): Promise<Account> {
    return await this.accountModel.findByIdAndUpdate(id, {
      dob: new Date(data.dob),
      phone: data.phone,
      photo: data.photo,
      country: data.country,
      firstName: data.firstName,
      lastName: data.lastName,
      'kyc.profileCompleted': true
    }, { returnDocument: 'after' }).exec()
  }

  /**
   * 
   * @param id 
   * @param user 
   * @returns BankAccount
   */
  async getBankAccount(id: string, user: string): Promise<BankAccount> {
    return await this.bankAccountModel.findOne({ _id: new Types.ObjectId(id), account: new Types.ObjectId(user) }).exec()
  }

  /** BankAccount[]
  * @param user 
  * @returns 
  */
  async getBankAccounts(user: string): Promise<BankAccount[]> {
    return await this.bankAccountModel.find({ account: new Types.ObjectId(user) }).exec()
  }

  /**
   * 
   * @param bank 
   * @param number 
   * @param user 
   * @returns 
   */
  async getBankAccountByNumber(bank: string, number: string, user: string): Promise<BankAccount> {
    return await this.bankAccountModel.findOne({ 'bank._id': new Types.ObjectId(bank), account: new Types.ObjectId(user), number: number }).exec()
  }

  /**
   * 
   * @param id 
   * @param number 
   * @param bank 
   * @param isPrimary 
   * @returns BankAccount
   */
  async addBankAccount(id: string, number: string, bank: Bank, isPrimary: boolean): Promise<BankAccount> {
    if (isPrimary) {
      // set all primary to false
      await this.bankAccountModel.findOneAndUpdate({ account: new Types.ObjectId(id) }, {
        isPrimary: false
      }, { returnDocument: 'after' })
    }

    const bankAccount: BankAccount = {
      number: number,
      isPrimary: isPrimary,
      bank: bank,
      account: new Types.ObjectId(id)
    }

    return await this.bankAccountModel.create(bankAccount)
  }

  /**
   * 
   * @param user 
   * @returns 
   */
  async setBankingKyc(user: string): Promise<Account> {
    return await this.accountModel.findByIdAndUpdate(user, { 'kyc.bankingCompleted': true }, { returnDocument: 'after' })
  }

  /**
   * 
   * @param user 
   * @returns 
   */
  async setProfileKyc(user: string): Promise<Account> {
    return await this.accountModel.findByIdAndUpdate(user, { 'kyc.profileCompleted': true }, { returnDocument: 'after' })
  }

  /**
   * 
   * @param user 
   * @returns 
   */
  async setAddressKyc(user: string): Promise<Account> {
    return await this.accountModel.findByIdAndUpdate(user, { 'kyc.addressCompleted': true }, { returnDocument: 'after' })
  }

  /**
   * 
   * @param id 
   * @param number 
   * @param bank 
   * @param isPrimary 
   */
  async updateBankAccount(user: string, account: string, number: string, bank: Bank, isPrimary: boolean): Promise<BankAccount> {
    if (isPrimary) {
      // set all primary to false
      await this.bankAccountModel.findOneAndUpdate({ account: new Types.ObjectId(user) }, {
        isPrimary: false
      }, { returnDocument: 'after' })
    }

    return await this.bankAccountModel.findByIdAndUpdate(account, {
      isPrimary: isPrimary,
      bank: bank,
      number: number
    }, { returnDocument: 'after' })
  }

  /**
   * 
   * @param data 
   * @returns Account
   */
  async create(data: AccountCreateDto): Promise<Account> {
    const account: Account = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      country: data.country,
      kyc: {},
      email: {
        value: data.email.trim().toLowerCase()
      },
      password: data.password
    }

    return await this.accountModel.create(account)
  }

  /**
   * 
   * @param id 
   * @returns AddOnRequest
   */
  async reviewAddOnRequest(id: string, status: string, comment: string, admin: string): Promise<AddOnRequest> {
    return await this.addOnRequestModel.findByIdAndUpdate(id, {
      status: status,
      comment: comment,
      reviewer: admin
    }, { returnDocument: 'after' }).exec()
  }

  async getAllAddOnRequests(page?: number, limit?: number): Promise<PaginatedResult<AddOnRequest>> {
    return await this.paginator.paginate(this.addOnRequestModel, {},
      {
        select: '_id account addOn status createdAt',
        limit: limit,
        page: page,
        populate: [{ path: 'account', select: ' _id firstName lastName email.value phone photo' }]
      })
  }

  /**
   * 
   * @param id 
   * @returns 
   */
  async getAddOnRequest(id: string): Promise<AddOnRequest> {
    return await this.addOnRequestModel.findById(id)
  }

  /**
   * 
   * @param page 
   * @param limit 
   * @returns 
   */
  async getAllRegisteredTenants(page?: number, limit?: number): Promise<PaginatedResult<Account>> {
    return await this.paginator.paginate(this.accountModel,
      { 'accountTypes.type': 'can-lease' },
      {
        select: '_id firstName lastName email.value email.verified photo phone createdAt',
        limit: limit,
        page: page
      })
  }

  /**
 * 
 * @param page 
 * @param limit 
 * @returns 
 */
  async getAllRegisteredAgents(page?: number, limit?: number): Promise<PaginatedResult<Account>> {
    return await this.paginator.paginate(this.accountModel,
      { 'accountTypes.type': 'can-publish' },
      {
        select: '_id firstName lastName email.value email.verified photo phone createdAt',
        limit: limit,
        page: page
      })
  }

  /**
* 
* @param page 
* @param limit 
* @returns 
*/
  async getAllRegisteredManagers(page?: number, limit?: number): Promise<PaginatedResult<Account>> {
    return await this.paginator.paginate(this.accountModel,
      { 'accountTypes.type': 'can-own' },
      {
        select: '_id firstName lastName email.value email.verified photo phone createdAt',
        limit: limit,
        page: page
      })
  }

  /**
 * 
 * @param id 
 * @returns AddOnRequest
 */
  async getExistingAddOnRequest(id: string, addOn: string): Promise<AddOnRequest> {
    return await this.addOnRequestModel.findOne({ account: new Types.ObjectId(id), addOn: addOn })
  }

  /**
   * 
   * @param user 
   * @param addOnType 
   * @returns Account
   */
  async requestAddOn(user: string, addOnType: string): Promise<AddOnRequest> {

    const addOn: AddOnRequest = {
      account: new Types.ObjectId(user),
      addOn: addOnType
    }

    return await this.addOnRequestModel.create(addOn)
  }

  /**
  * 
  * @param user 
  * @returns 
  */
  async getOwnManagedAccounts(user: string): Promise<any> {
    return await this.managedAccountModel.find({ account: new Types.ObjectId(user) }, '_id owner account')
      .populate({
        path: 'owner',
        select: '_id firstName lastName photo email.value',
        strictPopulate: false
      }
      ).exec()
  }

  /**
  * 
  * @param user 
  * @returns 
  */
  async getOwnPermissions(user: string): Promise<ManagedAccount> {
    return await this.managedAccountModel
      .findOne({ account: new Types.ObjectId(user), owner: new Types.ObjectId(user), }, '_id permissions')
  }

  /**
* 
* @param id 
* @returns 
*/
  async getManagedAccountById(id: string): Promise<ManagedAccount> {
    return await this.managedAccountModel.findById(id, '_id permissions account owner')
  }

  /**
   * 
   * @param key 
   * @param otp 
   */
  async saveOtp(key: string, otp: string): Promise<void> {
    // expires in 10 minutes
    await this.cache.set(key, otp, 600)
  }

  /**
   * 
   * @param key 
   */
  async getOtp(key: string): Promise<string> {
    // expires in 10 minutes
    return await this.cache.get(key)
  }

  /**
   * 
   * @param user 
   * @param password 
   * @returns 
   */
  async updatePassword(user: string, password: string): Promise<Account> {
    return await this.accountModel.findByIdAndUpdate(user, { password: password }, { returnDocument: 'after' })
  }

  /**
   * 
   * @param user 
   */
  async setQuickActionsFlag(user: string): Promise<void> {
    this.accountModel.findByIdAndUpdate(user, {
      'flags.quickActions': true,
      'flags.joinCommunity': false,
    }).exec()
  }

  /**
   * 
   * @param user 
   */
  async clearWelcomeFlag(user: string): Promise<void> {
    this.accountModel.findByIdAndUpdate(user, {
      'flags.welcome': false
    }).exec()
  }

  /**
 * 
 * @param user 
 */
  async setJoinFlagStatus(user: string, status: boolean): Promise<void> {
    await this.accountModel.findOneAndUpdate({
      _id: new Types.ObjectId(user),
      'flags.quickActions': false
    }, {
      'flags.joinCommunity': status,
    }, { returnDocument: 'after' }).exec()
  }

  /**
   * 
   * @param user 
   * @param status 
   */
  async setCreateFlagStatus(user: string, status: boolean): Promise<void> {
    await this.accountModel.findOneAndUpdate({
      _id: new Types.ObjectId(user),
      'flags.quickActions': false
    }, {
      'flags.createCommunity': status,
    }, { returnDocument: 'after' }).exec()
  }

  /**
   * 
   * @param user 
   * @param status 
   */
  async setAllDashboardFlagStatus(user: string): Promise<void> {
    this.accountModel.findByIdAndUpdate(user, {
      'flags.joinCommunity': false,
      'flags.createCommunity': false,
      'flags.welcome': false,
      'flags.quickActions': true
    }).exec()
  }

  /**
 * 
 * @param user 
 * @param addOnType 
 * @param status 
 * @returns AuthRole
 */
  async setPermissions(user: string, permissions: Permission[]): Promise<ManagedAccount> {
    const roles = await this.managedAccountModel.findOne({
      account: new Types.ObjectId(user),
      owner: new Types.ObjectId(user)
    })

    if (!roles) {
      const role: ManagedAccount = {
        account: new Types.ObjectId(user),
        owner: new Types.ObjectId(user),
        permissions: permissions
      }

      return await this.managedAccountModel.create(role)
    }

    return await this.managedAccountModel.findByIdAndUpdate((roles as any)._id, {
      permissions: permissions
    }, { returnDocument: 'after' }).exec()
  }

  /**
   * 
   * @param user 
   * @param permission 
   * @returns 
   */
  async addPermission(user: string, permission: Permission): Promise<ManagedAccount> {
    const accountsManaged = await this.managedAccountModel.findOne({
      account: new Types.ObjectId(user),
      owner: new Types.ObjectId(user)
    })

    if (accountsManaged) {
      const permissions = accountsManaged.permissions
      const existing: Permission = permissions?.find((p) => p.authorization === permission.authorization)
      console.log(existing)

      if (!existing) permissions.push(permission)
      else {
        const index = permissions.indexOf(existing)
        existing.claim = mergeArray(existing.claim, permission.claim)
        permissions[index] = existing
      }

      return await this.managedAccountModel.findByIdAndUpdate(
        (accountsManaged as any)._id,
        { permissions: permissions }, { returnDocument: 'after' })

    }

    throw new BadRequestException()
  }

  /**
   * 
   * @param user 
   * @param data 
   */
  async setDevicePushToken(user: string, data: DeviceTokenRequestDto): Promise<void> {
    await this.deviceTokenModel.findOneAndUpdate({ account: new Types.ObjectId(user) }, {
      token: data.token,
      device: data.device
    }, { new: true, upsert: true, returnDocument: 'after' }).exec()
  }

  /**
   * 
   * @param user 
   */
  async getDevicePushToken(user: string): Promise<DeviceToken> {
    return await this.deviceTokenModel.findOne({ account: new Types.ObjectId(user) })
  }

}

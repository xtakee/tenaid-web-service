import { AccountCreateDto } from "src/domain/account/dto/request/account.create.dto";
import { IAccountRepository } from "src/domain/account/iaccount.repository";
import { Account, AccountDocument, AccountType } from "./model/account.model";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AccountUpdateDto } from "src/domain/account/dto/request/account.update.dto";
import { BankAccount } from "./model/bank.account.model";
import { Bank } from "../bank/model/bank.model";
import { AccountProfileDto } from "src/domain/account/dto/request/account.profile.dto";
import { AddressUpdateDto } from "src/domain/account/dto/request/address.update.dto";
import { Address } from "../core/model/address.model";
import { AddOnRequest } from "./model/add.on.request.model";
import { PaginatedResult, Paginator } from "src/core/helpers/paginator";
import { ADD_ON } from "../auth/auth.constants";

@Injectable()
export class AccountRepository implements IAccountRepository {

  constructor(
    @InjectModel(Account.name) private readonly accountModel: Model<Account>,
    private readonly paginator: Paginator,
    @InjectModel(AddOnRequest.name) private readonly addOnRequestModel: Model<AddOnRequest>,
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
   * @returns Account
   */
  async setAccountType(user: string, addOn: string): Promise<Account> {
    const account = await this.accountModel.findById(user)
    console.log(account)
    if (!account) return null
    // Only tenants accounts are approved by default
    const type = { type: addOn, approved: addOn === ADD_ON.TENANT ? true : false }

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
    return this.accountModel.findById(id).exec();
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
  async updateAddress(id: string, data: AddressUpdateDto): Promise<Account> {
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
    return this.accountModel.findByIdAndUpdate(id, {
      dob: data.dob,
      phone: data.phone,
      photo: data.photo,
      proofOfId: data.proofOfId
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
    let bankAccount: BankAccount = {
      number: number,
      isPrimary: isPrimary,
      bank: bank,
      account: new Types.ObjectId(id)
    }

    return await this.bankAccountModel.create(bankAccount)
  }

  /**
   * 
   * @param data 
   * @returns Account
   */
  async create(data: AccountCreateDto): Promise<Account> {
    let account: Account = {
      firstName: data.firstName,
      lastName: data.lastName,
      kyc: {},
      email: {
        value: data.email
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
      { accountTypes: 'can-lease' },
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
      { accountTypes: 'can-publish' },
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
      { accountTypes: 'can-own' },
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

}

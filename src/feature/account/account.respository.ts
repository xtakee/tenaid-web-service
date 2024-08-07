import { AccountCreateDto } from "src/domain/account/dto/request/account.create.dto";
import { IAccountRepository } from "src/domain/account/iaccount.repository";
import { Account, AddOn } from "./model/account.model";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AccountUpdateDto } from "src/domain/account/dto/request/account.update.dto";
import { BankAccount } from "./model/bank.account.model";
import { Bank } from "../bank/model/bank.model";
import { AccountProfileDto } from "src/domain/account/dto/request/account.profile.dto";
import { AddressUpdateDto } from "src/domain/account/dto/request/address.update.dto";
import { Address } from "./model/address.model";
import { AGENT, MANAGER, PENDING_STATUS } from "src/constants";

const defaultAddOn: AddOn = {
  value: false,
  status: PENDING_STATUS
}

const addOnMapper = {
  MANAGER: defaultAddOn,
  AGENT: defaultAddOn
}

@Injectable()
export class AccountRepository implements IAccountRepository {
  constructor(
    @InjectModel(Account.name) private readonly accountModel: Model<Account>,
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
      email: {
        value: data.email
      },
      password: data.password
    }

    return await this.accountModel.create(account)
  }

  /**
   * 
   * @param user 
   * @param addOnType 
   * @returns Account
   */
  async setAddOn(user: string, addOnType: string): Promise<Account> {
    const account = await this.accountModel.findById(user)
    const addOn = addOnMapper[addOnType]

    if (account) {
      if (addOnType === MANAGER) account.canOwn = addOn
      else account.canPublish = addOn

      return await this.accountModel.findByIdAndUpdate(user, account)
    }

    return null
  }

  /**
   * 
   * @param user 
   * @param status 
   * @returns Account
   */
  async setCanOwnAddOn(user: string, status: string): Promise<Account> {
    const account = await this.accountModel.findById(user)
   
    if (account && account.canOwn) {
      const addOn = account.canOwn
      addOn.status = status
      account.canOwn = addOn

      return await this.accountModel.findByIdAndUpdate(user, account)
    }

    return null
  }

  /**
   * 
   * @param user 
   * @param status 
   * @returns Account
   */
  async setCanPublishAddOn(user: string, status: string): Promise<Account> {
    const account = await this.accountModel.findById(user)
   
    if (account && account.canPublish) {
      const addOn = account.canPublish
      addOn.status = status
      account.canPublish = addOn

      return await this.accountModel.findByIdAndUpdate(user, account)
    }

    return null
  }
}

import { AccountCreateDto } from "src/domain/account/dto/request/account.create.dto";
import { IAccountRepository } from "src/domain/account/iaccount.repository";
import { Account } from "./model/account.model";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AccountUpdateDto } from "src/domain/account/dto/request/account.update.dto";
import { BankAccount } from "./model/bank.account.model";
import { Bank } from "../bank/model/bank.model";
import { AccountProfileDto } from "src/domain/account/dto/request/account.profile.dto";
import { AddressUpdateDto } from "src/domain/account/dto/request/address.update.dto";
import { Address } from "./model/address.model";

@Injectable()
export class AccountRepository implements IAccountRepository {
  constructor(
    @InjectModel(Account.name) private readonly accountModel: Model<Account>,
    @InjectModel(BankAccount.name) private readonly bankAccountModel: Model<BankAccount>) { }

  async getOneByEmail(email: string): Promise<Account> {
    return await this.accountModel.findOne({ "email.value": email }).exec();
  }

  async getOneById(id: string): Promise<Account> {
    return this.accountModel.findById(id).exec();
  }

  async updateAccount(id: string, data: AccountUpdateDto): Promise<Account> {
    return this.accountModel.findByIdAndUpdate(id, {
      firstName: data.firstName,
      lastName: data.lastName
    }, { returnDocument: 'after' }).exec()
  }

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

  async updateProfile(id: string, data: AccountProfileDto): Promise<Account> {
    return this.accountModel.findByIdAndUpdate(id, {
      dob: data.dob,
      phone: data.phone,
      photo: data.photo,
      proofOfId: data.proofOfId
    }, { returnDocument: 'after' }).exec()
  }

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

  async addBankAccount(id: string, number: string, bank: Bank, isPrimary: boolean): Promise<BankAccount> {
    let bankAccount: BankAccount = {
      number: number,
      isPrimary: isPrimary,
      bank: bank,
      account: new Types.ObjectId(id)
    }

    return await this.bankAccountModel.create(bankAccount)
  }

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
}

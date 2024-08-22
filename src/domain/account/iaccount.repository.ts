import { AccountCreateDto } from "src/feature/account/dto/request/account.create.dto";
import { Account } from "src/feature/account/model/account.model";

export interface IAccountRepository {
  getOneById(id: string): Promise<Account>
  getOneByEmail(email: string): Promise<Account>
  create(account: AccountCreateDto) : Promise<Account>
}

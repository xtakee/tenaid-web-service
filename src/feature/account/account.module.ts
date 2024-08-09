import { Global, Module, SetMetadata } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from './model/account.model';
import { AccountRepository } from './account.respository';
import { AccountToDtoMapper } from './mapper/account.to.dto.mapper';
import { AuthHelper } from 'src/core/helpers/auth.helper';
import { AuthService } from '../auth/auth.service';
import { BankAccount, BankAccountSchema } from './model/bank.account.model';
import { BankAccountToDtoMapper } from './mapper/bank.account.to.dto.mapper';
import { BankRepository } from '../bank/bank.repository';
import { Bank, BankSchema } from '../bank/model/bank.model';
import { AuthRepository } from '../auth/auth.repository';
import { ManagedAccount, ManagedAccountSchema } from '../auth/model/managed.account';
import { CaslAbilityFactory } from '../auth/guards/casl/casl.ability.factory';
import { PoliciesGuard } from '../auth/guards/casl/policies.guard';
import { CacheService } from 'src/services/cache/cache.service';
import { AddOnRequest, AddOnRequestSchema } from './model/add.on.request.model';
import { AdminRepository } from '../admin/admin.repository';
import { AccountAdmin, AccountAdminSchema } from '../admin/model/account.admin.model';
import { AccountAdminToDtoMapper } from '../admin/mapper/account.admin.to.dto.mapper';

@Global()
@Module({
  imports: [MongooseModule.forFeatureAsync([{
    name: Account.name,
    useFactory: async () => {
      const schema = AccountSchema;
      schema.pre('save', async function () {
        if (this.isModified('password') || this.isNew) {
          this.password = await (new AuthHelper()).hash(this.password)
        }
      });
      return schema;
    },
  }]),
  MongooseModule.forFeatureAsync([{
    name: AccountAdmin.name, useFactory: async () => {
      const schema = AccountAdminSchema;
      schema.pre('save', async function () {
        if (this.isModified('password') || this.isNew) {
          this.password = await (new AuthHelper()).hash(this.password)
        }
      });
      return schema;
    },
  }]),
  MongooseModule.forFeature([{ name: BankAccount.name, schema: BankAccountSchema }]),
  MongooseModule.forFeature([{ name: ManagedAccount.name, schema: ManagedAccountSchema }]),
  MongooseModule.forFeature([{ name: Bank.name, schema: BankSchema }]),
  MongooseModule.forFeature([{ name: AddOnRequest.name, schema: AddOnRequestSchema }])
  ],
  providers: [
    AccountService,
    AccountRepository,
    AccountToDtoMapper,
    AuthService,
    AuthHelper,
    BankAccountToDtoMapper,
    BankRepository,
    AuthRepository,
    PoliciesGuard,
    CaslAbilityFactory,
    CacheService,
    AdminRepository,
    AccountAdminToDtoMapper
  ],
  controllers: [AccountController],
  exports: [
    AccountRepository,
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    MongooseModule.forFeature([{ name: BankAccount.name, schema: BankAccountSchema }]),
    MongooseModule.forFeature([{ name: ManagedAccount.name, schema: ManagedAccountSchema }])
  ]
})
export class AccountModule { }

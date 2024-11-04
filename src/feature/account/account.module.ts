import { Global, Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from './model/account.model';
import { AccountRepository } from './account.respository';
import { AccountToDtoMapper } from './mapper/account.to.dto.mapper';
import { AuthHelper } from 'src/core/helpers/auth.helper';
import { BankAccount, BankAccountSchema } from './model/bank.account.model';
import { BankAccountToDtoMapper } from './mapper/bank.account.to.dto.mapper';
import { BankRepository } from '../bank/bank.repository';
import { Bank, BankSchema } from '../bank/model/bank.model';
import { ManagedAccount, ManagedAccountSchema } from './model/managed.account';
import { CaslAbilityFactory } from '../auth/guards/casl/casl.ability.factory';
import { PoliciesGuard } from '../auth/guards/casl/policies.guard';
import { CacheService } from 'src/services/cache/cache.service';
import { AddOnRequest, AddOnRequestSchema } from './model/add.on.request.model';
import { AdminRepository } from '../admin/admin.repository';
import { AccountAdmin, AccountAdminSchema } from '../admin/model/account.admin.model';
import { AccountAdminToDtoMapper } from '../admin/mapper/account.admin.to.dto.mapper';
import { Paginator } from 'src/core/helpers/paginator';
import { DeviceToken, DeviceTokenSchema } from './model/device.token';
import { searchable } from 'src/core/util/searchable';
import { CommunityModule } from '../community/community.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeatureAsync([{
      name: Account.name,
      useFactory: async () => {
        const schema = AccountSchema;
        schema.pre('save', async function () {
          if (this.isModified('password') || this.isNew) {
            this.password = await (new AuthHelper()).hash(this.password)
          }

          if (this.isModified('firstName') || this.isModified('lastName') || this.isNew) {
            this.searchable = searchable(`${this.firstName} ${this.lastName}`)
          }
        });

        schema.pre('findOneAndUpdate', async function (next) {
          if ((this.getUpdate() as any).password) {
            (this.getUpdate() as any).password = await (new AuthHelper()).hash((this.getUpdate() as any).password)
          }

          if ((this.getUpdate() as any).firstName || (this.getUpdate() as any).lastName) {
            (this.getUpdate() as any).searchable = searchable(`${(this.getUpdate() as any).firstName} ${(this.getUpdate() as any).lastName}`)
          }
          next()
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

        schema.pre('findOneAndUpdate', async function (next) {
          if ((this.getUpdate() as any).password) {
            (this.getUpdate() as any).password = await (new AuthHelper()).hash((this.getUpdate() as any).password)
          }
          next()
        });

        return schema;
      },
    }]),

    MongooseModule.forFeature([{ name: BankAccount.name, schema: BankAccountSchema }]),
    MongooseModule.forFeature([{ name: DeviceToken.name, schema: DeviceTokenSchema }]),
    MongooseModule.forFeature([{ name: ManagedAccount.name, schema: ManagedAccountSchema }]),
    MongooseModule.forFeature([{ name: Bank.name, schema: BankSchema }]),
    MongooseModule.forFeature([{ name: AddOnRequest.name, schema: AddOnRequestSchema }]),
    CommunityModule
  ],
  providers: [
    AccountService,
    AccountRepository,
    AccountToDtoMapper,
    AuthHelper,
    BankAccountToDtoMapper,
    BankRepository,
    PoliciesGuard,
    CaslAbilityFactory,
    CacheService,
    AdminRepository,
    AccountAdminToDtoMapper,
    Paginator
  ],
  controllers: [AccountController],
  exports: [
    AccountRepository,
    AccountService,
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    MongooseModule.forFeature([{ name: BankAccount.name, schema: BankAccountSchema }]),
    MongooseModule.forFeature([{ name: ManagedAccount.name, schema: ManagedAccountSchema }])
  ]
})
export class AccountModule { }

import { Global, Module, UseGuards } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccountRepository } from '../account/account.respository';
import { JwtModule } from '@nestjs/jwt';
import { JwtConstants } from './jwt.constants';
import { AccountToDtoMapper } from '../account/mapper/account.to.dto.mapper';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { Account, AccountSchema } from '../account/model/account.model';
import { AuthHelper } from 'src/core/helpers/auth.helper';
import { BankAccount, BankAccountSchema } from '../account/model/bank.account.model';
import { AuthRepository } from './auth.repository';
import { ManagedAccount, ManagedAccountSchema } from '../account/model/managed.account';
import { CaslAbilityFactory } from './guards/casl/casl.ability.factory';
import { PoliciesGuard } from './guards/casl/policies.guard';
import { CacheService } from 'src/services/cache/cache.service';
import { AdminRepository } from '../admin/admin.repository';
import { AccountAdminToDtoMapper } from '../admin/mapper/account.admin.to.dto.mapper';
import { Paginator } from 'src/core/helpers/paginator';
import { AccountAdmin, AccountAdminSchema } from '../admin/model/account.admin.model';
import { Counter, CounterSchema } from '../core/counter/model/counter.model';
import { CounterRepository } from '../core/counter/counter.repository';
import { CodeGenerator } from 'src/core/helpers/code.generator';

@Global()
@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AccountRepository,
    AccountToDtoMapper,
    AuthHelper,
    AuthRepository,
    CaslAbilityFactory,
    PoliciesGuard,
    CacheService,
    AdminRepository,
    AccountAdminToDtoMapper,
    Paginator,
    CodeGenerator
  ],
  exports: [AuthService, AuthRepository, PoliciesGuard, CaslAbilityFactory],
  imports: [
    JwtModule.register({
      global: true,
      secret: JwtConstants.Jwt_Secret,
      signOptions: { expiresIn: '24h' },
    }),
    MongooseModule.forFeatureAsync([{
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
    MongooseModule.forFeature([{ name: ManagedAccount.name, schema: ManagedAccountSchema }])
  ]
})
export class AuthModule { }

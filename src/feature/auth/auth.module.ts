import { Module, SetMetadata } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccountRepository } from '../account/account.respository';
import { JwtModule } from '@nestjs/jwt';
import { JwtConstants } from './jwt.constants';
import { AccountToDtoMapper } from '../account/mapper/account.to.dto.mapper';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { Account, AccountSchema } from '../account/model/account.model';
import { AuthHelper } from 'src/core/helpers/auth.helper';
import { JwtStrategy } from './auth.jwt.strategy';
import { BankAccount, BankAccountSchema } from '../account/model/bank.account.model';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AccountRepository, AccountToDtoMapper, AuthHelper, JwtStrategy],
  exports: [AuthService],
  imports: [
    JwtModule.register({
      global: true,
      secret: JwtConstants.Jwt_Secret,
      signOptions: { expiresIn: '60m' },
    }),
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    MongooseModule.forFeature([{ name: BankAccount.name, schema: BankAccountSchema }])
  ]
})
export class AuthModule { }

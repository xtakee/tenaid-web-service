import { Module } from '@nestjs/common';
import { BankController } from './bank.controller';
import { Bank, BankSchema } from './model/bank.model';
import { MongooseModule } from '@nestjs/mongoose';
import { BankService } from './bank.service';
import { BankModelToDtoMapper } from './mapper/bank.mode.to.dto.mapper';
import { BankRepository } from './bank.repository';
import { AuthHelper } from 'src/core/helpers/auth.helper';

@Module({
  controllers: [BankController],
  imports: [MongooseModule.forFeature([{ name: Bank.name, schema: BankSchema }])],
  providers: [BankService, BankModelToDtoMapper, BankRepository, AuthHelper]
})
export class BankModule { }

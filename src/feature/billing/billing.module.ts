import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Billable, BillableSchema } from './model/billable';
import { Billing, BillingSchema } from './model/billing';
import { AuthModule } from '../auth/auth.module';
import { AuthHelper } from 'src/core/helpers/auth.helper';
import { BillableDtoMapper } from './mapper/billable.dto.mapper';
import { BillingRepository } from './billing.repository';
import { Paginator } from 'src/core/helpers/paginator';

@Module({
  controllers: [BillingController],
  providers: [BillingService, AuthHelper, BillableDtoMapper, BillingRepository, Paginator],
  imports: [
    MongooseModule.forFeature([{ name: Billable.name, schema: BillableSchema }]),
    MongooseModule.forFeature([{ name: Billing.name, schema: BillingSchema }]),
    AuthModule
  ]
})
export class BillingModule {}

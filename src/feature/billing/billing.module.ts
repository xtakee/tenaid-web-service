import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Billable, BillableSchema } from './model/billable';
import { Billing, BillingSchema } from './model/billing';
import { AuthModule } from '../auth/auth.module';
import { AuthHelper } from 'src/core/helpers/auth.helper';

@Module({
  controllers: [BillingController],
  providers: [BillingService, AuthHelper],
  imports: [
    MongooseModule.forFeature([{ name: Billable.name, schema: BillableSchema }]),
    MongooseModule.forFeature([{ name: Billing.name, schema: BillingSchema }]),
    AuthModule
  ]
})
export class BillingModule {}

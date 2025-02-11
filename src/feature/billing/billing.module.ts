import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Billable, BillableSchema } from './model/billable';
import { Billing, BillingSchema } from './model/billing';

@Module({
  controllers: [BillingController],
  providers: [BillingService],
  imports: [
    MongooseModule.forFeature([{ name: Billable.name, schema: BillableSchema }]),
    MongooseModule.forFeature([{ name: Billing.name, schema: BillingSchema }]),
  ]
})
export class BillingModule {}

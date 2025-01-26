import { Module } from '@nestjs/common';
import { UtilityService } from './utility.service';
import { UtilityController } from './utility.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UtilityProduct, UtilityProductSchema } from './model/utility.product';
import { AuthHelper } from 'src/core/helpers/auth.helper';

@Module({
  providers: [UtilityService, AuthHelper,],
  controllers: [UtilityController],
  imports: [MongooseModule.forFeature([{ name: UtilityProduct.name, schema: UtilityProductSchema }])]
})
export class UtilityModule {}

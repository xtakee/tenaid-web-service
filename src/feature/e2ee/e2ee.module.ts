import { Module } from '@nestjs/common';
import { E2eeService } from './e2ee.service';
import { MongooseModule } from '@nestjs/mongoose';
import { E2eeKey, E2eeKeySchema } from './model/e2ee.key';
import { AuthHelper } from 'src/core/helpers/auth.helper';
import { E2eeRepository } from './e2ee.repository';

@Module({
  controllers: [],
  providers: [E2eeService, AuthHelper, E2eeRepository],
  imports: [MongooseModule.forFeature([{ name: E2eeKey.name, schema: E2eeKeySchema }]),],
  exports: [E2eeService, E2eeRepository]
})
export class E2eeModule { }

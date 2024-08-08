import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AccountAdmin, AccountAdminSchema } from './model/account.admin.model';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminRepository } from './admin.repository';

@Module({
  providers: [AdminService, AdminRepository],
  controllers: [AdminController],
  imports: [MongooseModule.forFeature([{ name: AccountAdmin.name, schema: AccountAdminSchema }]),]
})
export class AdminModule { }

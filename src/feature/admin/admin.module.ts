import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AccountAdmin, AccountAdminSchema } from './model/account.admin.model';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminRepository } from './admin.repository';
import { AccountAdminToDtoMapper } from './mapper/account.admin.to.dto.mapper';

@Module({
  providers: [AdminService, AdminRepository, AccountAdminToDtoMapper],
  controllers: [AdminController],
  imports: [MongooseModule.forFeature([{ name: AccountAdmin.name, schema: AccountAdminSchema }])],
  exports: [MongooseModule.forFeature([{ name: AccountAdmin.name, schema: AccountAdminSchema }]),]
})

export class AdminModule { }

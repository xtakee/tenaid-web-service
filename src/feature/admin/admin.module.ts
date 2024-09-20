import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AccountAdmin, AccountAdminSchema } from './model/account.admin.model';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminRepository } from './admin.repository';
import { AccountAdminToDtoMapper } from './mapper/account.admin.to.dto.mapper';
import { AuthHelper } from 'src/core/helpers/auth.helper';
import { CommunityRepository } from '../community/community.repository';
import { Paginator } from 'src/core/helpers/paginator';
import { NotificationService } from '../notification/notification.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  providers: [AdminService, AdminRepository, AccountAdminToDtoMapper, AuthHelper, NotificationService, CommunityRepository, Paginator],
  controllers: [AdminController],
  imports: [MongooseModule.forFeature([{ name: AccountAdmin.name, schema: AccountAdminSchema }]),
  BullModule.registerQueue({
    name: 'notification',
  })],
  exports: [MongooseModule.forFeature([{ name: AccountAdmin.name, schema: AccountAdminSchema }]),]
})

export class AdminModule { }

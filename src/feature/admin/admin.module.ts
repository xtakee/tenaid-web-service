import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AccountAdmin, AccountAdminSchema } from './model/account.admin.model';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminRepository } from './admin.repository';
import { AccountAdminToDtoMapper } from './mapper/account.admin.to.dto.mapper';
import { AuthHelper } from 'src/core/helpers/auth.helper';
import { Paginator } from 'src/core/helpers/paginator';
import { NotificationModule } from '../notification/notification.module';
import { CommunityModule } from '../community/community.module';

@Module({
  providers: [AdminService, AdminRepository, AccountAdminToDtoMapper, AuthHelper, Paginator],
  controllers: [AdminController],
  imports: [
    MongooseModule.forFeature([{ name: AccountAdmin.name, schema: AccountAdminSchema }]),
    MongooseModule.forFeatureAsync([{
      name: AccountAdmin.name, useFactory: async () => {
        const schema = AccountAdminSchema;
        schema.pre('save', async function () {
          if (this.isModified('password') || this.isNew) {
            this.password = await (new AuthHelper()).hash(this.password)
          }
        });
        return schema;
      },
    }]),
    NotificationModule,
    CommunityModule
  ],
  exports: [MongooseModule.forFeature([{ name: AccountAdmin.name, schema: AccountAdminSchema }]),]
})

export class AdminModule { }

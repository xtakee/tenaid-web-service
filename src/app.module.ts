import { Module } from '@nestjs/common';
import { AccountModule } from './feature/account/account.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './feature/admin/admin.module';
import { DatabaseModule } from './core/database/database.module';
import { PropertyModule } from './feature/property/property.module';
import { AuthModule } from './feature/auth/auth.module';
import { BankModule } from './feature/bank/bank.module';
import { CloudinaryModule } from './services/cloudinary/cloudinary.module';
import { FileModule } from './feature/file/file.module';
import { AgentController } from './feature/agent/agent.controller';
import { ManagerController } from './feature/manager/manager.controller';
import { ManagerModule } from './feature/manager/manager.module';
import { AgentModule } from './feature/agent/agent.module';
import { ListingModule } from './feature/listing/listing.module';
import { LocationModule } from './feature/location/location.module';
import { CommunityModule } from './feature/community/community.module';

@Module({
  imports: [
    AccountModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    AdminModule,
    DatabaseModule,
    PropertyModule,
    AuthModule,
    BankModule,
    CloudinaryModule,
    FileModule,
    ManagerModule,
    AgentModule,
    ListingModule,
    LocationModule,
    CommunityModule
  ],
  controllers: [AgentController, ManagerController],
  providers: [],
})
export class AppModule { }

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
import { ManagerModule } from './feature/manager/manager.module';
import { AgentModule } from './feature/agent/agent.module';
import { ListingModule } from './feature/listing/listing.module';
import { LocationModule } from './feature/location/location.module';
import { CommunityModule } from './feature/community/community.module';
import { NotificationModule } from './feature/notification/notification.module';
import { BullModule } from '@nestjs/bullmq';
import { EventModule } from './feature/event/event.module';
import { HealthModule } from './feature/health/health.module';
import { ScheduleModule } from '@nestjs/schedule';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    AccountModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
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
    CommunityModule,
    NotificationModule,
    EventModule,
    HealthModule,
    ScheduleModule.forRoot(),
    JobsModule
  ],
  providers: []
})
export class AppModule { }

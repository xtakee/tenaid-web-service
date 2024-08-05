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

@Module({
  imports: [AccountModule,
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

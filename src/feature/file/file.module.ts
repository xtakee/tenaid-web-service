import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';
import { AuthRepository } from '../auth/auth.repository';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { ManagedAccount, ManagedAccountSchema } from '../auth/model/managed.account';
import { CacheService } from 'src/services/cache/cache.service';
import { AuthHelper } from 'src/core/helpers/auth.helper';

@Module({
  providers: [FileService, CloudinaryService, AuthRepository, CacheService, AuthHelper],
  controllers: [FileController],
  imports: [MongooseModule.forFeature([{ name: ManagedAccount.name, schema: ManagedAccountSchema }])]
})
export class FileModule {}

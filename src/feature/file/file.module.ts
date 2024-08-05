import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';

@Module({
  providers: [FileService, CloudinaryService],
  controllers: [FileController],
  imports: []
})
export class FileModule {}

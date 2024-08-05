import { BadRequestException, Body, Controller, NotFoundException, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileUploadResponseDto } from 'src/domain/file/dto/response/file.response.dto';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/jwt.auth.gaurd';

@Controller({
  path: 'file',
  version: '1'
})
@ApiTags('File')
export class FileController {

  constructor(private readonly cloudinaryService: CloudinaryService) { }

  @Post('upload')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a document/image' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<FileUploadResponseDto> {

    if(!file) throw new BadRequestException()

    const fileExtension = file.originalname.split('.').pop(); // Get the file extension

    const result = await this.cloudinaryService.uploadFile(
      file.buffer,
      fileExtension,
    );

    return {
      url: result.secure_url
    }
  }
}

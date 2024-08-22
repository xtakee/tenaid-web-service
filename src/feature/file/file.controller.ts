import { BadRequestException, Controller, Post, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileUploadResponseDto } from 'src/feature/file/dto/response/file.response.dto';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard/jwt.auth.guard';

@Controller({
  path: 'file',
  version: '1'
})
@ApiTags('File')
export class FileController {

  constructor(private readonly cloudinaryService: CloudinaryService) { }

  /**
   * 
   * @param file 
   * @returns FileUploadResponseDto
   */
  @Post('upload/single')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a single document/image' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<FileUploadResponseDto> {

    if (!file) throw new BadRequestException()

    const fileExtension = file.originalname.split('.').pop(); // Get the file extension

    const result = await this.cloudinaryService.uploadFile(
      file.buffer,
      fileExtension,
    );

    return {
      url: result.secure_url
    }
  }

  /**
   * 
   * @param files 
   * @returns FileUploadResponseDto[]
   */
  @Post('upload/multiple')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload multiple document/image' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]): Promise<FileUploadResponseDto[]> {

    const uploadPromises = files.map(async (file) => {
      const fileExtension = file.originalname.split('.').pop();
      const result = await this.cloudinaryService.uploadFile(
        file.buffer,
        fileExtension,
      );

      return result.secure_url;
    });

    const secureUrls = await Promise.all(uploadPromises);

    return secureUrls.map(ur => {
      return { url: ur }
    });
  }
}

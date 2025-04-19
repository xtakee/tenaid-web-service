import { BadRequestException, Controller, Get, NotFoundException, Param, Post, Res, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { FileUploadResponseDto } from 'src/feature/file/dto/response/file.response.dto'
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service'
import { BasicAuth } from '../auth/guards/auth.decorator'
import { SingleFileUpload } from 'src/core/decorators/single.file.upload'
import { createReadStream, existsSync } from 'fs'
import { Response } from 'express'
import { join } from 'path'

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
  @ApiOperation({ summary: 'Upload a single document/image' })
  @SingleFileUpload()
  @BasicAuth()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<FileUploadResponseDto> {

    if (!file) throw new BadRequestException()

    const fileExtension = file.originalname.split('.').pop() // Get the file extension

    const result = await this.cloudinaryService.uploadFile(
      file.buffer,
      fileExtension,
    )

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
  @ApiOperation({ summary: 'Upload multiple document/image' })
  @BasicAuth()
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]): Promise<FileUploadResponseDto[]> {

    const uploadPromises = files.map(async (file) => {
      const fileExtension = file.originalname.split('.').pop()
      const result = await this.cloudinaryService.uploadFile(
        file.buffer,
        fileExtension,
      )

      return result.secure_url
    })

    const secureUrls = await Promise.all(uploadPromises)

    return secureUrls.map(ur => {
      return { url: ur }
    })
  }

  /**
   * 
   * @param filename 
   * @param res 
   */
  @Get('/:filename')
  @ApiOperation({ summary: 'Download a single document/image' })
  @BasicAuth()
  downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'public', filename)
    const fileStream = createReadStream(filePath)

    if (!existsSync(filePath)) throw new NotFoundException()

    res.set('Content-Type', 'application/octet-stream')
    res.set('Content-Disposition', `attachment filename="${filename}"`)

    fileStream.pipe(res)
  }
}

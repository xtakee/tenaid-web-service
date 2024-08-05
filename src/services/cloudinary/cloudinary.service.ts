import { BadRequestException, Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiOptions, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {

  async uploadFile(
    fileBuffer: Buffer,
    fileExtension: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } = process.env;

    return new Promise((resolve, reject) => {
      v2.config({
        cloud_name: CLOUD_NAME,
        api_key: CLOUD_API_KEY,
        api_secret: CLOUD_API_SECRET,
      });

      if (!fileBuffer || !fileBuffer.length || !fileExtension) {
        throw new BadRequestException('Invalid file buffer or file extension is missing.');
      }

      // Determine the resource type based on the file extension
      const resourceType = this.getResourceType(fileExtension);

      const uploadOptions: UploadApiOptions = {
        folder: fileExtension,
        resource_type: resourceType as any, // Type assertion to any
      };

      const upload = v2.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });

      toStream(fileBuffer).pipe(upload);
    });
  }

  // Helper function to determine resource type based on file extension
  private getResourceType(fileExtension: string): string {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'wmv'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

    if (imageExtensions.includes(fileExtension.toLowerCase())) {
      return 'image';
    } else if (videoExtensions.includes(fileExtension.toLowerCase())) {
      return 'video';
    } else if (documentExtensions.includes(fileExtension.toLowerCase())) {
      return 'raw';
    } else {
      return 'auto'; // Default to 'auto' for other types
    }
  }
}

import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiConsumes, ApiBody } from "@nestjs/swagger";

export function SingleFileUpload() {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })
  )
}
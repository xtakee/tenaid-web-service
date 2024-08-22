import { ApiResponse } from "@nestjs/swagger"
import { Size } from "../request/basic.property.info.dto"

export class BasicPropertyInfoResponseDto {
  id: string
  name: string
  description: string
  bathrooms: number
  bedrooms: number
  type: string
  status: string
  size: Size
}

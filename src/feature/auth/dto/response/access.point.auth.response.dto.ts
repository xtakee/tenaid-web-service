import { ApiProperty } from "@nestjs/swagger"
import { CommunityDto } from "src/feature/community/dto/community.dto"

export class AccessPointAuthResponseDto {
  account: {
    id: string
    name: string
    description: string
    community: CommunityDto
  }
  @ApiProperty()
  authorization: string
}
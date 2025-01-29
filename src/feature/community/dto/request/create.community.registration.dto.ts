import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUrl } from "class-validator";

export class CreateCommunityRegistrationDto {
  @ApiProperty()
  @IsNotEmpty()
  registrationNumber: string

  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  registrationDocument: string
}

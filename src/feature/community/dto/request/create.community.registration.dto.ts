import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUrl } from "class-validator";

export class CreateCommunityRegistrationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  registrationNumber: string

  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  registrationDocument: string
}

import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { DEVICE_TYPE } from "src/feature/auth/auth.constants";

export class DeviceTokenRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  token: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(DEVICE_TYPE)
  device: string
}
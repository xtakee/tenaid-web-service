import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsNotEmpty } from "class-validator"
import { Platform } from "src/core/util/platform"
import { IsPrimeBase64 } from "src/core/validators/is.prime.base64"
import { DEVICE_TYPE } from "src/feature/auth/auth.constants"

export class CreateE2eeKeyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsPrimeBase64()
  publicKey: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(Platform)
  platform: string
}
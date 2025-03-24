import { IsNotEmpty } from "class-validator"

export class EncryptionData {
  @IsNotEmpty()
  iv: string

  @IsNotEmpty()
  tag: string
}
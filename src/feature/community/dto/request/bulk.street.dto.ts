import { IsNotEmpty, IsString } from "class-validator";

export class BulkStreetDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  description: string
}
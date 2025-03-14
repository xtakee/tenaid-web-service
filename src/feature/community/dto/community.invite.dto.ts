import { ApiProperty } from "@nestjs/swagger"   
import { IsBoolean, IsDateString, IsEnum, IsMongoId, IsNotEmpty } from "class-validator"   

enum InviteType {
  SINGLE = 'single',
  EXTENDED = 'extended',
  SELF = 'self'
}

export class CommunityInviteDto {
  alt?: string
  status?: string
  id?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  start: string

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  end: string

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  date: string

  @ApiProperty()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(InviteType)
  type: string

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  exitOnly: Boolean

  @ApiProperty()
  @IsNotEmpty()
  code: string

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  community: string

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  member: string

  @ApiProperty()
  photo?: string

  @ApiProperty()
  reason?: string
}
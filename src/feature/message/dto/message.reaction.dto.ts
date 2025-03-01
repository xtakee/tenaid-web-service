import { IsNotEmpty, IsMongoId, IsArray } from "class-validator"

export class ReactionDto {
  @IsNotEmpty()
  reaction: string

  @IsNotEmpty()
  @IsMongoId()
  user: string
}

export class MessageReactionDto {
  @IsNotEmpty()
  reaction: string

  @IsNotEmpty()
  count: number

  @IsArray()
  @IsMongoId({ each: true })
  users: string[]
}
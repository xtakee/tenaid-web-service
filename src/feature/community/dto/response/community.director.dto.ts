import { Email } from "src/feature/core/model/email"

export class CommunityDirectorDto {

  _id: string

  firstName: string

  lastName: string

  identityType: string

  identity: string

  email: Email

  phone: string

  country: string

  createdAt: string

  updatedAt: string
}
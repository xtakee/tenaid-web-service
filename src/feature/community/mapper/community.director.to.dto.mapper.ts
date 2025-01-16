import { Mapper } from "src/core/util/mapper";
import { CommunityDirector } from "../model/community.director";
import { CommunityDirectorDto } from "../dto/response/community.director.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CommunityDirectorToDtoMapper implements Mapper<CommunityDirector, CommunityDirectorDto> {
  map(from: CommunityDirector): CommunityDirectorDto {
    return {
      _id: (from as any)._id,
      firstName: from.firstName,
      lastName: from.lastName,
      email: {
        value: from.email.value,
        verified: from.email.verified
      },
      country: from.country,
      identity: from.identity,
      identityType: from.identityType,
      phone: from.phone,
      createdAt: (from as any).createdAt,
      updatedAt: (from as any).updatedAt
    }
  }
}
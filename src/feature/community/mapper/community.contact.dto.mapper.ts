import { Mapper } from "src/core/util/mapper";
import { CommunityContact } from "../model/community.contact";
import { CommunityContactResponseDto } from "../dto/response/community.contact.response.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CommunityContactDtoMapper implements Mapper<CommunityContact, CommunityContactResponseDto> {
  map(from: CommunityContact): CommunityContactResponseDto {
    return {
      _id: (from as any)._id.toString(),
      fullName: from.fullName,
      email: from.email,
      phone: from.phone,
      country: from.country,
      createdBy: from.createdBy,
      tag: from.tag,
      isActive: from.isActive
    }
  }
}
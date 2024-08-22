import { Injectable } from "@nestjs/common";
import { Mapper } from "src/core/util/mapper";
import { CommunityVisitorsDto } from "src/domain/community/dto/response/community.visitors.dto";
import { CommunityMemberToDtoMapper } from "./community.member.to.dto.mapper";

@Injectable()
export class CommunityVisitorsToDtoMapper implements Mapper<any, CommunityVisitorsDto> {

  constructor(private readonly memberMapper: CommunityMemberToDtoMapper) { }

  map(from: any): CommunityVisitorsDto {
    return {
      id: from._id,
      photo: from.photo,
      name: from.name,
      access: from.code,
      checkIn: from.checkIn,
      checkOut: from.checkOut,
      expected: from.expected,
      host: this.memberMapper.map(from.member)
    }
  }
}
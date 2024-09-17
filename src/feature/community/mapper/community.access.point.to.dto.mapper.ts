import { Mapper } from "src/core/util/mapper";
import { CommunityAccessPoint } from "../model/community.access.point";
import { CommunityAccessPointResonseDto } from "../dto/response/community.access.point.response.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CommunityAccessPointToDtoMapper implements Mapper<CommunityAccessPoint, CommunityAccessPointResonseDto>{
  map(from: CommunityAccessPoint): CommunityAccessPointResonseDto {
    return {
      id: (from as any)._id,
      name: from.name,
      description: from.description,
      community: from.community.toString()
    }
  }

}
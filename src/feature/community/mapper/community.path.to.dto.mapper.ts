import { Injectable } from "@nestjs/common";
import { Mapper } from "src/core/util/mapper";
import { CommunityStreet } from "../model/community.street";
import { CommunityPathResponseDto } from "../dto/response/community.path.response.dto";

@Injectable()
export class CommunityPathToDtoMapper implements Mapper<any, CommunityPathResponseDto> {

  map(from: CommunityStreet): CommunityPathResponseDto {
    return {
      id: (from as any)._id,
      description: from.description,
      name: from.name
    }
  }

}

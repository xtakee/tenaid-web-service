import { Injectable } from "@nestjs/common";
import { Mapper } from "src/core/util/mapper";
import { CommunityPath } from "../model/community.path";
import { CommunityPathResponseDto } from "../dto/response/community.path.response.dto";

@Injectable()
export class CommunityPathToDtoMapper implements Mapper<CommunityPath, CommunityPathResponseDto> {

  map(from: CommunityPath): CommunityPathResponseDto {
    return {
      id: (from as any)._id,
      description: from.description,
      name: from.name
    }
  }

}

import { Mapper } from "src/core/util/mapper";;
import { Property } from "../model/property.model";
import { BasicPropertyInfoResponseDto } from "src/domain/property/dto/response/basic.property.info.response.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PropertyToBasicDtoMapper implements Mapper<Property, BasicPropertyInfoResponseDto> {
  map(from: Property): BasicPropertyInfoResponseDto {
    return {
      name: from.name,
      description: from.description,
      bathrooms: from.bathrooms,
      bedrooms: from.bedrooms,
      type: from.type,
      size: {
        length: from.size?.length,
        breadth: from.size?.breadth
      },
      status: from.status,
      id: (from as any)._id
    }
  }

}

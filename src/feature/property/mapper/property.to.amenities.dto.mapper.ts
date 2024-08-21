import { PropertyAmenitiesDto } from "src/domain/property/dto/request/property.amenities.dto";
import { Property } from "../model/property.model";
import { Mapper } from "src/core/util/mapper";

export class PropertyToAmenitiesDtoMapper implements Mapper<Property, PropertyAmenitiesDto> {
  map(from: Property): PropertyAmenitiesDto {
    return {
      id: (from as any)._id,
      amenities: from.amenities,
      accessibilities: from.accessibilities,
      utilities: from.utilities,
      condition: from.condition
    }
  }
}

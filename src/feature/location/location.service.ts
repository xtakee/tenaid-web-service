import { BadRequestException, Injectable } from '@nestjs/common';
import { LocationDto } from 'src/feature/core/dto/location.dto';
import { GoogleService } from 'src/services/google/google.service';

@Injectable()
export class LocationService {
  constructor(private readonly googlesService: GoogleService) { }

  async searchAddress(address: string): Promise<LocationDto[]> {
    const response = await this.googlesService.search(address)
    if (!response) throw new BadRequestException()

    return response.map((place) => {
      return {
        name: place.name,
        address: place.formatted_address,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        types: place.types
      }
    })
  }
}

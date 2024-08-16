import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { LocationDto } from 'src/domain/core/dto/location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard/jwt.auth.guard';
import { BasicAuth } from '../auth/guards/auth.decorator';

@Controller({
  version: '1',
  path: "location",
})
@ApiTags('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) { }

  @Get('search')
  @ApiOperation({ summary: 'Search Address' })
  @BasicAuth()
  async searchAddress(@Query('address') address: string): Promise<LocationDto[]> {
    return await this.locationService.searchAddress(address)
  }
}

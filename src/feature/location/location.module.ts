import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { GoogleService } from 'src/services/google/google.service';
import { AuthHelper } from 'src/core/helpers/auth.helper';
import { CacheService } from 'src/services/cache/cache.service';

@Module({
  controllers: [LocationController],
  providers: [LocationService, GoogleService, AuthHelper, CacheService]
})
export class LocationModule {}

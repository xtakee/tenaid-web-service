import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { GoogleService } from 'src/services/google/google.service';
import { AuthHelper } from 'src/core/helpers/auth.helper';

@Module({
  controllers: [LocationController],
  providers: [LocationService, GoogleService, AuthHelper]
})
export class LocationModule {}

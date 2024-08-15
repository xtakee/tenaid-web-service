import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { PropertyComplexToDtoMapper } from './mapper/property.complex.to.dto.mapper';
import { PropertyRepository } from './property.repository';
import { AddressToDtoMapper } from '../core/mapper/address.to.dto.mapper';
import { PropertyComplex, PropertyComplexSchema } from './model/property.complex.model';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { Property, PropertySchema } from './model/property.model';
import { AuthHelper } from 'src/core/helpers/auth.helper';

@Module({
  providers: [PropertyService, PropertyRepository, PropertyComplexToDtoMapper, AddressToDtoMapper, AuthHelper],
  controllers: [PropertyController],
  imports: [
    MongooseModule.forFeature([{ name: PropertyComplex.name, schema: PropertyComplexSchema }]),
    MongooseModule.forFeature([{ name: Property.name, schema: PropertySchema }])
  ]
})
export class PropertyModule { }

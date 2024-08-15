import { BadRequestException, Injectable } from '@nestjs/common';
import { PropertyRepository } from './property.repository';
import { CreatePropertyComplexDto } from 'src/domain/property/dto/request/create.property.complex.dto';
import { PropertyComplexResponeDto } from 'src/domain/property/dto/response/property.complex.response.dto';
import { PropertyComplexToDtoMapper } from './mapper/property.complex.to.dto.mapper';
import { ACCESSIBILITY, AMENITIES, PROPERTY_AVAILABILITY, PROPERTY_CONDITION, PROPERTY_TYPE, UTITLITY } from './property.constants';

@Injectable()
export class PropertyService {
  constructor(private readonly propertyRepository: PropertyRepository, private readonly mapper: PropertyComplexToDtoMapper) { }

  /**
   * 
   * @param user 
   * @param data 
   * @returns 
   */
  async createComplex(user: string, data: CreatePropertyComplexDto): Promise<PropertyComplexResponeDto> {
    const complex = await this.propertyRepository.createComplex(user, data)
    if (complex) return this.mapper.map(complex)

    throw new BadRequestException()
  }

  /**
   * 
   * @param user 
   * @param complex 
   * @param data 
   * @returns 
   */
  async updateComplex(user: string, complex: string, data: CreatePropertyComplexDto): Promise<PropertyComplexResponeDto> {
    const response = await this.propertyRepository.updateComplex(user, complex, data)
    if (complex) return this.mapper.map(response)

    throw new BadRequestException()
  }

  /**
   * 
   * @returns 
   */
  async getProperyConditions(): Promise<string[]> {
    return Object.values(PROPERTY_CONDITION)
  }

  /**
   * 
   * @returns 
   */
  async getProperyTyeps(): Promise<string[]> {
    return Object.values(PROPERTY_TYPE)
  }

  /**
   * 
   * @returns 
   */
  async getPropertyUtilities(): Promise<string[]> {
    return Object.values(UTITLITY)
  }

  /**
   * 
   * @returns 
   */
  async getPropertyAccessibilities(): Promise<string[]> {
    return Object.values(ACCESSIBILITY)
  }

  async getPropertyAmmenities(): Promise<string[]> {
    return Object.values(AMENITIES)
  }


  async getPropertyAvailabilities(): Promise<string[]> {
    return Object.values(PROPERTY_AVAILABILITY)
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { PropertyRepository } from './property.repository';
import { CreatePropertyComplexDto } from 'src/feature/property/dto/request/create.property.complex.dto';
import { PropertyComplexResponeDto } from 'src/feature/property/dto/response/property.complex.response.dto';
import { PropertyComplexToDtoMapper } from './mapper/property.complex.to.dto.mapper';
import { ACCESSIBILITY, AMENITIES, PROPERTY_AVAILABILITY, PROPERTY_CONDITION, PROPERTY_TYPE, UTITLITY } from './property.constants';
import { BasicPropertyInfoDto } from 'src/feature/property/dto/request/basic.property.info.dto';
import { BasicPropertyInfoResponseDto } from 'src/feature/property/dto/response/basic.property.info.response.dto';
import { Property } from './model/property.model';
import { isMongoId } from 'class-validator';
import { PropertyToBasicDtoMapper } from './mapper/property.to.basic.dto.mapper';
import { PropertyFinanceDto } from 'src/feature/property/dto/request/property.finance.dto';
import { PropertyToFinanceDto } from './mapper/property.to.finance.dto';
import { PropertyAmenitiesDto } from 'src/feature/property/dto/request/property.amenities.dto';

@Injectable()
export class PropertyService {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly basicInfoMapper: PropertyToBasicDtoMapper,
    private readonly financeMapper: PropertyToFinanceDto,
    private readonly mapper: PropertyComplexToDtoMapper,
  ) { }

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

  async getPropertyAmenities(): Promise<string[]> {
    return Object.values(AMENITIES)
  }
  /**
   * 
   * @returns 
   */
  async getPropertyAvailabilities(): Promise<string[]> {
    return Object.values(PROPERTY_AVAILABILITY)
  }

  /**
   * 
   * @param data 
   * @param property 
   * @param user 
   * @returns 
   */
  async createPropertyFinanceInfo(data: PropertyFinanceDto, property: string, user: string): Promise<PropertyFinanceDto> {
    const props: Property = await this.propertyRepository.createProperyFinanceInfo(data, property, user)
    if (props) return this.financeMapper.map(props)
    throw new BadRequestException()
  }

  /**
   * 
   * @param data 
   * @param property 
   * @param user 
   * @returns 
   */
  async createPropertyAmenities(data: PropertyAmenitiesDto, property: string, user: string): Promise<PropertyFinanceDto> {
    const props: Property = await this.propertyRepository.createProperyAmenities(data, property, user)
    if (props) return this.financeMapper.map(props)
    throw new BadRequestException()
  }

  /**
   * 
   * @param user 
   * @param data 
   * @returns 
   */
  async createBasicPropertyInfo(user: string, data: BasicPropertyInfoDto): Promise<BasicPropertyInfoResponseDto> {
    const complex = await this.propertyRepository.getUserComplexById(data.complex, user)
    if (complex) {
      // check if draft
      if (data.property) {
        if (!isMongoId(data.property)) throw new BadRequestException()

        const property = await this.propertyRepository.updateBasicPropertyInfo(data)
        if (property) return this.basicInfoMapper.map(property)

      } else {
        const property = await this.propertyRepository.createBasicPropertyInfo(data, user)
        if (property) return this.basicInfoMapper.map(property)
      }

    }

    throw new BadRequestException()
  }
}

import { BadRequestException, Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PropertyComplexResponeDto } from 'src/domain/property/dto/response/property.complex.response.dto';
import { PropertyService } from './property.service';
import { User } from 'src/core/decorators/current.user';
import { CreatePropertyComplexDto } from 'src/domain/property/dto/request/create.property.complex.dto';
import { isMongoId } from 'class-validator';
import { MongoAbility } from '@casl/ability';
import { CLAIM, SYSTEM_FEATURES } from '../auth/auth.constants';
import { Auth } from '../auth/guards/auth.decorator';
import { CheckPolicies } from '../auth/guards/casl/policies.guard';
import { BasicPropertyInfoDto } from 'src/domain/property/dto/request/basic.property.info.dto';
import { PropertyFinanceDto } from 'src/domain/property/dto/request/property.finance.dto';
import { PropertyAmenitiesDto } from 'src/domain/property/dto/request/property.amenities.dto';

@Controller({
  version: '1',
  path: "property",
})
@ApiTags('Property')
export class PropertyController {

  constructor(private readonly propertyService: PropertyService) { }

  /**
   * 
   * @param user 
   * @param data 
   * @returns 
   */
  @Post('complex')
  @ApiOperation({ summary: 'Create a Property Complex' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.PROPERTIES))
  async createPropertyComplex(@User() user: string, @Body() data: CreatePropertyComplexDto): Promise<PropertyComplexResponeDto> {
    return this.propertyService.createComplex(user, data)
  }

  /**
   * 
   * @param user \
   * @param data 
   * @returns 
   */
  @Post('')
  @ApiOperation({ summary: 'Create/Update Basic Property Information' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.PROPERTIES))
  async createPropertyBasicInfo(@User() user: string, @Body() data: BasicPropertyInfoDto): Promise<PropertyComplexResponeDto> {
    return this.propertyService.createBasicPropertyInfo(user, data)
  }

  /**
   * 
   * @param user 
   * @param data 
   * @param property 
   * @returns 
   */
  @Patch('finance/:property')
  @ApiOperation({ summary: 'Add Property Finance/Payment' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.PROPERTIES))
  async addPropertyFinance(@User() user: string, @Body() data: PropertyFinanceDto, @Param('property') property: string): Promise<PropertyFinanceDto> {
    return this.propertyService.createPropertyFinanceInfo(data, property, user)
  }

  /**
   * 
   * @param user 
   * @param data 
   * @param property 
   * @returns PropertyFinanceDto
   */
  @Patch('amenities/:property')
  @ApiOperation({ summary: 'Add Property Amenities' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.PROPERTIES))
  async addPropertyAmenities(@User() user: string, @Body() data: PropertyAmenitiesDto, @Param('property') property: string): Promise<PropertyFinanceDto> {
    return this.propertyService.createPropertyAmenities(data, property, user)
  }

  /**
   * 
   * @param user 
   * @param complex 
   * @param data 
   * @returns PropertyFinanceDto
   */
  @Patch('complex/:complex')
  @ApiOperation({ summary: 'Update a Property Complex' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.PROPERTIES))
  async updatePropertyComplex(@User() user: string, @Param('complex') complex: string, @Body() data: CreatePropertyComplexDto): Promise<PropertyComplexResponeDto> {
    if (!isMongoId(complex)) throw new BadRequestException()

    return await this.propertyService.updateComplex(user, complex, data)
  }

  @Get('conditions')
  @ApiOperation({ summary: 'Get Property Conditions' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.PROPERTIES))
  async getPropertyConditions(): Promise<string[]> {
    return await this.propertyService.getProperyConditions()
  }

  @Get('types')
  @ApiOperation({ summary: 'Get Property Types' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.PROPERTIES))
  async getPropertyTypes(): Promise<string[]> {
    return await this.propertyService.getProperyTyeps()
  }

  @Get('availabilities')
  @ApiOperation({ summary: 'Get Property Availabilities' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.PROPERTIES))
  async getPropertyAvailabilities(): Promise<string[]> {
    return await this.propertyService.getPropertyAvailabilities()
  }

  @Get('amenities')
  @ApiOperation({ summary: 'Get Property Amenities' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.PROPERTIES))
  async getPropertyAmenities(): Promise<string[]> {
    return await this.propertyService.getPropertyAmenities()
  }

  /**
   * 
   * @returns 
   */
  @Get('accessibilities')
  @ApiOperation({ summary: 'Get Property Accessibilities' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.PROPERTIES))
  async getPropertyAccessibilities(): Promise<string[]> {
    return await this.propertyService.getPropertyAccessibilities()
  }

}

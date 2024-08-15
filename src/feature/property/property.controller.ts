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

@Controller({
  version: '1',
  path: "property",
})
@ApiTags('Property')
export class PropertyController {

  constructor(private readonly propertyService: PropertyService) { }

  @Post('complex')
  @ApiOperation({ summary: 'Create a Property Complex' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.PROPERTIES))
  async createPropertyComplex(@User() user: string, @Body() data: CreatePropertyComplexDto): Promise<PropertyComplexResponeDto> {
    return this.propertyService.createComplex(user, data)
  }

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

  @Get('ammenities')
  @ApiOperation({ summary: 'Get Property Ammenities' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.PROPERTIES))
  async getPropertyAmmenities(): Promise<string[]> {
    return await this.propertyService.getPropertyAmmenities()
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

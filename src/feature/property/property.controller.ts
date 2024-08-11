import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller({
  version: '1',
  path: "property",
})
@ApiTags('Property')
export class PropertyController {

  @Post('create')
  @ApiOperation({ summary: 'Apply to property listing' })
  async createProperty(): Promise<void> { }

  @Post('create')
  @ApiOperation({ summary: 'Apply to property listing' })
  async createApartment(): Promise<void> { }

  @Post('apply')
  @ApiOperation({ summary: 'Apply to property listing' })
  async applyToListing(): Promise<void> { }
}

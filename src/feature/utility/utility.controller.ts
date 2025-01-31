import { MongoAbility } from '@casl/ability';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CLAIM, ADMIN_SYSTEM_FEATURES } from '../auth/auth.constants';
import { Auth } from '../auth/guards/auth.decorator';
import { CheckPolicies } from '../auth/guards/casl/policies.guard';
import { CreateUtilityProductDto } from './dto/request/create.utility.product.dto';

@Controller({
  version: '1',
  path: "utility",
})
@ApiTags('Utitilies')
export class UtilityController {

  @Post('product')
  @ApiOperation({ summary: 'Create a utility product' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, ADMIN_SYSTEM_FEATURES.DASHBOARD))
  async createUtilityProduct(@Body() body: CreateUtilityProductDto): Promise<any> { }

}

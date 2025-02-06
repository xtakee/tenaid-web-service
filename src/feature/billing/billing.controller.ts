import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller({
  version: '1',
  path: "billing",
})
@ApiTags('Billing')
export class BillingController {


}

import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller({
  version: '1',
  path: "property",
})
@ApiTags('Property')
export class PropertyController {

}

import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller({
  version: '1',
  path: "admin",
})
@ApiTags('Admin')
export class AdminController {
  
  async create() {
    
  }
}

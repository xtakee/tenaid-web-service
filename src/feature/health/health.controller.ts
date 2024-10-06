import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller({
  version: '1',
  path: "health",
})
@ApiTags('Health')
export class HealthController {

  @Get('status')
  @ApiOperation({ summary: 'Check server health status' })
  async health(): Promise<any> {
    return {
      uptime: process.uptime()
    }
  }
}

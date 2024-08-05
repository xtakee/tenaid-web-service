import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BankResponseDto } from 'src/domain/bank/bank.response.dto';
import { BankService } from './bank.service';
import { JwtAuthGuard } from '../auth/jwt.auth.gaurd';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller({
  version: '1',
  path: "bank",
})
@ApiTags('Bank')
export class BankController {

  constructor(private readonly bankService: BankService) { }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all banks' })
  @UseGuards(JwtAuthGuard)
  async getAllBanks(): Promise<BankResponseDto[]> {
    return await this.bankService.getAllBanks()
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a bank' })
  @UseGuards(JwtAuthGuard)
  async getOne(@Param('id') id: string): Promise<BankResponseDto> {
    return await this.bankService.getOne(id)
  }
}

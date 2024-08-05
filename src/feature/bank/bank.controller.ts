import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BankResponseDto } from 'src/domain/bank/bank.response.dto';
import { BankService } from './bank.service';
import { JwtAuthGuard } from '../auth/jwt.auth.gaurd';

@Controller({
  version: '1',
  path: "bank",
})
export class BankController {

  constructor(private readonly bankService: BankService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllBanks(): Promise<BankResponseDto[]> {
    return await this.bankService.getAllBanks()
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOne(@Param('id') id: string): Promise<BankResponseDto> {
    return await this.bankService.getOne(id)
  }
}

import { BadRequestException, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BankResponseDto } from 'src/feature/bank/dto/bank.response.dto';
import { BankService } from './bank.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard/jwt.auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { isMongoId } from 'class-validator';

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
    if (!isMongoId(id)) throw new BadRequestException()
    return await this.bankService.getOne(id)
  }
}

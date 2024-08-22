import { Injectable, NotFoundException } from '@nestjs/common';
import { BankResponseDto } from 'src/feature/bank/dto/bank.response.dto';
import { BankRepository } from './bank.repository';
import { BankModelToDtoMapper } from './mapper/bank.mode.to.dto.mapper';

@Injectable()
export class BankService {

  constructor(private readonly bankRepository: BankRepository, private readonly mapper: BankModelToDtoMapper) { }

  async getAllBanks(): Promise<BankResponseDto[]> {
    return (await this.bankRepository.findAll()).map(b => this.mapper.map(b))
  }

  async getOne(id: string): Promise<BankResponseDto> {
    const bank = await this.bankRepository.findOneById(id)
    if (bank) return this.mapper.map(bank)
    throw new NotFoundException()
  }
}

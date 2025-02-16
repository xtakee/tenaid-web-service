import { Injectable } from '@nestjs/common';
import { AuthHelper } from 'src/core/helpers/auth.helper';
import { E2eeRepository } from './e2ee.repository';
import { CreateE2eeKeyDto } from './dto/create.e2ee.key.dto';

@Injectable()
export class E2eeService {
  constructor(
    private readonly authHelper: AuthHelper,
    private readonly e2eeRepository: E2eeRepository
  ) { }

  /**
   * 
   * @param user 
   * @param data 
   * @returns 
   */
  async generateKeys(user: string, data: CreateE2eeKeyDto): Promise<string> {
    const e2eeKeys = this.authHelper.generateKeyPair(data.publicKey)

    await this.e2eeRepository.saveAccountKeys(
      user,
      e2eeKeys.publicKey,
      e2eeKeys.privateKey,
      data.publicKey,
      e2eeKeys.sharedKey,
      data.platform)

    return e2eeKeys.publicKey
  }


}

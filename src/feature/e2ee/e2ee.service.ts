import { Injectable } from '@nestjs/common';
import { AuthHelper, EasGcmData } from 'src/core/helpers/auth.helper';
import { E2eeRepository } from './e2ee.repository';
import { CreateE2eeKeyDto } from './dto/create.e2ee.key.dto';
import { E2eeData } from './model/e2ee.data';

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

  /**
   * 
   * @param user 
   * @param platform 
   * @param encryption 
   * @returns 
   */
  async encrypt(user: string, platform: string, encryption: E2eeData): Promise<E2eeData> {
    const encKeys = await this.e2eeRepository.getAccountKeys(user, platform)

    if (!encKeys || !encKeys.sharedKey || !encryption) return null

    const keys: EasGcmData = this.authHelper.advanceEncrypt(encryption.enc, encKeys.sharedKey)

    return {
      enc: keys.enc,
      iv: keys.iv,
      tag: keys.tag
    }
  }

}

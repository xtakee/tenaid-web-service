import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const ENC_SALT = 10

@Injectable()
export class AuthHelper {

  async hash(data: string): Promise<string> {
    return await bcrypt.hash(data, ENC_SALT)
  }

  async isMatch(data: string, hash: string): Promise<Boolean> {
    return await bcrypt.compare(data, hash)
  }
}
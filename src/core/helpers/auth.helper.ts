import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const ENC_SALT = 10

const algorithm = 'aes-256-cbc';
const SECRET_KEY = process.env.HASH_SECRET_KEY

const key = crypto
  .createHash('sha512')
  .update(SECRET_KEY)
  .digest('hex')
  .substring(0, 32)

const iv = crypto
  .createHash('sha512')
  .update(SECRET_KEY)
  .digest('hex')
  .substring(0, 16)

@Injectable()
export class AuthHelper {

  async hash(data: string): Promise<string> {
    return await bcrypt.hash(data, ENC_SALT)
  }

  encrypt(data: any): string {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data.toString(), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decrypt(encryptedText: string): string {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async isMatch(data: string, hash: string): Promise<Boolean> {
    return await bcrypt.compare(data, hash)
  }
}
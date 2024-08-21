import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { totp } from 'otplib';

const ENC_SALT = 10
export const SEPERATOR = '?'

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

  /**
   * 
   * @param data 
   * @returns 
   */
  async hash(data: string): Promise<string> {
    return await bcrypt.hash(data, ENC_SALT)
  }

  /**
   * 
   * @param secret 
   * @param code 
   * @returns 
   */
  isValidateAccessToken(secret: string, code: string): boolean {
    return totp.check(code, secret)
  }

  /**
   * 
   * @returns 
   */
  random(length: number = 16): string {
    return crypto.randomBytes(length).toString('hex')
  }

  /**
   * 
   * @param length 
   * @returns 
   */
  randomDigits(length: number) {
    return Array.from({ length: length }, () => Math.floor(Math.random() * 10).toString()).join('')
  }

  /**
   * 
   * @param data 
   * @returns 
   */
  encrypt(data: any): string {
    const randomText = this.random()
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(`${data}${SEPERATOR}${randomText}`, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * 
   * @param encryptedText 
   * @returns 
   */
  decrypt(encryptedText: string): string {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted.split(SEPERATOR)[0];
  }

  /**
   * 
   * @param data 
   * @param hash 
   * @returns 
   */
  async isMatch(data: string, hash: string): Promise<Boolean> {
    return await bcrypt.compare(data, hash)
  }
}

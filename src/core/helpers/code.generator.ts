import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { totp } from 'otplib';
import { CacheService } from 'src/services/cache/cache.service';

export const CODE_LEN_5 = 5
export const CODE_LEN_8 = 8
export const CODE_LEN_6 = 6

const DEFAULT_CODE_LENGTH = CODE_LEN_8

export enum TOTP_VALIDITY {
  _24HRS = 86400,
  _12HRS = 43200,
  _DEFAULT = 30,
}

const ALPHA_NUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const NUMERIC = '1234567890'

const SUFFIX_STORE = ALPHA_NUMERIC.split('')

@Injectable()
export class CodeGenerator {

  constructor(private readonly cache: CacheService) {
    totp.options = {
      digits: CODE_LEN_6,            // 6-digit code
      step: TOTP_VALIDITY._12HRS,             // 30-second time step, 43200 - 12hr, 86400 - 24hr
      window: 1             // Accepts OTPs from current, previous, and next time step
    }
  }

  private unique(counter: number, length: number, store: string): string {
    const hrTime = process.hrtime();// Convert to microseconds
    const microseconds = hrTime[0] * 1e6 + hrTime[1] / 1e3;
    const input = counter.toString() + microseconds

    // Hash the combined string
    const hash = crypto.createHash('sha256').update(input).digest('hex');

    return Array.from({ length }, (_, i) => {
      const randomIndex = parseInt(hash.substring(i * 2, (i * 2) + 2), 16) % store.length;
      return store[randomIndex];
    }).join('').trim()

    // return crypto.createHash('sha256')
    //   .update(counter.toString() + microseconds)
    //   .digest('hex')
    //   .substring(0, length); // Shorten to desired length
  }

  /**
   * 
   * @param counter 
   * @param length 
   * @returns 
   */
  uniqueAlphaNumeric(counter: number, length: number = DEFAULT_CODE_LENGTH): string {
    return this.unique(counter, length, ALPHA_NUMERIC)
  }

  /**
   * 
   * @param counter 
   * @param length 
   * @returns 
   */
  uniqueAlpha(counter: number, length: number = DEFAULT_CODE_LENGTH): string {
    return this.unique(counter, length, ALPHA)
  }

  /**
   * 
   * @param counter 
   * @param length 
   * @returns 
   */
  uniqueNumeric(counter: number, length: number = DEFAULT_CODE_LENGTH): number {
    const code = Number.parseInt(this.unique(counter, length, NUMERIC))
    return Number.parseInt(code.toString().padEnd(length, '0'))
  }

  /**
   * 
   * @param code 
   * @returns 
   */
  toBase32(code: number, format: boolean = false): string {
    const result = code.toString(36).toUpperCase()
    return format ? this.format(result) : result
  }

  /**
   * 
   * @param code 
   * @returns 
   */
  fromBase32(code: string): number {
    return Number.parseInt(code.replace('-', ''), 36)
  }

  /**
   * 
   * @param code \
   * @returns 
   */
  format(code: string): string {
    return code.slice(0, 3) + '-' + code.slice(3)
  }

  async totp(secret: string, prefix: string = ''): Promise<string> {

    let suffixIndex = await this.cache.get(secret)
    if (!suffixIndex) {
      suffixIndex = 0
    } else {
      suffixIndex = parseInt(suffixIndex)
      if (suffixIndex > SUFFIX_STORE.length) suffixIndex = 0
      else suffixIndex += 1
    }

    await this.cache.set(secret, suffixIndex)

    const code = prefix + totp.generate(SUFFIX_STORE[suffixIndex] + secret)
    return SUFFIX_STORE[suffixIndex] + this.toBase32(parseInt(code), true)
  }

  /**
 * 
 * @param secret 
 * @param code 
 * @returns 
 */
  isValidTotp(secret: string, code: string): boolean {
    const token = this.fromBase32(code.substring(1, code.length)).toString()
    const suffix = code.substring(0, 1)
    const tToken = token.substring(5, token.length)

    return totp.check(tToken, suffix + secret)
  }

}

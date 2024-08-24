import { BadRequestException, Injectable } from '@nestjs/common'
import * as crypto from 'crypto'
import { totp } from 'otplib'
import * as dayjs from 'dayjs'
import dayjsPluginUTC from 'dayjs-plugin-utc'
import { CacheService } from 'src/services/cache/cache.service'
import { INVALID_INVITE_VALIDITY } from '../strings'

export const CODE_LEN_3 = 3
export const CODE_LEN_4 = 4
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

// minutes mapping for 10, 20, 30, 40, 50 minutes inclusive
const MINUTES_DUMP = '123456'.split('')
// hours mapping for 1 - 24 hours inclusive
const HOURS_DUMP = 'ABCDEFGHIJKLMNOPQRSTUVWX'.split('')

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const NUMERIC = '1234567890'

const SUFFIX_STORE = ALPHA_NUMERIC.split('')

interface Validity {
  code: string
  period: number
}

/**
 * 
 * @param str 
 * @returns 
 */
export function isDigit(str: string): boolean {
  return /^\d+$/.test(str);
}

@Injectable()
export class CodeGenerator {

  constructor(private readonly cache: CacheService) {
    dayjs.extend(dayjsPluginUTC)
  }

  /**
   * 
   * @param counter 
   * @param length 
   * @param store 
   * @returns 
   */
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
   * @param minutes 
   * @returns 
   */
  private validityCode(minutes: number): string {
    if ((minutes / 60) < 1)
      return MINUTES_DUMP[Math.floor(minutes / 10)]

    return HOURS_DUMP[Math.floor(minutes / 60)]
  }

  /**
   * 
   * @param code 
   * @returns 
   */
  private getValidityPeriod(code: string): number {
    if (isDigit(code)) return parseInt(code) * 10 * 60
    return (HOURS_DUMP.indexOf(code) + 1) * 60 * 60
  }

  /**
   * 
   * @param time 
   * @returns 
   */
  private getValidity(time: string): Validity {

    // get datetime in utc
    const date = (dayjs(time) as any).utc()
    if (!date.isValid()) throw new BadRequestException(INVALID_INVITE_VALIDITY)

    // get datetime in utc
    const now = (dayjs() as any).utc()
    const minutes = date.diff(now, 'minute')

    if (minutes < 0) throw new BadRequestException(INVALID_INVITE_VALIDITY)

    const code = this.validityCode(minutes)
    return {
      code: code,
      period: this.getValidityPeriod(code)
    }
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
    return Number.parseInt(code.replaceAll('-', ''), 36)
  }

  /**
   * 
   * @param code \
   * @returns 
   */
  format(code: string): string {
    return `${code.slice(0, 3)}-${code.slice(3, 5)}-${code.slice(5)}`
  }

  /**
   * 
   * @param secret 
   * @param prefix 
   * @returns 
   */
  async totp(secret: string, time: string, prefix: string = ''): Promise<string> {

    let suffixIndex = await this.cache.get(secret)
    if (!suffixIndex) suffixIndex = 0
    else {
      suffixIndex = parseInt(suffixIndex)
      if (suffixIndex > SUFFIX_STORE.length) suffixIndex = 0
      else suffixIndex += 1
    }

    await this.cache.set(secret, suffixIndex)
    const validity = this.getValidity(time)

    totp.options = {
      digits: CODE_LEN_3,            // 6-digit code
      step: validity.period,             // 30-second time step, 43200 - 12hr, 86400 - 24hr
      window: 0             // Accepts OTPs from current, previous, and next time step
    }

    const otp = prefix + totp.generate(SUFFIX_STORE[suffixIndex] + secret)
    const code = validity.code + SUFFIX_STORE[suffixIndex] + this.toBase32(parseInt(otp))
    return this.format(code)
  }

  /**
 * 
 * @param secret 
 * @param code 
 * @returns 
 */
  isValidTotp(secret: string, code: string): boolean {
    const token = this.fromBase32(code.substring(2, code.length)).toString()
    const validity = code.substring(0, 1)
    const suffix = code.substring(1, 2)
    const tToken = token.substring(5, token.length)

    totp.options = {
      digits: CODE_LEN_3,            // 6-digit code
      step: this.getValidityPeriod(validity),
      window: 0             // Accepts OTPs from current, previous, and next time step
    }

    return totp.check(tToken, suffix + secret)
  }

}

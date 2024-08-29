import { BadRequestException, Injectable } from '@nestjs/common'
import * as crypto from 'crypto'
import { totp } from 'otplib'
import * as dayjs from 'dayjs'
import dayjsPluginUTC from 'dayjs-plugin-utc'
import { CacheService } from 'src/services/cache/cache.service'
import { INVALID_DATE_FORMAT, INVALID_INVITE_VALIDITY, INVALID_INVITE_VALIDITY_PERIOD_DAY, INVALID_INVITE_VALIDITY_PERIOD_HOUR } from '../strings'

export const CODE_LEN_3 = 3
export const CODE_LEN_4 = 4
export const CODE_LEN_5 = 5
export const CODE_LEN_8 = 8
export const CODE_LEN_6 = 6

const MAX_CODE_VARIATION = 9
const MAX_VALIDITY_HOURS = 9
const MAX_VALIDITY_DAYS = 7

const SHUFFLE_SEED = process.env.SHUFFLE_SEED

const DEFAULT_CODE_LENGTH = CODE_LEN_8

// This is to get only hours and reduce len to 6 digits for next 100 years
// const TIMESTAMP_REFERENCE = dayjs('2024-08-25T00:00:00.000Z') // 25th August, 2024 utc

export enum TOTP_VALIDITY {
  _24HRS = 86400,
  _12HRS = 43200,
  _DEFAULT = 30,
}

export interface Code {
  validity: number,
  user: string,
  totp: string,
  variable: string
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
   * @param date 
   * @returns 
   */
  private toUtc(date: string): dayjs.Dayjs {
    const dt = dayjs(date)
    if (!dt.isValid()) throw new BadRequestException(INVALID_DATE_FORMAT)
    return (dt as any).utc()
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
  toBase32(code: bigint, format: boolean = false): string {
    const result = code.toString(36).toLowerCase()
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
   * @param code 
   * @returns 
   */
  format(code: string): string {
    return `${code.slice(0, 3)}-${code.slice(3, 6)}`
  }

  /**
   * 
   * @param secret 
   * @returns 
   */
  private async getCodeVariator(secret: string): Promise<string> {
    let suffixIndex = await this.cache.get(secret)
    if (!suffixIndex) suffixIndex = 0
    else {
      suffixIndex = parseInt(suffixIndex)
      suffixIndex += 1
    }

    if (suffixIndex > MAX_CODE_VARIATION) suffixIndex = 0
    await this.cache.set(secret, suffixIndex)

    return suffixIndex.toString()
  }

  /**
   * 
   * @param seed 
   * @returns 
   */
  private rng(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }

  /**
   * 
   * @param secret 
   * @param steps 
   * @param epoch 
   * @returns 
   */
  private generateTotp(secret: string, steps: number, epoch: number): string {
    totp.options = {
      epoch: epoch,
      digits: CODE_LEN_4,            // 6-digit code
      step: steps,             // 30-second time step, 43200 - 12hr, 86400 - 24hr
      window: 0             // Accepts OTPs from current, previous, and next time step
    }

    return totp.generate(secret)
  }

  /**
   * Uses 10 digits - comprising of (4) TOTP, (4) user code, (1) Validity, (1) Variable
   * @param secret 
   * @param user 
   * @param start 
   * @param end 
   * @returns 
   */
  async totp(secret: string, user: string, start: string, end: string): Promise<string> {
    // convert start time to utc
    const utcStart: dayjs.Dayjs = this.toUtc(start)

    // convert end time to utc
    const utcEnd: dayjs.Dayjs = this.toUtc(end)

    // check if end time is in the future
    if (!utcEnd.isAfter(utcStart)) throw new BadRequestException(INVALID_INVITE_VALIDITY)
    const variator = await this.getCodeVariator(secret)

    if (utcStart.isSame(utcEnd, 'day')) {
      // reset start time to the nearest hour
      const hours = utcEnd.diff(utcStart, 'hour')
      // check if hours is within range
      if (hours > MAX_VALIDITY_HOURS || hours < 1) throw new BadRequestException(INVALID_INVITE_VALIDITY_PERIOD_HOUR)

      const steps = hours * 60 * 60 // convert to seconds
      const otp = this.generateTotp(variator + secret, steps, utcStart.valueOf())
      return otp + hours.toString() + user + variator
    }

    // reset to end of day
    const endDate = utcEnd.hour(23).minute(0).second(0).millisecond(0)
    // get number of days valid
    const days = endDate.diff(utcStart, 'day')

    // check if hours is within range
    if (days > MAX_VALIDITY_DAYS) throw new BadRequestException(INVALID_INVITE_VALIDITY_PERIOD_DAY)
    // convert to seconds
    const steps = days * 24 * 60 * 60

    const otp = this.generateTotp(variator + secret, steps, utcStart.valueOf())
    return otp + days.toString() + user + variator
  }

  /**
   * 
   * @param code 
   * @param validity 
   * @param secret 
   * @returns 
   */
  validateHours(code: string, validity: number, secret: string): boolean {
    const steps = validity * 60 * 60
    const now = (dayjs() as any).utc()
    totp.options = {
      epoch: now.valueOf(),
      digits: CODE_LEN_4,            // 6-digit code
      step: steps,
      window: 0             // Accepts OTPs from current, previous, and next time step
    }

    return totp.check(code, secret)
  }

  /**
   * 
   * @param code 
   * @param validity 
   * @param secret 
   * @returns 
   */
  validateDays(code: string, validity: number, secret: string): boolean {
    const steps = validity * 60 * 60 * 24
    const now = (dayjs() as any).utc()
    totp.options = {
      epoch: now.valueOf(),
      digits: CODE_LEN_4,            // 6-digit code
      step: steps,
      window: 0             // Accepts OTPs from current, previous, and next time step
    }

    return totp.check(code, secret)
  }

  /**
   * 
   * @param code 
   * @returns 
   */
  decriptCode(code: string): Code {
    let decoded = ''
    if (isDigit(code)) decoded = code
    else decoded = this.fromBase32(code).toString()

    return {
      validity: parseInt(decoded.substring(4, 5)),
      user: decoded.substring(5, 9),
      totp: decoded.substring(0, 4),
      variable: decoded.substring(decoded.length - 1, decoded.length)
    }
  }

  /**
 * 
 * @param secret 
 * @param code 
 * @returns 
 */
  isValidTotp(secret: string, code: Code): boolean {
    return this.validateHours(code.totp, code.validity, code.variable + secret)
      || this.validateDays(code.totp, code.validity, code.variable + secret)
  }
}
// 3906100014 == 4 - 5am
// 6681300016 - 8 - 11
// 5125100017 30 --- 31st
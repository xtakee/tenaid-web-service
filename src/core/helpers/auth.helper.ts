import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import { totp } from 'otplib'

const EC = require('elliptic').ec
const ec = new EC('p256')

const ENC_SALT = 10
export const SEPERATOR = '?'

const algorithm = 'aes-256-cbc';
const SECRET_KEY = process.env.HASH_SECRET_KEY

export class EasGcmData {
  iv: string
  tag: string
  enc: string
}

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

export interface EcdhKey {
  privateKey: string
  sharedKey: string,
  publicKey: string
}

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
   * @returns 
   */
  randomKey(): string {
    return crypto.randomBytes(32).toString('base64')
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
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(`${data}${SEPERATOR}${randomText}`, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return encrypted
  }

  /**
   * 
   * @param data 
   * @returns 
   */
  advanceEncrypt(data: any, secretKey: string): EasGcmData {
    const _iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(secretKey, 'base64'), _iv)
    let encrypted = cipher.update(data, 'utf8', 'base64')
    encrypted += cipher.final('base64')
    const authTag = cipher.getAuthTag();
    // 16-byte auth tag
    return {
      iv: _iv.toString('base64'),
      tag: authTag.toString("base64"),
      enc: encrypted
    }
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

  /**
   * 
   * @param publicKey 
   * @returns 
   */
  generateKeyPair(publicKey: string): EcdhKey {
    const serverDFH: crypto.ECDH = crypto.createECDH('prime256v1')
    serverDFH.generateKeys()

    const serverPublicKey = serverDFH.getPublicKey('base64')
    const serverPrivateKey = serverDFH.getPrivateKey('base64')
    const clientBuffer = Buffer.from(publicKey, 'base64')

    const shareSecret = serverDFH.computeSecret(clientBuffer)

    return {
      sharedKey: shareSecret.toString('base64'),
      publicKey: serverPublicKey,
      privateKey: serverPrivateKey
    }
  }
}

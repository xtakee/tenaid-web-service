import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'

const EC = require('elliptic').ec
const ec = new EC('p256')

// Custom validator to check if age is within a specific range
export function IsPrimeBase64(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsPrimeBase64',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any, args: ValidationArguments) {
          return Promise.call(isPrimeBase64(value))
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid base 64 elliptic key`
        },
      },
    });
  };
}

export function isPrimeBase64(key: any): Boolean {
  try {
    const keyBuffer = Buffer.from(key, 'base64')

    if (keyBuffer.length === 65 && keyBuffer[0] === 0x04) {
      ec.keyFromPublic(keyBuffer)
      return true
    } else return false
  } catch (err) {
    return false
  }

}
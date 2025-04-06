import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator'

export function IsUniqueArray(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isUniqueArray',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any[], _args: ValidationArguments) {
          if (!Array.isArray(value)) return false
          const lowerCaseValues = value.map(val => val.toLowerCase())
          const unique = new Set(lowerCaseValues)
          return lowerCaseValues.length === unique.size
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must contain only unique values`
        },
      },
    })
  }
}
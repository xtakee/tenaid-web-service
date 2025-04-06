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
          const unique = new Set(value)
          return unique.size === value.length
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must contain only unique values`
        },
      },
    })
  }
}
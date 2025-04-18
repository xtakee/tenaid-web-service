import { ValidationOptions, registerDecorator, ValidationArguments } from "class-validator"

export function IsCommaSeparatedUnique(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCommaSeparatedUnique',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string' || value.trim() === '') return false

          const ids = value
            .split(',')
            .map(v => v.trim())
            .filter(v => v !== '')

          const uniqueIds = new Set(ids)

          return ids.length > 0 && uniqueIds.size === ids.length
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a comma-separated list of unique, non-empty values.`
        },
      },
    })
  }
}
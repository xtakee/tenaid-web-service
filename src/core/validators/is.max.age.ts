import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import * as dayjs from 'dayjs';

// Custom validator to check if age is within a specific range
export function IsMaxAge(maxAge: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isMaxAge',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [maxAge],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [maxAge] = args.constraints;
          const age = dayjs().diff(value, 'years');
          return typeof value === 'string' && age <= maxAge
        },
        defaultMessage(args: ValidationArguments) {
          const [minAge] = args.constraints;
          return `${args.property} must not be greater than ${maxAge} years`;
        },
      },
    });
  };
}
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import * as dayjs from 'dayjs';

// Custom validator to check if age is within a specific range
export function IsAgeInRange(minAge: number, maxAge: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAgeInRange',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [minAge, maxAge],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [minAge, maxAge] = args.constraints;
          const age = dayjs().diff(value, 'years');
          return typeof value === 'string' && age >= minAge && age <= maxAge
        },
        defaultMessage(args: ValidationArguments) {
          const [minAge] = args.constraints;
          return `${args.property} must be between ${minAge} and ${maxAge} years`;
        },
      },
    });
  };
}
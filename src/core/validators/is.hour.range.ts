import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import * as dayjs from 'dayjs';

// Custom validator to check if age is within a specific range
export function IsHourInRange(minHour: number, maxHour: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isHourInRange',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [minHour, maxHour],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [minHour, maxHour] = args.constraints

          // Check if value is a valid date string
          const date = dayjs(value);
          if (!date.isValid()) {
            return false;
          }

          const now = dayjs();
          const hoursDifference = date.diff(now, 'hour');

          return hoursDifference >= minHour && hoursDifference <= maxHour
        },
        defaultMessage(args: ValidationArguments) {
          const [_, maxHour] = args.constraints
          return `${args.property} must be within ${maxHour}:00 hours in the future.`;
        },
      },
    });
  };
}

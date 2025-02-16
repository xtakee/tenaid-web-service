import { BadRequestException, createParamDecorator, ExecutionContext } from "@nestjs/common";
import { isPrimeBase64 } from "../validators/is.prime.base64"

export const PublicKey = createParamDecorator(
  (param: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()

    const key = request.headers['enc-public-key']
    if (isPrimeBase64(key)) return key

    throw new BadRequestException('enc-public-key must be a valid prime256v1 base64 string')
  },
)
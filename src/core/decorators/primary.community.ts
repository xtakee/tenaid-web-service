import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const PrimaryCommunity = createParamDecorator(
  (param: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user['primaryCommunity']
  },
)

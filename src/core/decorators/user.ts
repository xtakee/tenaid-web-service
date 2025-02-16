import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const User = createParamDecorator(
  (param: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user['sub']
  },
)

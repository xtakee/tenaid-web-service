import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const PrimaryMember = createParamDecorator(
  (param: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user['primaryMember']
  },
)

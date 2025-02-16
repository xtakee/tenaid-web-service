import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const RootUser = createParamDecorator(
  (param: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user['sub_0']
  },
)

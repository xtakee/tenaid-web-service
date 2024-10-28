import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const User = createParamDecorator(
  (param: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user['sub'];
  },
);

export const RootUser = createParamDecorator(
  (param: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user['sub_0'];
  },
);

export const Email = createParamDecorator(
  (param: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user['email'];
  },
);

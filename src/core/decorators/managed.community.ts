import { createParamDecorator, ExecutionContext } from "@nestjs/common"

export const ManagedCommunity = createParamDecorator(
  (param: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()
    if (!request.user) return null
    return request.user['primaryManagedCommunity']
  },
)

import { Catch, ArgumentsHost, BadRequestException, WsExceptionFilter } from '@nestjs/common'
import { WsException } from '@nestjs/websockets'
import { Socket } from 'socket.io'

export const WS_MESSAGE_ERROR = 'message-validation-error'

@Catch(BadRequestException, WsException)
export class WsExceptionHandler implements WsExceptionFilter {

  catch(exception: BadRequestException | WsException, host: ArgumentsHost) {
    const ctx = host.switchToWs()
    const client: Socket = ctx.getClient()
    const data = ctx.getData()
    const event = ctx.getPattern()

    if (!client) return

    let message = 'An unknown error occurred'

    if (exception instanceof BadRequestException) {
      message = (typeof (exception.getResponse() as any).message) === 'string'
        ? (exception.getResponse() as any).message
        : Object.values((exception.getResponse() as any).message[0].constraints)[0]
    } else if (exception instanceof WsException) {
      message = exception.getError() as string
    }

    client.emit(WS_MESSAGE_ERROR, { message, event, data })
    return
  }
}

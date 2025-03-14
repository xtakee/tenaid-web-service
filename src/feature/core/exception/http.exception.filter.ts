import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response } from 'express'
import * as Sentry from '@sentry/node';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR

    const message = exception instanceof HttpException ? (
      (typeof (exception.getResponse() as any).message) === 'string'
        ? (exception.getResponse() as any).message
        : (exception.getResponse() as any).message[0]
    ) : 'Internal Server Error'

    // log only unknown exceptions
    if (status >= 500) Sentry.captureException(exception)

    response
      .status(status)
      .json({
        message: message,
        timestamp: new Date().toISOString(),
        path: request.url,
        data: {}
      })
  }
}

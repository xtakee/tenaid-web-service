import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { SentryExceptionCaptured } from '@sentry/nestjs';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {

  @SentryExceptionCaptured()
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
    ? exception.getStatus()
    : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException ? (
      (typeof (exception.getResponse() as any).message) === 'string'
      ? (exception.getResponse() as any).message
      : (exception.getResponse() as any).message[0]
    ) : 'Internal Server Error'

    response
      .status(status)
      .json({
        message: message,
        timestamp: new Date().toISOString(),
        path: request.url,
        data: {}
      });
  }
}

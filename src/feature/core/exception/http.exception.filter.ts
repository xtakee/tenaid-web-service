import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const message = (typeof (exception.getResponse() as any).message) === 'string'
      ? (exception.getResponse() as any).message
      : (exception.getResponse() as any).message[0]

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

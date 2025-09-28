import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | object;
    let error: string;

    /**
     * Обработка HTTP исключений
     */
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse: object | string = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.message;
      } else {
        message = (exceptionResponse['message'] as string) || exception.message;
        error = (exceptionResponse['error'] as string) || exception.name;
      }
    } else if (exception instanceof Error && 'code' in exception) {
      /**
       * Обработка ошибок бд
       */
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Database error occurred';
      error = 'Database Error';
    } else {
      /**
       * Обработка всех остальных ошибок
       */
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Internal Server Error';
    }

    this.logError(exception, request);

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
      error: error,
    };

    response.status(status).json(errorResponse);
  }

  private logError(exception: unknown, request: Request) {
    if (exception instanceof HttpException && exception.getStatus() < 500) {
      this.logger.warn(
        `Client Error: ${exception.getStatus()} ${request.method} ${request.url} - ${exception.message}`,
      );
    } else {
      this.logger.error(
        `Server Error: ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : exception,
      );
    }
  }
}

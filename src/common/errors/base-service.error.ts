import { HttpException, type HttpStatus } from '@nestjs/common';

/**
 * Базовый класс внутренней ошибки сервиса адаптации.
 *
 * Используется исключительно для управления логикой внутри сервиса.
 *
 * Не должен быть использован для отправки клиенту.
 * Для этих целей должен быть использован класс `BaseServiceResponseError`.
 */
export class BaseServiceInternalError extends Error {
  constructor(message?: string, error?: Error) {
    if (error) {
      super(message);
    } else {
      super(message, { cause: error });
    }
  }
}

/**
 * Базовый класс публичной ошибки сервиса адаптации.
 *
 * Используется исключительно для отправки клиенту.
 *
 * Не должен быть использован для управления логикой внутри сервиса.
 * Для этих целей должен быть использован класс `BaseServiceInternalError`.
 *
 */
export class BaseServiceError extends HttpException {
  constructor(message: string, status: HttpStatus) {
    super(message, status);
  }
}

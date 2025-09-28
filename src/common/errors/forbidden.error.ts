import { HttpStatus } from '@nestjs/common';
import { BaseServiceError } from './base-service.error';

export class ForbiddenError extends BaseServiceError {
  constructor(message?: string) {
    super(message ?? 'Forbidden error', HttpStatus.FORBIDDEN);
  }
}

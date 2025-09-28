import { HttpStatus } from '@nestjs/common';
import { BaseServiceError } from './base-service.error';

export class ValidationCustomError extends BaseServiceError {
  constructor(errors: string[]) {
    super(`Validation error: ${errors.join('\n')}`, HttpStatus.BAD_REQUEST);
  }
}

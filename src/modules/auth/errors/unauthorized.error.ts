import { HttpStatus } from '@nestjs/common';
import { AuthModuleError } from './auth-module.error';

export class UnauthorizedError extends AuthModuleError {
  constructor() {
    super(`Invalid credentials`, HttpStatus.BAD_REQUEST);
  }
}

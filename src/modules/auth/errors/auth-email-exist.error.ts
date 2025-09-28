import { HttpStatus } from '@nestjs/common';
import { AuthModuleError } from './auth-module.error';

export class AuthEmailExistError extends AuthModuleError {
  constructor(login: string) {
    super(`User with login = ${login} already exist`, HttpStatus.BAD_REQUEST);
  }
}

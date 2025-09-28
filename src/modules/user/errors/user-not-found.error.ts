import { HttpStatus } from '@nestjs/common';
import { UserModuleError } from './user-module.error';

import type { Id } from '@app/common/type-alias';

export class UserNotFoundError extends UserModuleError {
  constructor(id: Id) {
    super(`User with id = ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

import { HttpStatus } from '@nestjs/common';
import { ArticleModuleError } from './article-module.error';

import type { Id } from '@app/common/type-alias';

export class ArticleNotFoundError extends ArticleModuleError {
  constructor(id: Id) {
    super(`Article with id = ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

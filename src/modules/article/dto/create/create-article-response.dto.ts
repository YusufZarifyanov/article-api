import type { Id } from '@app/common/type-alias';
import type { ICreateArticleResponse } from '@types';

export class CreateArticleResponseDto implements ICreateArticleResponse {
  articleId: Id;

  status: string;

  constructor(articleId: Id) {
    this.articleId = articleId;
    this.status = 'OK';
  }
}

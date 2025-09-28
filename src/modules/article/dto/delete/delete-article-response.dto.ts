import type { Id } from '@app/common/type-alias';
import type { IDeleteArticleResponse } from '@types';

export class DeleteArticleResponseDto implements IDeleteArticleResponse {
  articleId: Id;

  status: string;

  constructor(articleId: Id) {
    this.articleId = articleId;
    this.status = 'OK';
  }
}

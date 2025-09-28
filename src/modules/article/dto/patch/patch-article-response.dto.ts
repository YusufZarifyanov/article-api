import type { Id } from '@app/common/type-alias';
import type { IPatchArticleResponse } from '@types';

export class PatchArticleResponseDto implements IPatchArticleResponse {
  articleId: Id;

  status: string;

  constructor(articleId: Id) {
    this.articleId = articleId;
    this.status = 'OK';
  }
}

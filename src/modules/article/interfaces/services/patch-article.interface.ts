import type { Id } from '@app/common/type-alias';
import type { IPatchArticleParams } from '@types';

export interface PatchArticleParams {
  articleId: Id;
  articleBody: IPatchArticleParams;
  authorId: Id;
}

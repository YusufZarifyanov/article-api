import type { Id } from '@app/common/type-alias';
import type { ICreateArticleParams } from '@types';

export interface CreateArticleParams {
  article: ICreateArticleParams;
  authorId: Id;
}

export type CreateArticleReturns = {
  articleId: Id;
};

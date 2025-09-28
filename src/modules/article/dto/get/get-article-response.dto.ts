import type { IGetArticleResponse } from '@types';
import type { GetArticleReturns } from '../../interfaces/services';
import type { Id } from '@app/common/type-alias';

import { joinFullName } from '@app/common/helpers';

export class GetArticleResponseDto implements IGetArticleResponse {
  id: Id;

  title: string;

  description: string;

  publicationDate: Date;

  author: {
    id: Id;

    fullName: string;
  };

  /**
   * Тут нужно быть внимательным, чтобы передать статью
   * вместе со связью с автором. Иначе провалимся в ошибку property undefined.
   */
  constructor(article: GetArticleReturns) {
    this.id = article.id;
    this.title = article.title;
    this.description = article.description;
    this.publicationDate = article.publicationDate;

    const { author } = article;

    this.author = {
      id: author.id,
      fullName: joinFullName({
        firstName: author.firstName,
        lastName: author.lastName,
        middleName: author.middleName ?? null,
      }),
    };
  }
}

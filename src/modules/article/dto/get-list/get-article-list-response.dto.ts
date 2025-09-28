import { joinFullName } from '@app/common/helpers';

import type { Id } from '@app/common/type-alias';
import type { Article } from '@app/entities';

import type {
  IGetArticleListItemResponse,
  IGetArticleListResponse,
} from '@types';

class GetArticleListResponseItemDto implements IGetArticleListItemResponse {
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
  constructor(article: Article) {
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

export class GetArticleListResponseDto implements IGetArticleListResponse {
  articles: IGetArticleListItemResponse[];

  total: number;

  constructor(articles: Article[], total: number) {
    this.articles = articles.map((a) => new GetArticleListResponseItemDto(a));

    this.total = total;
  }
}

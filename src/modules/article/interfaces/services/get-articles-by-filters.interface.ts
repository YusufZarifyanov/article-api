import type { SortOrder } from '@app/common/enums';
import type { Article } from '@app/entities';

export type GetArticlesByFiltersParams = {
  page: number;
  size: number;

  filters?: {
    author?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  };

  sorts: {
    articleId?: SortOrder;
    author?: SortOrder;
    publicationDate?: SortOrder;
  };
};

export type GetArticlesByFiltersReturns = {
  articles: Article[];
  total: number;
};

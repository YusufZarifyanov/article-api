import type { SortOrder } from '@app/common/enums';
import type { Article } from '@app/entities';

export interface FindAllByFiltersParams {
  page: number;
  size: number;
  filters: {
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
}

export interface FindAllByFiltersReturns {
  articles: Article[];
  total: number;
}

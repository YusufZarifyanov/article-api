import type { SortOrder } from '../../enums';

export interface IGetArticleListParams {
  page?: number;
  size?: number;

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

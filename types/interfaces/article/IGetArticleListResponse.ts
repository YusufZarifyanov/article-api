export type IGetArticleListItemResponse = {
  id: number;
  title: string;
  description: string;
  publicationDate: Date;
  author: {
    id: number;
    fullName: string;
  };
};

export type IGetArticleListResponse = {
  articles: Array<IGetArticleListItemResponse>;
  total: number;
};

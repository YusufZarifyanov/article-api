import type { Article } from '@app/entities';

export type GetArticleListToRedisReturnsInterface = {
  articles: Article[];
  total: number;
};

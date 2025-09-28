import type { Article } from '@app/entities';

export type SetArticleListToRedisParamsInterface = {
  articles: Article[];
  total: number;
};

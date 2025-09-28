import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

import type {
  GetArticleByIdFromRedisReturnsInterface,
  GetArticleListToRedisReturnsInterface,
  SetArticleByIdToRedisParamsInterface,
  SetArticleListToRedisParamsInterface,
} from '../interfaces/services';
import type { Id } from '@app/common/type-alias';

@Injectable()
export class RedisArticleService {
  private readonly CACHE_PREFIX = 'article';
  private readonly DEFAULT_TTL = 600;

  constructor(private readonly redisService: RedisService) {}

  private getArticleKey(id: Id): string {
    return `${this.CACHE_PREFIX}:${id}`;
  }

  private getArticleListKey(queryParams: object): string {
    const queryString = JSON.stringify(queryParams);

    return `${this.CACHE_PREFIX}:${Buffer.from(queryString).toString('base64')}`;
  }

  /**
   * Получает статью из кеша по идентификатору.
   *
   * @param id идентификатор статьи.
   * @returns  запись статьи из кэша | null.
   */
  async findArticle(
    id: Id,
  ): Promise<GetArticleByIdFromRedisReturnsInterface | null> {
    const article =
      await this.redisService.getJson<GetArticleByIdFromRedisReturnsInterface>(
        this.getArticleKey(id),
      );

    return article ?? null;
  }

  /**
   * Получает статью из кеша по идентификатору.
   *
   * @param id идентификатор статьи.
   * @returns  запись статьи из кэша | null.
   */
  async findArticleList(
    requestParams: object,
  ): Promise<GetArticleListToRedisReturnsInterface | null> {
    const articles =
      await this.redisService.getJson<GetArticleListToRedisReturnsInterface>(
        this.getArticleListKey(requestParams),
      );

    return articles ?? null;
  }

  /**
   * Сохраняет статью по идентификатору.
   *
   * @param params параметры сохранения
   * @param ttl    время жизини записи.
   */
  async setArticle(
    params: SetArticleByIdToRedisParamsInterface,
    ttl: number = this.DEFAULT_TTL,
  ): Promise<void> {
    await this.redisService.setJson<SetArticleByIdToRedisParamsInterface>(
      this.getArticleKey(params.id),
      params,
      ttl,
    );
  }

  /**
   * Сохраняет список статей по входным параметрам.
   *
   * @param articles статьи.
   * @param params   параметры запроса
   * @param ttl      время жизини записи.
   */
  async setArticleList(
    articles: SetArticleListToRedisParamsInterface,
    requestParams: object,
    ttl: number = this.DEFAULT_TTL,
  ): Promise<void> {
    await this.redisService.setJson<SetArticleListToRedisParamsInterface>(
      this.getArticleListKey(requestParams),
      articles,
      ttl,
    );
  }

  /**
   * Удаляет запись стати из кэша.
   *
   * @param id идентификатор статьи.
   */
  async invalidateArticle(id: Id): Promise<void> {
    await this.redisService.del(this.getArticleKey(id));
  }

  /**
   * Очищает все статьи из кэша.
   */
  async resetArticles(): Promise<void> {
    await this.redisService.reset();
  }
}

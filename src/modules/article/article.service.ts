import { Injectable } from '@nestjs/common';

import type {
  CreateArticleParams,
  CreateArticleReturns,
  GetArticleReturns,
  GetArticlesByFiltersParams,
  GetArticlesByFiltersReturns,
  PatchArticleParams,
} from './interfaces/services';

import { ArticleRepository } from './article.repository';
import { UserService } from '../user/user.service';
import { RedisArticleService } from '../redis/services';

import { ArticleNotFoundError } from './errors';
import { ForbiddenError } from '@app/common/errors';

import type { Id } from '@app/common/type-alias';

@Injectable()
export class ArticleService {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly userService: UserService,
    private readonly redisArticleService: RedisArticleService,
  ) {}

  /**
   * Создает статью. Проверяет наличие автора.
   *
   * Удаляет все из кэша.
   *
   * @param param0 параметры статьи.
   * @param param1 идентификатор автора.
   * @returns      идентификатор созданной статьи.
   * @throws {UserNotFoundError} автор не найден.
   */
  async createArticle({
    article,
    authorId,
  }: CreateArticleParams): Promise<CreateArticleReturns> {
    const author = await this.userService.getUserById(authorId);

    const createdArticle = await this.articleRepository.create({
      ...article,
      authorId: author.id,
      author,
      publicationDate: article.publicationDate ?? new Date(),
    });

    await this.redisArticleService.resetArticles();

    return {
      articleId: createdArticle.id,
    };
  }

  /**
   * Частично обновляет статью.
   *
   * Проверяет полномочия пользовтеля относительно удаляемой статьи.
   *
   * Устанавливает/Обновляет запись в кэше.
   *
   * @param param0 идентификатор статьи.
   * @param param1 параметры обновления.
   * @param param2 идентификатор автора.
   * @throws {ArticleNotFoundError} статья не найдена.
   * @throws {ForbiddenError}       у пользователя нет прав на обновление.
   */
  async patchArticle({
    articleId,
    articleBody,
    authorId,
  }: PatchArticleParams): Promise<void> {
    const author = await this.userService.getUserById(authorId);

    const article = await this.articleRepository.findById(articleId);

    if (!article) {
      throw new ArticleNotFoundError(articleId);
    }

    if (article.authorId !== author.id) {
      throw new ForbiddenError('User not have access to this article');
    }

    const updatedArticle = await this.articleRepository.patch({
      ...article,
      ...articleBody,
    });

    await this.redisArticleService.resetArticles();

    await this.redisArticleService.setArticle(updatedArticle);
  }

  /**
   * Удаляет статью по идентификатору. Удаление происходит жестко.
   *
   * Проверяет полномочия пользовтеля относительно удаляемой статьи.
   *
   * Удаляет запись из кэша.
   *
   * @param id идентификатор статьи.
   * @throws {ArticleNotFoundError} статья не найдена.
   * @throws {ForbiddenError}       у пользователя нет прав на удаление.
   */
  async deleteArticleById(id: Id, authorId: Id): Promise<void> {
    const author = await this.userService.getUserById(authorId);

    const article = await this.articleRepository.findById(id);
    if (!article) {
      throw new ArticleNotFoundError(id);
    }

    if (article.authorId !== author.id) {
      throw new ForbiddenError('User not have access to this article');
    }

    await this.articleRepository.delete(article);

    await Promise.all([
      this.redisArticleService.invalidateArticle(id),
      this.redisArticleService.resetArticles(),
    ]);
  }

  /**
   * Находит статью со связями по идентификатору.
   *
   * Если запись есть в кэше - вернет ее, иначе - кэшируем.
   *
   * @param id идентификатор статьи.
   * @returns  статья.
   * @throws {ArticleNotFoundError} статья не найдена.
   */
  async getArticleById(id: Id): Promise<GetArticleReturns> {
    const cachedArticle = await this.redisArticleService.findArticle(id);
    if (cachedArticle) {
      return cachedArticle;
    }

    const article = await this.articleRepository.findByIdWithRelations(id);
    if (!article) {
      throw new ArticleNotFoundError(id);
    }

    await this.redisArticleService.setArticle(article);

    return article;
  }

  /**
   * Получает статьи в виде пагинации.
   * Есть возможность фильтровать статьи.
   * Есть возможность сортировать статьи по разным параметрам.
   *
   * @param page              номер страницы.
   * @param size              размер страницы.
   * @param filters.author    фильтр по имени автора.
   * @param filters.startDate фильтр старта по дате публикации.
   * @param filters.endDate   фильтр окончания по дате публикации.
   * @param filters.search    фильтр по названию статьи.
   * @returns                 пагинированный массив статей.
   */
  async getArticlesByFilters(
    params: GetArticlesByFiltersParams,
  ): Promise<GetArticlesByFiltersReturns> {
    const { page, size, filters, sorts } = params;

    const cachedParams = {
      page,
      size,
      ...(filters && { filters }),
      ...(sorts && { sorts }),
    };

    const cachedArticles =
      await this.redisArticleService.findArticleList(cachedParams);

    if (cachedArticles) {
      return cachedArticles;
    }

    const articleList = await this.articleRepository.findAllByFilters({
      page,
      size,
      filters: filters ?? {},
      sorts: sorts ?? {},
    });

    await this.redisArticleService.setArticleList(articleList, cachedParams);

    return articleList;
  }
}

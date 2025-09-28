import { Test, type TestingModule } from '@nestjs/testing';
import { Seeds } from '../common/seeds';
import { Faker } from '../common/faker';

import { UserService } from '@app/modules/user/user.service';
import { ArticleService } from '@app/modules/article/article.service';
import { RedisArticleService } from '@app/modules/redis/services';
import { ArticleRepository } from '@app/modules/article/article.repository';

import { ArticleNotFoundError } from '@app/modules/article/errors';
import { ForbiddenError } from '@app/common/errors';

describe('ArticleService', () => {
  let articleService: ArticleService;
  let articleRepository: ArticleRepository;
  let userService: UserService;
  let redisArticleService: RedisArticleService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: UserService,
          useValue: {
            getUserById: jest.fn(),
          },
        },
        {
          provide: ArticleRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            patch: jest.fn(),
            delete: jest.fn(),
            findByIdWithRelations: jest.fn(),
          },
        },
        {
          provide: RedisArticleService,
          useValue: {
            setArticle: jest.fn(),
            invalidateArticle: jest.fn(),
            findArticle: jest.fn(),
            resetArticles: jest.fn(),
          },
        },
      ],
    }).compile();

    articleService = module.get<ArticleService>(ArticleService);
    userService = module.get<UserService>(UserService);
    articleRepository = module.get<ArticleRepository>(ArticleRepository);
    redisArticleService = module.get<RedisArticleService>(RedisArticleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createArticle', () => {
    it('должен успешно создать статью', async () => {
      /**
       * Arrange
       */
      const user = Seeds.User();

      const title = Faker.String();
      const description = Faker.String();
      const publicationDate = new Date();

      const article = Seeds.Article();

      const getUserByIdMock = jest
        .spyOn(userService, 'getUserById')
        .mockResolvedValue(user);

      const createArticleMock = jest
        .spyOn(articleRepository, 'create')
        .mockResolvedValue(article);

      const createParams = {
        article: {
          title,
          description,
          publicationDate,
        },
        authorId: user.id,
      };

      jest
        .spyOn(redisArticleService, 'resetArticles')
        .mockResolvedValue(void 0);

      /**
       * Act
       */
      const result = await articleService.createArticle(createParams);

      /**
       * Assert
       */
      expect(getUserByIdMock).toHaveBeenCalledWith(user.id);
      expect(createArticleMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title,
          description,
          publicationDate,
          authorId: user.id,
          author: user,
        }),
      );

      expect(result).toEqual({
        articleId: article.id,
      });
    });
  });

  describe('patchArticle', () => {
    it('должен успешно обновить статью', async () => {
      /**
       * Arrange
       */
      const user = Seeds.User();

      const title = Faker.String();
      const article = Seeds.Article({
        author: user,
        authorId: user.id,
      });

      const getUserByIdMock = jest
        .spyOn(userService, 'getUserById')
        .mockResolvedValue(user);

      const findByIdMock = jest
        .spyOn(articleRepository, 'findById')
        .mockResolvedValue(article);

      const patchParams = {
        articleId: article.id,
        articleBody: {
          title,
        },
        authorId: user.id,
      };

      const patchMock = jest
        .spyOn(articleRepository, 'patch')
        .mockResolvedValue({
          ...article,
          ...patchParams.articleBody,
        });

      const redisSetArticle = jest
        .spyOn(redisArticleService, 'setArticle')
        .mockResolvedValue(void 0);

      jest
        .spyOn(redisArticleService, 'resetArticles')
        .mockResolvedValue(void 0);

      /**
       * Act
       */
      await articleService.patchArticle(patchParams);

      /**
       * Assert
       */
      expect(getUserByIdMock).toHaveBeenCalledWith(user.id);
      expect(findByIdMock).toHaveBeenCalledWith(article.id);
      expect(patchMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: article.id,
          description: article.description,
          publicationDate: article.publicationDate,
          title,
          authorId: user.id,
        }),
      );
      expect(redisSetArticle).toHaveBeenCalledWith({
        ...article,
        ...patchParams.articleBody,
      });
    });

    it('должен вернуть ошибку если статьи не существует', async () => {
      /**
       * Arrange
       */
      const user = Seeds.User();

      const title = Faker.String();
      const articleId = Faker.Number();

      const getUserByIdMock = jest
        .spyOn(userService, 'getUserById')
        .mockResolvedValue(user);

      const findByIdMock = jest
        .spyOn(articleRepository, 'findById')
        .mockResolvedValue(null);

      const patchParams = {
        articleId,
        articleBody: {
          title,
        },
        authorId: user.id,
      };

      /**
       * Act
       */
      const response = async () => articleService.patchArticle(patchParams);

      /**
       * Assert
       */
      await expect(response).rejects.toThrow(ArticleNotFoundError);

      expect(getUserByIdMock).toHaveBeenCalledWith(user.id);
      expect(findByIdMock).toHaveBeenCalledWith(articleId);
    });

    it('должен вернуть ошибку если у пользователя нет доступа', async () => {
      /**
       * Arrange
       */
      const user = Seeds.User();

      const title = Faker.String();
      const article = Seeds.Article();

      const getUserByIdMock = jest
        .spyOn(userService, 'getUserById')
        .mockResolvedValue(user);

      const findByIdMock = jest
        .spyOn(articleRepository, 'findById')
        .mockResolvedValue(article);

      const patchParams = {
        articleId: article.id,
        articleBody: {
          title,
        },
        authorId: user.id,
      };

      const patchMock = jest
        .spyOn(articleRepository, 'patch')
        .mockResolvedValue({
          ...article,
          ...patchParams.articleBody,
        });

      /**
       * Act
       */
      const response = async () => articleService.patchArticle(patchParams);

      /**
       * Assert
       */
      await expect(response).rejects.toThrow(ForbiddenError);

      expect(getUserByIdMock).toHaveBeenCalledWith(user.id);
      expect(findByIdMock).toHaveBeenCalledWith(article.id);
      expect(patchMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('deleteArticleById', () => {
    it('должен успешно удаить статью', async () => {
      /**
       * Arrange
       */
      const user = Seeds.User();

      const article = Seeds.Article({
        author: user,
        authorId: user.id,
      });

      const getUserByIdMock = jest
        .spyOn(userService, 'getUserById')
        .mockResolvedValue(user);

      const findByIdMock = jest
        .spyOn(articleRepository, 'findById')
        .mockResolvedValue(article);

      const deleteMock = jest
        .spyOn(articleRepository, 'delete')
        .mockResolvedValue(void 0);

      const redisDeleteArticleMock = jest
        .spyOn(redisArticleService, 'invalidateArticle')
        .mockResolvedValue(void 0);

      jest
        .spyOn(redisArticleService, 'resetArticles')
        .mockResolvedValue(void 0);

      /**
       * Act
       */
      await articleService.deleteArticleById(article.id, user.id);

      /**
       * Assert
       */
      expect(getUserByIdMock).toHaveBeenCalledWith(user.id);
      expect(findByIdMock).toHaveBeenCalledWith(article.id);
      expect(deleteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: article.id,
          title: article.title,
        }),
      );
      expect(redisDeleteArticleMock).toHaveBeenCalledWith(article.id);
    });
  });

  describe('getArticleById', () => {
    it('должен успешно вернуть статью', async () => {
      /**
       * Arrange
       */
      const article = Seeds.Article();

      const redistGetArticle = jest
        .spyOn(redisArticleService, 'findArticle')
        .mockResolvedValue(null);

      const findByIdWithRelationsMock = jest
        .spyOn(articleRepository, 'findByIdWithRelations')
        .mockResolvedValue(article);

      /**
       * Act
       */
      const response = await articleService.getArticleById(article.id);

      /**
       * Assert
       */
      expect(response).toMatchObject({
        id: article.id,
      });
      expect(findByIdWithRelationsMock).toHaveBeenCalledWith(article.id);
      expect(redistGetArticle).toHaveBeenCalledWith(article.id);
    });

    it('должен успешно вернуть статью из кэша', async () => {
      /**
       * Arrange
       */
      const article = Seeds.Article();

      const redistGetArticle = jest
        .spyOn(redisArticleService, 'findArticle')
        .mockResolvedValue(article);

      const findByIdWithRelationsMock = jest
        .spyOn(articleRepository, 'findByIdWithRelations')
        .mockResolvedValue(article);

      /**
       * Act
       */
      const response = await articleService.getArticleById(article.id);

      /**
       * Assert
       */
      expect(response).toMatchObject({
        id: article.id,
      });
      expect(findByIdWithRelationsMock).toHaveBeenCalledTimes(0);
      expect(redistGetArticle).toHaveBeenCalledWith(article.id);
    });
  });
});

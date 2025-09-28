import { HttpStatus, type INestApplication } from '@nestjs/common';
import { Faker } from '../common/faker';
import { TestAppFixture } from '../common/fixtures';
import { Seeds } from '../common/seeds';

import request from 'supertest';

import type { Repository } from 'typeorm';
import { SortOrder } from '@app/common/enums';

import { RedisService } from '@app/modules/redis/services';

import { getRepositoryToken } from '@nestjs/typeorm';

import { Article, User } from '@app/entities';

describe('ArticleController (e2e)', () => {
  let app: INestApplication;
  let articleRepository: Repository<Article>;
  let userRepository: Repository<User>;
  let redisService: RedisService;

  beforeAll(async () => {
    app = await TestAppFixture.getApp();

    articleRepository = app.get(getRepositoryToken(Article));
    userRepository = app.get(getRepositoryToken(User));
    redisService = app.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('/article (POST)', () => {
    it('Должен создать статью', async () => {
      /**
       * Arrange
       */
      const u = Seeds.User();

      const title = Faker.String();
      const description = Faker.String();
      const publicationDate = Faker.FutureDate().toISOString();

      const userRaw = await userRepository.save(u);

      jest.spyOn(redisService, 'reset').mockResolvedValue(void 0);

      /**
       * Act
       */
      const response = await request(app.getHttpServer() as string)
        .post('/article')
        .set('x-user-id', String(userRaw.id))
        .send({
          title,
          description,
          publicationDate,
        });

      /**
       * Assert
       */
      const article = await articleRepository.findOne({
        where: {
          title,
        },
      });

      expect(article).toBeTruthy();
      expect(article?.title).toEqual(title);
      expect(article?.description).toEqual(description);
      expect(article?.authorId).toEqual(userRaw.id);

      expect(response.body).toMatchObject({
        articleId: article?.id,
      });
    });
  });

  describe('/article (PATCH)', () => {
    it('Должен обновить статью', async () => {
      /**
       * Arrange
       */
      const u = userRepository.create(Seeds.User());
      const a = articleRepository.create(Seeds.Article());

      const userRaw = await userRepository.save(u);
      const articleRaw = await articleRepository.save({
        ...a,
        author: userRaw,
        authorId: userRaw.id,
      });

      const redisSetJsonMock = jest
        .spyOn(redisService, 'setJson')
        .mockResolvedValue(void 0);

      jest.spyOn(redisService, 'reset').mockResolvedValue(void 0);

      const title = Faker.String();

      /**
       * Act
       */
      const response = await request(app.getHttpServer() as string)
        .patch(`/article/${articleRaw.id}`)
        .set('x-user-id', String(userRaw.id))
        .send({ title });

      /**
       * Assert
       */
      const updatedArticle = await articleRepository.findOne({
        where: {
          id: articleRaw.id,
        },
      });

      expect(updatedArticle).toBeTruthy();
      expect(updatedArticle?.title).toEqual(title);
      expect(updatedArticle?.description).toEqual(articleRaw.description);

      expect(response.body).toMatchObject({
        articleId: updatedArticle?.id,
      });

      expect(redisSetJsonMock).toHaveBeenCalledWith(
        `article:${articleRaw.id}`,
        expect.objectContaining({
          id: articleRaw.id,
        }),
        600,
      );
    });

    it('Должен вернуть ошибку если статьи нет', async () => {
      /**
       * Arrange
       */
      const u = userRepository.create(Seeds.User());

      const userRaw = await userRepository.save(u);

      const title = Faker.String();

      /**
       * Act
       */
      const response = await request(app.getHttpServer() as string)
        .patch(`/article/${Faker.Number()}`)
        .set('x-user-id', String(userRaw.id))
        .send({ title });

      /**
       * Assert
       */
      expect(response.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('Должен вернуть ошибку если у пользователя нет прав', async () => {
      /**
       * Arrange
       */
      const u1 = userRepository.create(Seeds.User());
      const u2 = userRepository.create(Seeds.User());
      const a = articleRepository.create(Seeds.Article());

      const userRaw1 = await userRepository.save(u1);
      const userRaw2 = await userRepository.save(u2);
      const articleRaw = await articleRepository.save({
        ...a,
        author: userRaw2,
        authorId: userRaw2.id,
      });

      const title = Faker.String();

      /**
       * Act
       */
      const response = await request(app.getHttpServer() as string)
        .patch(`/article/${articleRaw.id}`)
        .set('x-user-id', String(userRaw1.id))
        .send({ title });

      /**
       * Assert
       */
      expect(response.status).toEqual(HttpStatus.FORBIDDEN);
    });
  });

  describe('/article (DELETE)', () => {
    it('Должен удалить статью', async () => {
      /**
       * Arrange
       */
      const u = userRepository.create(Seeds.User());
      const a = articleRepository.create(Seeds.Article());

      const userRaw = await userRepository.save(u);
      const articleRaw = await articleRepository.save({
        ...a,
        author: userRaw,
        authorId: userRaw.id,
      });

      const redisDelMock = jest
        .spyOn(redisService, 'del')
        .mockResolvedValue(void 0);

      jest.spyOn(redisService, 'reset').mockResolvedValue(void 0);

      /**
       * Act
       */
      const response = await request(app.getHttpServer() as string)
        .delete(`/article/${articleRaw.id}`)
        .set('x-user-id', String(userRaw.id))
        .send();

      /**
       * Assert
       */
      const deletedArticle = await articleRepository.findOne({
        where: {
          id: articleRaw.id,
        },
      });

      expect(deletedArticle).toBeFalsy();
      expect(response.body).toMatchObject({
        articleId: articleRaw?.id,
      });

      expect(redisDelMock).toHaveBeenCalledWith(`article:${articleRaw.id}`);
    });

    it('Должен вернуть ошибку если у пользователя нет прав', async () => {
      /**
       * Arrange
       */
      const u1 = userRepository.create(Seeds.User());
      const u2 = userRepository.create(Seeds.User());
      const a = articleRepository.create(Seeds.Article());

      const userRaw1 = await userRepository.save(u1);
      const userRaw2 = await userRepository.save(u2);
      const articleRaw = await articleRepository.save({
        ...a,
        author: userRaw2,
        authorId: userRaw2.id,
      });

      /**
       * Act
       */
      const response = await request(app.getHttpServer() as string)
        .delete(`/article/${articleRaw.id}`)
        .set('x-user-id', String(userRaw1.id))
        .send();

      /**
       * Assert
       */
      expect(response.status).toEqual(HttpStatus.FORBIDDEN);

      const deletedArticle = await articleRepository.findOne({
        where: {
          id: articleRaw.id,
        },
      });

      expect(deletedArticle).toBeTruthy();
    });
  });

  describe('/article/:id (GET)', () => {
    it('Должен получить статью', async () => {
      /**
       * Arrange
       */
      const u = userRepository.create(
        Seeds.User({
          firstName: Faker.String(),
          lastName: Faker.String(),
          middleName: Faker.String(),
        }),
      );
      const a = articleRepository.create(
        Seeds.Article({
          title: Faker.String(),
          description: Faker.String(),
        }),
      );

      const userRaw = await userRepository.save(u);
      const articleRaw = await articleRepository.save({
        ...a,
        author: userRaw,
        authorId: userRaw.id,
      });

      const redisGetMock = jest
        .spyOn(redisService, 'getJson')
        .mockResolvedValue(null);

      /**
       * Act
       */
      const response = await request(app.getHttpServer() as string)
        .get(`/article/${articleRaw.id}`)
        .send();

      /**
       * Assert
       */
      expect(response.body).toMatchObject({
        id: articleRaw.id,
        title: articleRaw.title,
        description: articleRaw.description,
        author: expect.objectContaining({
          id: userRaw.id,
          fullName: `${userRaw.lastName} ${userRaw.firstName} ${userRaw.middleName}`,
        }) as object,
      });

      expect(redisGetMock).toHaveBeenCalledWith(`article:${articleRaw.id}`);
    });

    it('Должен вернуть ошибку если статьи нет', async () => {
      /**
       * Arrange
       */
      const u = userRepository.create(Seeds.User());
      await userRepository.save(u);

      /**
       * Act
       */
      const response = await request(app.getHttpServer() as string)
        .get(`/article/${Faker.Number()}`)
        .send();

      /**
       * Assert
       */
      expect(response.status).toEqual(HttpStatus.NOT_FOUND);
    });
  });

  describe('/article (GET)', () => {
    it('Должен получить список статей с пагинацией', async () => {
      /**
       * Arrange
       */
      const u = userRepository.create(Seeds.User());
      const [a1, a2] = [
        articleRepository.create(
          Seeds.Article({
            publicationDate: Faker.PastDate(),
          }),
        ),
        articleRepository.create(
          Seeds.Article({
            publicationDate: Faker.FutureDate(),
          }),
        ),
      ];

      const userRaw = await userRepository.save(u);
      const [articleRaw1] = await articleRepository.save([
        {
          ...a1,
          author: userRaw,
          authorId: userRaw.id,
        },
        {
          ...a2,
          author: userRaw,
          authorId: userRaw.id,
        },
      ]);

      const redisGetArticleListMock = jest
        .spyOn(redisService, 'getJson')
        .mockResolvedValue(null);

      const redisSetArticleListMock = jest
        .spyOn(redisService, 'setJson')
        .mockResolvedValue(void 0);

      const queryParams = {
        page: 2,
        size: 1,
      };

      /**
       * Act
       */
      const response = await request(app.getHttpServer() as string)
        .get(`/article`)
        .query(queryParams)
        .send();

      /**
       * Assert
       */
      expect(response.body).toMatchObject({
        total: 2,
        articles: [
          {
            id: articleRaw1.id,
            title: articleRaw1.title,
            description: articleRaw1.description,
            author: expect.objectContaining({
              id: userRaw.id,
              fullName: `${userRaw.lastName} ${userRaw.firstName} ${userRaw.middleName}`,
            }) as object,
          },
        ],
      });

      expect(redisGetArticleListMock).toHaveBeenCalledWith(
        `article:${Buffer.from(JSON.stringify(queryParams)).toString('base64')}`,
      );
      expect(redisSetArticleListMock).toHaveBeenCalledWith(
        `article:${Buffer.from(JSON.stringify(queryParams)).toString('base64')}`,
        {
          total: 2,
          articles: [expect.objectContaining({ id: articleRaw1.id })],
        },
        600,
      );
    });

    it('Должен получить список статей с учетом фильтра author', async () => {
      /**
       * Arrange
       */
      const authorFirstName = Faker.String();

      const [u1, u2] = [
        userRepository.create(
          Seeds.User({
            firstName: authorFirstName,
          }),
        ),
        userRepository.create(
          Seeds.User({
            firstName: Faker.String(),
          }),
        ),
      ];
      const [a1, a2] = [
        articleRepository.create(Seeds.Article()),
        articleRepository.create(Seeds.Article()),
      ];

      const [userRaw1, userRaw2] = [
        await userRepository.save(u1),
        await userRepository.save(u2),
      ];
      const [articleRaw1] = await articleRepository.save([
        {
          ...a1,
          author: userRaw1,
          authorId: userRaw1.id,
        },
        {
          ...a2,
          author: userRaw2,
          authorId: userRaw2.id,
        },
      ]);

      jest.spyOn(redisService, 'getJson').mockResolvedValue(null);

      jest.spyOn(redisService, 'setJson').mockResolvedValue(void 0);

      /**
       * Act
       */
      const response = await request(app.getHttpServer() as string)
        .get(`/article`)
        .query({
          page: 1,
          size: 10,
          filters: `{ "author": "${authorFirstName}" }`,
        })
        .send();

      /**
       * Assert
       */
      expect(response.body).toMatchObject({
        total: 1,
        articles: [
          {
            id: articleRaw1.id,
            title: articleRaw1.title,
            description: articleRaw1.description,
            author: expect.objectContaining({
              id: userRaw1.id,
              fullName: `${userRaw1.lastName} ${userRaw1.firstName} ${userRaw1.middleName}`,
            }) as object,
          },
        ],
      });
    });

    it('Должен получить список статей с учетом фильтра startDate', async () => {
      /**
       * Arrange
       */
      const startDate = new Date().toISOString();

      const [u1, u2] = [
        userRepository.create(Seeds.User()),
        userRepository.create(Seeds.User()),
      ];
      const [a1, a2, a3, a4] = [
        articleRepository.create(
          Seeds.Article({
            publicationDate: Faker.FutureDate(),
          }),
        ),
        articleRepository.create(
          Seeds.Article({
            publicationDate: Faker.FutureDate(),
          }),
        ),
        articleRepository.create(
          Seeds.Article({
            publicationDate: Faker.PastDate(),
          }),
        ),
        articleRepository.create(
          Seeds.Article({
            publicationDate: Faker.PastDate(),
          }),
        ),
      ];

      const [userRaw1, userRaw2] = [
        await userRepository.save(u1),
        await userRepository.save(u2),
      ];
      const [articleRaw1, articleRaw2] = await articleRepository.save([
        {
          ...a1,
          author: userRaw1,
          authorId: userRaw1.id,
        },
        {
          ...a2,
          author: userRaw2,
          authorId: userRaw2.id,
        },
        {
          ...a3,
          author: userRaw2,
          authorId: userRaw2.id,
        },
        {
          ...a4,
          author: userRaw2,
          authorId: userRaw2.id,
        },
      ]);

      jest.spyOn(redisService, 'getJson').mockResolvedValue(null);
      jest.spyOn(redisService, 'setJson').mockResolvedValue(void 0);

      /**
       * Act
       */
      const response = await request(app.getHttpServer() as string)
        .get(`/article`)
        .query({
          page: 1,
          size: 10,
          filters: `{ "startDate": "${startDate}" }`,
        })
        .send();

      /**
       * Assert
       */
      expect(response.body).toEqual({
        total: 2,
        articles: expect.arrayContaining([
          expect.objectContaining({
            id: articleRaw1.id,
            title: articleRaw1.title,
            description: articleRaw1.description,
            author: expect.objectContaining({
              id: userRaw1.id,
              fullName: `${userRaw1.lastName} ${userRaw1.firstName} ${userRaw1.middleName}`,
            }) as object,
          }),
          expect.objectContaining({
            id: articleRaw2.id,
            title: articleRaw2.title,
            description: articleRaw2.description,
            author: expect.objectContaining({
              id: userRaw2.id,
              fullName: `${userRaw2.lastName} ${userRaw2.firstName} ${userRaw2.middleName}`,
            }) as object,
          }),
        ]) as object[],
      });
    });

    it('Должен получить список статей с учетом фильтра endDate', async () => {
      /**
       * Arrange
       */
      const endDate = new Date().toISOString();

      const [u1, u2] = [
        userRepository.create(Seeds.User()),
        userRepository.create(Seeds.User()),
      ];
      const [a1, a2, a3, a4] = [
        articleRepository.create(
          Seeds.Article({
            publicationDate: Faker.PastDate(),
          }),
        ),
        articleRepository.create(
          Seeds.Article({
            publicationDate: Faker.PastDate(),
          }),
        ),
        articleRepository.create(
          Seeds.Article({
            publicationDate: Faker.FutureDate(),
          }),
        ),
        articleRepository.create(
          Seeds.Article({
            publicationDate: Faker.FutureDate(),
          }),
        ),
      ];

      const [userRaw1, userRaw2] = [
        await userRepository.save(u1),
        await userRepository.save(u2),
      ];
      const [articleRaw1, articleRaw2] = await articleRepository.save([
        {
          ...a1,
          author: userRaw1,
          authorId: userRaw1.id,
        },
        {
          ...a2,
          author: userRaw2,
          authorId: userRaw2.id,
        },
        {
          ...a3,
          author: userRaw2,
          authorId: userRaw2.id,
        },
        {
          ...a4,
          author: userRaw2,
          authorId: userRaw2.id,
        },
      ]);

      jest.spyOn(redisService, 'getJson').mockResolvedValue(null);
      jest.spyOn(redisService, 'setJson').mockResolvedValue(void 0);

      /**
       * Act
       */
      const response = await request(app.getHttpServer() as string)
        .get(`/article`)
        .query({
          page: 1,
          size: 10,
          filters: `{ "endDate": "${endDate}" }`,
        })
        .send();

      /**
       * Assert
       */
      expect(response.body).toEqual({
        total: 2,
        articles: expect.arrayContaining([
          expect.objectContaining({
            id: articleRaw1.id,
            title: articleRaw1.title,
            description: articleRaw1.description,
            author: expect.objectContaining({
              id: userRaw1.id,
              fullName: `${userRaw1.lastName} ${userRaw1.firstName} ${userRaw1.middleName}`,
            }) as object,
          }),
          expect.objectContaining({
            id: articleRaw2.id,
            title: articleRaw2.title,
            description: articleRaw2.description,
            author: expect.objectContaining({
              id: userRaw2.id,
              fullName: `${userRaw2.lastName} ${userRaw2.firstName} ${userRaw2.middleName}`,
            }) as object,
          }),
        ]) as object[],
      });
    });

    it('Должен получить список статей с учетом фильтра search', async () => {
      /**
       * Arrange
       */
      const search = 'est';

      const [u1, u2] = [
        userRepository.create(Seeds.User()),
        userRepository.create(Seeds.User()),
      ];
      const [a1, a2, a3] = [
        articleRepository.create(
          Seeds.Article({
            title: 'Testing',
          }),
        ),
        articleRepository.create(
          Seeds.Article({
            title: 'Some bruh',
          }),
        ),
        articleRepository.create(
          Seeds.Article({
            title: 'I like resting',
          }),
        ),
      ];

      const [userRaw1, userRaw2] = [
        await userRepository.save(u1),
        await userRepository.save(u2),
      ];
      const [articleRaw1, , articleRaw3] = await articleRepository.save([
        {
          ...a1,
          author: userRaw1,
          authorId: userRaw1.id,
        },
        {
          ...a2,
          author: userRaw2,
          authorId: userRaw2.id,
        },
        {
          ...a3,
          author: userRaw2,
          authorId: userRaw2.id,
        },
      ]);

      jest.spyOn(redisService, 'getJson').mockResolvedValue(null);
      jest.spyOn(redisService, 'setJson').mockResolvedValue(void 0);

      /**
       * Act
       */
      const response = await request(app.getHttpServer() as string)
        .get(`/article`)
        .query({
          page: 1,
          size: 10,
          filters: `{ "search": "${search}" }`,
        })
        .send();

      /**
       * Assert
       */
      expect(response.body).toMatchObject({
        total: 2,
        articles: expect.arrayContaining([
          expect.objectContaining({
            id: articleRaw1.id,
            title: articleRaw1.title,
            description: articleRaw1.description,
            author: expect.objectContaining({
              id: userRaw1.id,
              fullName: `${userRaw1.lastName} ${userRaw1.firstName} ${userRaw1.middleName}`,
            }) as object,
          }),
          expect.objectContaining({
            id: articleRaw3.id,
            title: articleRaw3.title,
            description: articleRaw3.description,
            author: expect.objectContaining({
              id: userRaw2.id,
              fullName: `${userRaw2.lastName} ${userRaw2.firstName} ${userRaw2.middleName}`,
            }) as object,
          }),
        ]) as object[],
      });
    });

    it('Должен получить список статей с учетом сортировки по author', async () => {
      /**
       * Arrange
       */
      const authorFirstNameOrder = SortOrder.Asc;

      const [u1, u2, u3, u4] = [
        userRepository.create(
          Seeds.User({
            firstName: 'B',
          }),
        ),
        userRepository.create(
          Seeds.User({
            firstName: 'Z',
          }),
        ),
        userRepository.create(
          Seeds.User({
            firstName: 'A',
          }),
        ),
        userRepository.create(
          Seeds.User({
            firstName: 'C',
          }),
        ),
      ];
      const [a1, a2, a3, a4] = [
        articleRepository.create(Seeds.Article()),
        articleRepository.create(Seeds.Article()),
        articleRepository.create(Seeds.Article()),
        articleRepository.create(Seeds.Article()),
      ];

      const [userRaw1, userRaw2, userRaw3, userRaw4] = [
        await userRepository.save(u1),
        await userRepository.save(u2),
        await userRepository.save(u3),
        await userRepository.save(u4),
      ];
      const [articleRaw1, articleRaw2, articleRaw3, articleRaw4] =
        await articleRepository.save([
          {
            ...a1,
            author: userRaw1,
            authorId: userRaw1.id,
          },
          {
            ...a2,
            author: userRaw2,
            authorId: userRaw2.id,
          },
          {
            ...a3,
            author: userRaw3,
            authorId: userRaw3.id,
          },
          {
            ...a4,
            author: userRaw4,
            authorId: userRaw4.id,
          },
        ]);

      jest.spyOn(redisService, 'getJson').mockResolvedValue(null);
      jest.spyOn(redisService, 'setJson').mockResolvedValue(void 0);

      /**
       * Act
       */
      const response = await request(app.getHttpServer() as string)
        .get(`/article`)
        .query({
          page: 1,
          size: 10,
          sorts: `{ "author": "${authorFirstNameOrder}" }`,
        })
        .send();

      /**
       * Assert
       */
      expect(response.body).toMatchObject({
        total: 4,
        articles: [
          expect.objectContaining({
            id: articleRaw3.id,
          }),
          expect.objectContaining({
            id: articleRaw1.id,
          }),
          expect.objectContaining({
            id: articleRaw4.id,
          }),
          expect.objectContaining({
            id: articleRaw2.id,
          }),
        ] as object[],
      });
    });

    it('Должен получить список статей с учетом сортировки по id', async () => {
      /**
       * Arrange
       */
      const articleIdSort = SortOrder.Desc;

      const u = userRepository.create(Seeds.User());

      const [a1, a2, a3] = [
        articleRepository.create(Seeds.Article()),
        articleRepository.create(Seeds.Article()),
        articleRepository.create(Seeds.Article()),
      ];

      const userRaw1 = await userRepository.save(u);

      const [articleRaw1, articleRaw2, articleRaw3] =
        await articleRepository.save([
          {
            ...a1,
            author: userRaw1,
            authorId: userRaw1.id,
          },
          {
            ...a2,
            author: userRaw1,
            authorId: userRaw1.id,
          },
          {
            ...a3,
            author: userRaw1,
            authorId: userRaw1.id,
          },
        ]);

      jest.spyOn(redisService, 'getJson').mockResolvedValue(null);
      jest.spyOn(redisService, 'setJson').mockResolvedValue(void 0);

      /**
       * Act
       */
      const response = await request(app.getHttpServer() as string)
        .get(`/article`)
        .query({
          page: 1,
          size: 10,
          sorts: `{ "articleId": "${articleIdSort}" }`,
        })
        .send();

      /**
       * Assert
       */
      expect(response.body).toMatchObject({
        total: 3,
        articles: [
          expect.objectContaining({
            id: articleRaw3.id,
          }),
          expect.objectContaining({
            id: articleRaw2.id,
          }),
          expect.objectContaining({
            id: articleRaw1.id,
          }),
        ] as object[],
      });
    });

    it('Должен получить список статей с учетом сортировки по id', async () => {
      /**
       * Arrange
       */
      const publicationDateSort = SortOrder.Asc;

      const u = userRepository.create(Seeds.User());

      const [a1, a2, a3] = [
        articleRepository.create(
          Seeds.Article({
            publicationDate: new Date(),
          }),
        ),
        articleRepository.create(
          Seeds.Article({
            publicationDate: Faker.PastDate(),
          }),
        ),
        articleRepository.create(
          Seeds.Article({
            publicationDate: Faker.FutureDate(),
          }),
        ),
      ];

      const userRaw1 = await userRepository.save(u);

      const [articleRaw1, articleRaw2, articleRaw3] =
        await articleRepository.save([
          {
            ...a1,
            author: userRaw1,
            authorId: userRaw1.id,
          },
          {
            ...a2,
            author: userRaw1,
            authorId: userRaw1.id,
          },
          {
            ...a3,
            author: userRaw1,
            authorId: userRaw1.id,
          },
        ]);

      jest.spyOn(redisService, 'getJson').mockResolvedValue(null);
      jest.spyOn(redisService, 'setJson').mockResolvedValue(void 0);

      /**
       * Act
       */
      const response = await request(app.getHttpServer() as string)
        .get(`/article`)
        .query({
          page: 1,
          size: 10,
          sorts: `{ "publicationDate": "${publicationDateSort}" }`,
        })
        .send();

      /**
       * Assert
       */
      expect(response.body).toMatchObject({
        total: 3,
        articles: [
          expect.objectContaining({
            id: articleRaw2.id,
          }),
          expect.objectContaining({
            id: articleRaw1.id,
          }),
          expect.objectContaining({
            id: articleRaw3.id,
          }),
        ] as object[],
      });
    });
  });
});

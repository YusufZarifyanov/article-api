import { HttpStatus, type INestApplication } from '@nestjs/common';
import { Faker } from '../common/faker';
import { TestAppFixture } from '../common/fixtures';
import { Seeds } from '../common/seeds';

import request from 'supertest';

import * as bcrypt from 'bcrypt';

import { type Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@app/entities';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    app = await TestAppFixture.getApp();

    userRepository = app.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('/auth/register (POST)', () => {
    it('Должен зарегистрировать пользователя', async () => {
      /**
       * Arrange
       */
      const hashedPassword = Faker.String();

      const registerDto = {
        email: Faker.Email(),
        password: Faker.String(10),
        firstName: Faker.String(),
        lastName: Faker.String(),
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      /**
       * Act
       */
      const response = await request(app.getHttpServer() as string)
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED);

      /**
       * Assert
       */
      const user = await userRepository.findOne({
        where: {
          email: registerDto.email,
        },
      });

      expect(user).toBeDefined();
      expect(user?.email).toEqual(registerDto.email);
      expect(user?.password).toEqual(hashedPassword);

      expect(response.body).toMatchObject({
        userId: user?.id,
        accessToken: expect.anything() as string,
      });
    });

    it('Должен вернуть ошибку если пользователь с email существует', async () => {
      /**
       * Arrang
       */
      const email = Faker.Email();

      await userRepository.save(
        Seeds.User({
          email,
        }),
      );

      /**
       * Act
       */
      const response = await request(app.getHttpServer() as string)
        .post('/auth/register')
        .send({
          email,
          password: Faker.String(10),
          firstName: Faker.String(),
          lastName: Faker.String(),
          userId: 1,
        });

      /**
       * Assert
       */
      expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/auth/login (POST)', () => {
    it('Должен аутентифицировать пользователя', async () => {
      /**
       * Arrange
       */
      const user = Seeds.User();

      await userRepository.save(user);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      /**
       * Act
       */
      const response = await request(app.getHttpServer() as string)
        .post('/auth/login')
        .send({
          email: user.email,
          password: Faker.String(10),
        })
        .expect(HttpStatus.OK);

      /**
       * Assert
       */
      expect(response.body).toMatchObject({
        userId: user?.id,
        accessToken: expect.anything() as string,
      });
    });

    it('Должен вернуть ошибку если пользователь с email не существует', async () => {
      /**
       * Arrang
       */

      /**
       * Act
       */
      const response = await request(app.getHttpServer() as string)
        .post('/auth/login')
        .send({
          email: Faker.Email(),
          password: Faker.String(10),
        });

      /**
       * Assert
       */
      expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
    });
  });
});

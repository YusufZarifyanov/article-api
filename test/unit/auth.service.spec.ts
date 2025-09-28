import { Test, type TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Seeds } from '../common/seeds';
import { Faker } from '../common/faker';

import * as bcrypt from 'bcrypt';

import { UserService } from '@app/modules/user/user.service';
import { AuthService } from '@app/modules/auth/auth.service';

import {
  AuthEmailExistError,
  UnauthorizedError,
} from '@app/modules/auth/errors';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findUserByEmail: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('должен успешно зарегистрировать нового пользователя', async () => {
      /**
       * Arrange
       */
      const user = Seeds.User();
      const password = Faker.String();
      const hashedPassword = Faker.String();
      const expectedToken = Faker.String();

      const findUserByEmailMock = jest
        .spyOn(userService, 'findUserByEmail')
        .mockResolvedValue(null);
      const createMock = jest
        .spyOn(userService, 'createUser')
        .mockResolvedValue(user);
      const signMock = jest
        .spyOn(jwtService, 'sign')
        .mockResolvedValue(expectedToken as never);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const registerParams = {
        email: user.email,
        password,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      /**
       * Act
       */
      const result = await authService.register(registerParams);

      /**
       * Assert
       */
      expect(findUserByEmailMock).toHaveBeenCalledWith(user.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(createMock).toHaveBeenCalledWith({
        ...registerParams,
        password: hashedPassword,
      });
      expect(signMock).toHaveBeenCalledWith({
        userId: user.id,
        email: user.email,
      });
      expect(result).toEqual({
        userId: user.id,
        accessToken: expectedToken,
      });
    });

    it('должен выбросить AuthEmailExistError когда пользователь с email уже существует', async () => {
      /**
       * Arrange
       */
      jest
        .spyOn(userService, 'findUserByEmail')
        .mockResolvedValue(Seeds.User());

      /**
       * Act
       */
      const registerMock = async () =>
        authService.register({
          email: Faker.String(),
          firstName: Faker.String(),
          lastName: Faker.String(),
          password: Faker.String(),
        });

      /**
       * Assert
       */
      await expect(registerMock).rejects.toThrow(AuthEmailExistError);
    });
  });

  describe('login', () => {
    it('должен успешно аутентифицировать пользователя', async () => {
      /**
       * Arrang
       */
      const email = Faker.String();
      const password = Faker.String();
      const token = Faker.String();

      const user = Seeds.User({
        email,
      });

      const findUserByEmailMock = jest
        .spyOn(userService, 'findUserByEmail')
        .mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const signMock = jest
        .spyOn(jwtService, 'sign')
        .mockResolvedValue(token as never);

      /**
       * Act
       */
      const result = await authService.login({
        email,
        password,
      });

      /**
       * Assert
       */
      expect(findUserByEmailMock).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(signMock).toHaveBeenCalledWith({
        userId: user.id,
        email: user.email,
      });
      expect(result).toEqual({
        userId: user.id,
        accessToken: token,
      });
    });

    it('должен вернуть ошибку, если пользователь ввел неверный пароль', async () => {
      /**
       * Arrang
       */
      const email = Faker.String();
      const password = Faker.String();

      const user = Seeds.User({
        email,
      });

      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      /**
       * Act
       */
      const loginMock = async () =>
        authService.login({
          email,
          password,
        });

      /**
       * Assert
       */
      await expect(loginMock).rejects.toThrow(UnauthorizedError);
    });
  });
});

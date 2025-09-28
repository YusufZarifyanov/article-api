import { Test, type TestingModule } from '@nestjs/testing';

import { UserRepository } from '@app/modules/user/user.respository';
import { UserService } from '@app/modules/user/user.service';
import { Seeds } from '../common/seeds';
import { Faker } from '../common/faker';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserByEmail', () => {
    it('должен вернуть пользователя', async () => {
      /**
       * Arrange
       */
      const email = Faker.String();
      const user = Seeds.User();
      const findByEmailMock = jest
        .spyOn(userRepository, 'findByEmail')
        .mockResolvedValue(user);

      /**
       * Act
       */
      const result = await userService.findUserByEmail(email);

      /**
       * Assert
       */
      expect(findByEmailMock).toHaveBeenCalledWith(email);
      expect(findByEmailMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(user);
    });
  });

  describe('createUser', () => {
    it('должен успешно создать пользователя', async () => {
      /**
       * Arrange
       */
      const email = Faker.String();
      const firstName = Faker.String();
      const lastName = Faker.String();
      const password = Faker.String();
      const user = Seeds.User();

      const createMock = jest
        .spyOn(userRepository, 'create')
        .mockResolvedValue(user);

      const createMockParams = {
        email,
        firstName,
        lastName,
        password,
      };

      /**
       * Act
       */
      const result = await userService.createUser(createMockParams);

      /**
       * Assert
       */
      expect(createMock).toHaveBeenCalledWith(createMockParams);
      expect(createMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(user);
    });
  });
});

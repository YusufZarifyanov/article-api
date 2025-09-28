import { Injectable } from '@nestjs/common';

import { UserRepository } from './user.respository';

import type {
  CreateUserParams,
  CreateUserReturns,
  FindUserByEmailReturns,
  GetUserByIdReturns,
} from './interfaces/services';
import type { Id } from '@app/common/type-alias';

import { UserNotFoundError } from './errors';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Находит пользователя по почте.
   *
   * @param email почта пользователя.
   * @returns User | null.
   */
  async findUserByEmail(email: string): Promise<FindUserByEmailReturns> {
    return this.userRepository.findByEmail(email);
  }

  /**
   * Находит пользователя по идентификатору.
   *
   * @param id идентификатор пользователя.
   * @returns User.
   * @throws {UserNotFoundError} пользователь не найден.
   */
  async getUserById(id: Id): Promise<GetUserByIdReturns> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundError(id);
    }

    return user;
  }

  /**
   * Создает пользователя. Процесс создания пользователя происходит
   * только в момент регистрации.
   *
   * @param params параметры создания пользователя.
   * @returns созданный пользователь.
   */
  async createUser(params: CreateUserParams): Promise<CreateUserReturns> {
    return this.userRepository.create(params);
  }
}

import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

import type {
  LoginParams,
  LoginReturns,
  RegisterParams,
  RegisterReturns,
} from './interfaces/services';
import type { TokenPayloadInterface } from './interfaces/shared';
import type { Id } from '@app/common/type-alias';

import { AuthEmailExistError, UnauthorizedError } from './errors';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Регистрирует пользователя в системе. Создает пользователя,
   * сохраняя хэш пароля при записи в бд.
   *
   * @param params параметры создания пользователя.
   * @returns      идентификатор нового пользователя, токен.
   * @throws {AuthEmailExistError} пользователь с таким email существует.
   */
  async register(params: RegisterParams): Promise<RegisterReturns> {
    const { email, password } = params;

    const user = await this.userService.findUserByEmail(email);
    if (user) {
      throw new AuthEmailExistError(email);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await this.userService.createUser({
      ...params,
      password: hashedPassword,
    });

    const accessToken = await this.generateToken(createdUser.id, email);

    return {
      userId: createdUser.id,
      accessToken,
    };
  }

  /**
   * Проводит процесс аутентификации.
   *
   * @param params.email    почта пользователя.
   * @param params.password пароль
   * @returns               идентификатор пользователя, токен.
   * @throws {UnauthorizedError} пользователь не найден.
   * @throws {UnauthorizedError} пароль неверный.
   */
  async login(params: LoginParams): Promise<LoginReturns> {
    const { email, password } = params;

    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedError();
    }

    const isPasswordCompare = await bcrypt.compare(password, user.password);
    if (!isPasswordCompare) {
      throw new UnauthorizedError();
    }

    const accessToken = await this.generateToken(user.id, email);

    return {
      accessToken,
      userId: user.id,
    };
  }

  /**
   * Генерирует токен доступа для процессов авторизации и аутентификации.
   *
   * @param userId идентификатор пользователя.
   * @param email почта пользователя.
   * @returns токен.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  private async generateToken(userId: Id, email: string): Promise<string> {
    const payload: TokenPayloadInterface = {
      userId,
      email,
    };

    return this.jwtService.sign(payload);
  }
}

import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

/**
 * Декоратор работает только вместе с AuthGuard.
 *
 * Достает из payload токена запроса идентификатор пользователя.
 */
export const GetUserId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    return +request.headers['x-user-id'];
  },
);

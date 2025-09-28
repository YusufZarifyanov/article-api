import type { Id } from '@app/common/type-alias';
import type { ILoginResponse } from '@types';

export class LoginResponseDto implements ILoginResponse {
  userId: Id;

  accessToken: string;

  constructor(userId: Id, token: string) {
    this.accessToken = token;
    this.userId = userId;
  }
}

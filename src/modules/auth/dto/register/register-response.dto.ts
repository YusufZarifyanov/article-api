import type { Id } from '@app/common/type-alias';
import type { IRegisterResponse } from '@types';

export class RegisterResponseDto implements IRegisterResponse {
  userId: Id;

  accessToken: string;

  constructor(userId: Id, token: string) {
    this.userId = userId;
    this.accessToken = token;
  }
}

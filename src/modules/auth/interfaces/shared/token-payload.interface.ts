import type { Id } from '@app/common/type-alias';

export interface TokenPayloadInterface {
  userId: Id;
  email: string;
}

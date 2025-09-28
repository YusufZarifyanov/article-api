import { type User } from '@app/entities/user.entity';

export type CreateUserParams = Omit<
  User,
  'id' | 'createdAt' | 'updatedAt' | 'articles'
>;

export type CreateUserReturns = User;

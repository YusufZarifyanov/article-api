import { Faker } from '../faker';
import { valueOr } from '../utils';

type Nullable<T> = { [P in keyof T]: T[P] | null };

export type UserInterface = {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  createdAt: Date;
  updatedAt: Date;
  articles: ArticleInterface[];
};
export function User(a?: Partial<Nullable<UserInterface>>): UserInterface {
  return {
    id: valueOr(a?.id, Faker.Number()),
    email: valueOr(a?.email, Faker.Email()),
    password: valueOr(a?.password, Faker.String()),
    firstName: valueOr(a?.firstName, Faker.String()),
    lastName: valueOr(a?.lastName, Faker.String()),
    middleName: valueOr(a?.middleName, Faker.String()),
    createdAt: valueOr(a?.createdAt, Faker.FutureDate()),
    updatedAt: valueOr(a?.updatedAt, Faker.FutureDate()),
    articles: valueOr(a?.articles, []),
  };
}

export type ArticleInterface = {
  id: number;
  title: string;
  description: string;
  publicationDate: Date;
  author: UserInterface;
  authorId: number;
  updatedAt: Date;
};
export function Article(
  a?: Partial<Nullable<ArticleInterface>>,
): ArticleInterface {
  return {
    id: valueOr(a?.id, Faker.Number()),
    title: valueOr(a?.title, Faker.String()),
    description: valueOr(a?.description, Faker.String()),
    authorId: valueOr(a?.authorId, Faker.Number()),
    publicationDate: valueOr(a?.publicationDate, Faker.FutureDate()),
    updatedAt: valueOr(a?.updatedAt, Faker.FutureDate()),
    author: valueOr(a?.author, null),
  };
}

export const Seeds = {
  User,
  Article,
};

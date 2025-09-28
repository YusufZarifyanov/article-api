import { randomBytes, randomUUID, randomInt } from 'node:crypto';

type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | JSONValue[];

/**
 *
 * @param   [len]
 * @returns
 */
export const RandomString = (len = 15): string =>
  randomBytes(len).toString('hex');

/**
 *
 * @param   [len]
 * @returns
 */
export const RandomEmail = (len = 15): string =>
  randomBytes(len).toString('hex') + '@yandex.ru';

/**
 *
 * @param   [max] 2147483647
 * @param   [min] 1
 * @returns
 */
export const RandomNumber = (max = 2147483647, min = 1): number =>
  randomInt(min, max);

/**
 *
 * @param   noCache
 * @returns
 */
export const RandomUuid = (noCache = false): string =>
  randomUUID({ disableEntropyCache: noCache });

/**
 *
 * @returns
 */
export const RandomBool = (): boolean => Math.random() > 0.5;

/**
 *
 * @returns
 */
export const NowUnixTime = (): number =>
  new Date().setUTCHours(0, 0, 0, 0) / 1000;

/**
 * Generates random number in range 86400 - 31536000 that represents a days of year in unix format.
 *
 * @param maxOffset
 */
export const RandomDaysOffset = (maxOffset: number = 365): number =>
  RandomNumber(maxOffset, 1) * 86400;

/**
 * Generated a random date in future.
 * Using `randomDaysOffset` function for randomization.
 *
 * @param   maxDaysOffset
 * @returns
 */
export const RandomFutureUnixDate = (maxDaysOffset?: number): number =>
  RandomNumber(NowUnixTime() + RandomDaysOffset(maxDaysOffset), NowUnixTime());

export const RandomFutureDate = (maxDaysOffset?: number): Date =>
  new Date(RandomFutureUnixDate(maxDaysOffset) * 1000);

/**
 * Generated a random date in past.
 * Using `randomDaysOffset` function for randomization.
 *
 * @param   maxDaysOffset
 * @returns
 */
export const RandomPastUnixDate = (maxDaysOffset?: number): number =>
  RandomNumber(NowUnixTime(), NowUnixTime() - RandomDaysOffset(maxDaysOffset));

export const RandomPastDate = (maxDaysOffset?: number): Date =>
  new Date(RandomPastUnixDate(maxDaysOffset) * 1000);

/**
 * Generated a random unix date in future or past.
 * Using `randomDaysOffset` & `randomBool` functions for randomization.
 *
 * @returns
 */
export const RandomUnixDate = (): number =>
  RandomBool() ? RandomFutureUnixDate() : RandomPastUnixDate();

/**
 * Generated a random date in future or past.
 * Using `randomDaysOffset` & `randomBool` functions for randomization.
 *
 * @returns
 */
export const RandomDate = (): Date => new Date(RandomUnixDate() * 1000);

type EnumModel = { [s: string]: string | number };
const keysOf = (e: Record<string, unknown>): Array<string> =>
  Object.keys(e).filter((n) => !Number(n));

/**
 * Random value from enum object.
 *
 * @param   e enum
 * @returns
 */
export const RandomEnum = <T>(e: EnumModel): T =>
  e[keysOf(e)[RandomNumber(keysOf(e).length - 1 || 1, 0)] ?? 0] as unknown as T;

/**
 * Random value from an array.
 *
 * @param   a array
 * @returns
 */
export const RandomItem = <T>(a: Array<T>): T =>
  a.at(RandomNumber(a.length - 1, 0)) as T;

/**
 * Random JSON object.
 *
 * @param   keysCount the number of keys in the generated object.
 * @returns
 */
export const RandomJson = (keysCount: number): JSONValue =>
  Array(keysCount)
    .fill(null)
    .reduce((j) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      j[RandomString(5)] = RandomString(5);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return j;
    }, {}) as JSONValue;

/**
 * Enum to randomly shuffled array.
 *
 * @param   e enum to be shuffled.
 * @returns   shuffled enum as array.
 */
export const ShuffleEnum = <Enum, Keys extends string>(e: {
  [key in Keys]: Enum;
}): Array<Enum> =>
  Object.values(e).sort(() => 0.5 - Math.random()) as Array<Enum>;

export const Faker = {
  String: RandomString,
  Email: RandomEmail,
  Number: RandomNumber,
  Uuid: RandomUuid,
  AnyDate: RandomDate,
  FutureDate: RandomFutureDate,
  PastDate: RandomPastDate,
  Enum: RandomEnum,
  ShuffleEnum: ShuffleEnum,
  Bool: RandomBool,
  Item: RandomItem,
  Json: RandomJson,
};

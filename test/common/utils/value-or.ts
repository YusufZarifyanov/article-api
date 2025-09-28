/**
 * Возвращает `value` если оно не `undefined` или `fallbackValue`.
 *
 * Если `value === null` то будет возвращено `null`.
 *
 * @param   value         значение которое будет возвращено если оно не `undefined`.
 * @param   fallbackValue значение которое будет возвращено если `value === undefined`.
 * @returns               значение или альтернативное значение.
 */
export function valueOr<V, F>(value: V, fallbackValue: F): NonNullable<V | F> {
  return (value !== undefined ? value : fallbackValue) as NonNullable<V | F>;
}

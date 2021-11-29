import type { Unpacked } from '../types';

/** Returns a new object with the specified properties */
export function extract<T, K extends (keyof T)[]>(
  obj: T,
  properties: K
): Pick<T, Unpacked<K>> {
  const newObj = {} as T;
  for (const prop of properties) {
    newObj[prop] = obj[prop];
  }
  return newObj;
}

/** Returns a new object without the specified properties */
export function exclude<T, K extends (keyof T)[]>(
  obj: T,
  properties: K
): Omit<T, Unpacked<K>> {
  const newObj = {} as T;
  for (const key of Object.keys(obj) as (keyof T)[]) {
    if (!properties.includes(key)) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}

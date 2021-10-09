import type { MaybePromise } from '../types';
import { deferred, Deferred } from './deferred';

export type PendingRecord<E extends Record<string, [data: any, err: any]>> = {
  [K in keyof E]: Deferred<E[K][1], E[K][2]>;
};

export class PendingList<E extends Record<string, [data: any, err: any]>> {
  private readonly entries: { [K in keyof E]?: Deferred<E[K][1], E[K][2]> } = {};

  get = <K extends keyof E>(key: K): Deferred<E[K][1], E[K][2]> => {
    const entry = this.entries[key];

    if (entry) {
      return entry;
    }

    const def = deferred();
    this.entries[key] = def;
    return def;
  };

  /**
   * Skip the deferred by deleting it. Therefore, all new calls to that keys onwards will be
   * operated with a new deferred.
   */
  skip = (...keys: (keyof E)[]): this => {
    for (const key of keys) {
      delete this.entries[key];
    }
    return this;
  };

  resolve = <K extends keyof E>(key: K, value: MaybePromise<E[K][1]>): void => {
    return this.get(key).resolve(value);
  };

  reject = <K extends keyof E>(key: K, err: E[K][2]): void => {
    return this.get(key).reject(err);
  };
}

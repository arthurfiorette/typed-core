import { deferred, Deferred } from 'fast-defer';
import type { MaybePromise } from '../types';

/** A simple HashMap-like class that maps keys to unresolved promises. */
export class PendingList<E extends Record<string, unknown>> {
  private readonly entries: { [K in keyof E]?: Deferred<E[K]> } = {};

  public readonly get = <K extends keyof E>(key: K): Deferred<E[K]> => {
    return this.entries[key] || (this.entries[key] = deferred());
  };

  /**
   * Renew the deferred by deleting it. Therefore, all new calls to that keys onwards will
   * be operated with a new (yet unresolved) deferred.
   *
   * @param keys Any key that will be renewed
   * @returns This pending list to method chaining
   */
  public readonly renew = (...keys: (keyof E)[]): this => {
    for (const key of keys) delete this.entries[key];
    return this;
  };

  /**
   * Resolves the deferred promise with the provided value. This will chaining all codes
   * waiting for.
   *
   * @param key The key of the deferred
   * @param value The value to resolve the deferred
   * @returns This pending list to method chaining
   */
  public readonly resolve = <K extends keyof E>(
    key: K,
    value: MaybePromise<E[K]>
  ): this => {
    this.get(key).resolve(value);
    return this;
  };

  /**
   * Rejects the deferred promise with the provided value. This will chaining all codes waiting for.
   *
   * To avoid an unhandled promise rejection warning, make sure that at least one catch
   * handler is registered to that deferred.
   *
   * @param {string} key The key of the deferred
   * @param err The value to reject the deferred
   * @returns This pending list to method chaining
   */
  public readonly reject = <K extends keyof E>(key: K, err: E[K]): this => {
    this.get(key).reject(err);
    return this;
  };
}

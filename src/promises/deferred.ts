import type { MaybePromise } from '../types';

export type ResolveDeferred<T = any> = (value: MaybePromise<T>) => void;
export type RejectDeferred<E = any> = (reason: E) => void;

export interface Deferred<T = any, E = any> extends Promise<T> {
  resolve: ResolveDeferred<T>;
  reject: RejectDeferred<E>;
}

/**
 * Returns a promise that can be resolved or reject later
 *
 * @returns The deferred promise
 */
export function deferred<T = any, E = any>(): Deferred<T, E> {
  let resolve: ResolveDeferred<T> = () => undefined;
  let reject: RejectDeferred<E> = () => undefined;

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  }) as Deferred<T, E>;

  promise.resolve = (...args) => resolve(...args);
  promise.reject = (...args) => reject(...args);

  return promise;
}

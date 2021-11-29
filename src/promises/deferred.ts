import type { MaybePromise } from '../types';

export type ResolveDeferred<T = any> = Deferred<T, any>['resolve'];
export type RejectDeferred<E = any> = Deferred<any, E>['reject'];

/** A simple promise object that can be resolved (or rejected) later */
export interface Deferred<T = any, E = any> extends Promise<T> {
  resolve: (value: MaybePromise<T>) => void;
  reject: (reason: E) => void;
}

/**
 * Returns a promise that can be resolved or reject later
 *
 * @returns The deferred promise
 */
export function deferred<T = any, E = any>(): Deferred<T, E> {
  let resolve!: ResolveDeferred<T>;
  let reject!: RejectDeferred<E>;

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  }) as Deferred<T, E>;

  promise.resolve = resolve;
  promise.reject = reject;

  return promise;
}

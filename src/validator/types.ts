import { MaybePromise } from '../types';

export type FieldError = { field: string; message: string };

export type Verifier<V> = {
  predicate: (v: V) => MaybePromise<boolean>;
  failMessage: string;
};

export type VerifierRecord<T> = {
  [K in keyof T]?: Verifier<T[K]>[];
};

export type ValidationFunction<T> = (
  parser: ValidationMethods<T>
) => MaybePromise<void>;

export type ValidationMethods<T> = {
  parse: <K extends keyof T>(
    key: K,
    predicate: (v: T[K]) => MaybePromise<boolean>,
    failMessage: string
  ) => void;
  validate: <K extends keyof T>(
    key: K,
    predicate: ValidationFunction<T[K]>
  ) => void;
};

export type ValidationRecord<T> = {
  [K in keyof T]?: ValidationFunction<T[K]>[];
};

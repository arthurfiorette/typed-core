/** Represents an operation that accepts a single input argument and returns no result. */
export type Consumer<A = any> = (a: A) => void;

/** Represents an operation that accepts two input arguments and returns no result. */
export type BiConsumer<A = any, B = any> = (a: A, b: B) => void;

/** Represents a predicate (boolean-valued function) of one argument. */
export type Predicate<A = any> = (a: A) => boolean;

/** Represents a predicate (boolean-valued function) of two arguments. */
export type BiPredicate<A = any, B = any> = (a: A, b: B) => boolean;

/**
 * Represents an operation on a single operand that produces a result of the same type as
 * its operand.
 */
export type Operator<A = any> = (a: A) => A;

/** Represents a supplier of results. */
export type Supplier<A = any> = () => A;

/** Represents a function that accepts one argument and produces a result. */
export type Function<A = any, B = any> = (a: A) => B;

/** Represents a function that accepts two arguments and produces a result. */
export type BiFunction<A = any, B = any, C = any> = (a: A, b: B) => C;

/** Represents a function that receive and returns nothing. */
export type Runnable = () => void;

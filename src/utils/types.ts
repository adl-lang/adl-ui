/**
 * Typescript pattern to ensure exhaustive checks in switch/unions.
 *
 * See https://www.typescriptlang.org/docs/handbook/advanced-types.html
 */
export function assertNever(x: never, msg?: string): never {
  // tslint:disable-next-line:no-console
  // console.log((msg || "unexpected object:"), x);
  throw new Error(`${msg || "unexpected object:"} ${x}`);
}

/**
 * Throws an exception if the provided value is undefined. Otherwise, returns
 * the value
 */
export function assertNotUndefined<T>(x: T | undefined, msg?: string): T {
  if (x === undefined) {
    throw new Error(`${msg || "value is undefined"}`);
  }

  return x;
}


/**
 * Utility for Javascript only APIs
 */

export const stringify = JSON.stringify;

/** Return a function that outputs a chained function call for a given property name */
export function chain<T>(prop: string, getArgs: (value: any) => string = stringify) {
  return (value: T) => {
    if (value !== undefined) {
      return `.${prop}(${getArgs(value)})`;
    }
    return undefined;
  };
}

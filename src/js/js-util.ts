import {APIFromProp} from '../apifrom';

/**
 * Utility for Javascript only APIs
 */

export const stringify = JSON.stringify;

/** Return a function that outputs a chained function call for a given property name */
export function chain<T extends object, P extends keyof T>(
  prop: string,
  getArgs: APIFromProp<T, P> = v => stringify(v)
) {
  return (value: T[P], spec: T) => {
    if (value !== undefined) {
      return `.${prop}(${getArgs(value, spec)})`;
    }
    return undefined;
  };
}

import {APIFromProp} from '../apifrom';

/**
 * Utility for Javascript only APIs
 */

export const stringify = JSON.stringify;

/** Return a function that outputs a chained function call for a given property name */
export function chain<T extends object, P extends keyof T, O = undefined>(
  prop: string,
  getArgs: APIFromProp<T, P, O> = v => stringify(v)
) {
  return (value: T[P], opt: O) => {
    if (value !== undefined) {
      return `.${prop}(${getArgs(value, opt)})`;
    }
    return undefined;
  };
}

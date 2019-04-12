import {array, isArray} from 'vega-util';
import {APIFromProp} from '../apifrom';
import {FunctionCall, Statement} from '../statement';

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
      const args = array(getArgs(value, opt));
      return new FunctionCall(`.${prop}`, args);
    }
    return undefined;
  };
}

export function flattenArray<T extends object, P extends keyof T, O = undefined>(
  getArgs: (v: any, opt?: O) => Statement = v => stringify(v)
): APIFromProp<T, P, O> {
  return (value: T[P] & any[], opt?: O) => {
    if (isArray(value)) {
      return value.map(v => getArgs(v, opt));
    }
    return getArgs(value, opt);
  };
}

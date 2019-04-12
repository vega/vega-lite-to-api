import {array} from 'vega-util';
import {APIFromProp} from '../apifrom';
import {FunctionCall} from '../statement';

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

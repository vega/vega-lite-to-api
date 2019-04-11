import {isArray} from 'util';
import {Statement} from './statement';

/** Helper method for a transpirer that implements APIFromWithAllKeys to generate basic method chaining for given `props` */
export function transpileProps<T extends object, O = undefined>(
  transpiler: APIFromWithAllKeys<T, O>,
  x: T,
  props: (keyof T)[],
  opt?: O
) {
  const out: Statement[] = [];
  for (const prop of props) {
    const statement = transpileProp(transpiler, x, prop, opt);
    if (statement) {
      if (isArray(statement)) {
        out.push(...statement);
      } else {
        out.push(statement);
      }
    }
  }
  return out;
}

function transpileProp<T extends object, P extends keyof T, O = undefined>(
  transpiler: APIFromAllKeys<T, O>,
  x: T,
  prop: P,
  opt: O
) {
  return transpiler[prop](x[prop], opt);
}

/**
 * Type for a function that returns a statement from a given property P of Vega-Lite interface T
 */
export type APIFromProp<T extends object, P extends keyof T, O> = (x: T[P], opt?: O) => Statement | Statement[];

/**
 * Base interface for a transpiler class of a particular Vega-Lite interface T
 * such that the transpiler class would include methods for all properties of T
 */
export type APIFromWithAllKeys<T extends object, O = undefined> = APIFrom<T> & APIFromAllKeys<T, O>;

type APIFromAllKeys<T extends object, O> = Required<{[k in keyof T]: APIFromProp<T, k, O>}>;

/**
 * Base interface for a transpiler class of a particular Vega-Lite interface T
 */
export interface APIFrom<T extends object> {
  transpile(x: T): Statement | Statement[];
}

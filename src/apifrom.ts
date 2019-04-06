import {isArray} from 'util';
import {Statement} from './statement';

/** Helper method for a transpirer that implements APIFromWithAllKeys to generate basic method chaining for given `props` */
export function transpileProps<T extends object>(transpiler: APIFromWithAllKeys<T>, x: T, props: (keyof T)[]) {
  const out = [];
  for (const prop of props) {
    const statement = transpileProp(transpiler, x, prop);
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

function transpileProp<T extends object, P extends keyof T>(transpiler: APIFromAllKeys<T>, x: T, prop: P) {
  return transpiler[prop](x[prop], x);
}

/**
 * Type for a function that returns a statement from a given property P of Vega-Lite interface T
 */
export type APIFromProp<T extends object, P extends keyof T> = (x: T[P], t: T) => Statement | Statement[];

/**
 * Base interface for a transpiler class of a particular Vega-Lite interface T
 * such that the transpiler class would include methods for all properties of T
 */
export type APIFromWithAllKeys<T extends object> = APIFrom<T> & APIFromAllKeys<T>;

export type APIFromAllKeys<T extends object> = Required<{[k in keyof T]: APIFromProp<T, k>}>;

/**
 * Base interface for a transpiler class of a particular Vega-Lite interface T
 */
export interface APIFrom<T extends object> {
  transpile(x: T): Statement | Statement[];
}

import {FacetedCompositeEncoding} from 'vega-lite/build/src/compositemark';
import {toCode} from '../statement';
import {EncodingToJS} from './encoding';

describe('JS Encoding', () => {
  const transpiler = new EncodingToJS();
  it('compiles basic encoding', () => {
    const encoding: FacetedCompositeEncoding = {
      x: {field: 'a', type: 'ordinal'},
      y: {field: 'b', type: 'quantitative'}
    };

    expect(transpiler.transpile(encoding).map(e => toCode(e, 0))).toEqual([`vl.x().fieldO("a")`, `vl.y().fieldQ("b")`]);
  });
});

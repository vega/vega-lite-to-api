import {FacetedCompositeEncoding} from 'vega-lite/build/src/compositemark';
import {toCode} from '../statement';
import {EncodingToJS} from './encoding';

describe('JS Encoding', () => {
  const transpiler = new EncodingToJS();
  it('compiles basic encoding', () => {
    const encoding: FacetedCompositeEncoding = {
      x: {field: 'a', type: 'ordinal', title: 'ttt', sort: 'descending'},
      y: {field: 'b', type: 'quantitative', scale: {zero: false}, axis: {labels: false}},
      color: {field: 'c', type: 'ordinal'}
    };

    expect(transpiler.transpile(encoding).map(e => toCode(e, 0))).toEqual([
      `vl.x().fieldO("a").title("ttt").sort("descending")`,
      `vl.y().fieldQ("b").scale({"zero":false}).axis({"labels":false})`,
      `vl.color().fieldO("c")`
    ]);
  });
});

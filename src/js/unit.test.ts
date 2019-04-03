import {UnitSpec} from 'vega-lite/build/src/spec';
import {NEWLINE, toCode} from '../statement';
import {UnitSpecToJS} from './unit';

describe('JS Unit', () => {
  const unitToJS = new UnitSpecToJS();
  it('compiles basic bar example', () => {
    const bar: UnitSpec = {
      // "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
      name: 'ABC',
      description: 'A simple bar chart with embedded data.',
      title: 'DEF',
      data: {
        values: [{a: 'A', b: 28}]
      },
      mark: 'bar',
      encoding: {
        x: {field: 'a', type: 'ordinal'},
        y: {field: 'b', type: 'quantitative'}
      }
    };

    // prettier-ignore
    expect(toCode(unitToJS.transpile(bar))).toEqual(
      `vl.markBar()` + NEWLINE +
      `  .name("ABC")` + NEWLINE +
      `  .description("A simple bar chart with embedded data.")` + NEWLINE +
      `  .title("DEF")` + NEWLINE +
      `  .data([{"a":"A","b":28}])` + NEWLINE +
      `  .encode(` + NEWLINE +
      `    vl.x().fieldO("a")` + NEWLINE +
      `    vl.y().fieldQ("b")` + NEWLINE +
      `  )`
    )
  });
});

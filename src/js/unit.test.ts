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
      `  .encode(vl.x().fieldO("a"), vl.y().fieldQ("b"))`
    )
  });

  it('compiles basic bar with timeUnit transform example', () => {
    const bar: UnitSpec = {
      // "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
      data: {
        values: [{a: 'A', b: 28}]
      },
      transform: [{timeUnit: 'year', field: 'date', as: 'year'}],
      mark: 'point'
    };

    // prettier-ignore
    expect(toCode(unitToJS.transpile(bar))).toEqual(
      `vl.markPoint()` +
      `.data([{"a":"A","b":28}])` +
      `.transform(vl.year("date").as("year"))`
    )
  });

  it('compiles basic aggregeted bar example', () => {
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
        y: {aggregate: 'mean', field: 'b', type: 'quantitative'}
      }
    };

    // prettier-ignore
    expect(toCode(unitToJS.transpile(bar))).toEqual(
      `vl.markBar()` + NEWLINE +
      `  .name("ABC")` + NEWLINE +
      `  .description("A simple bar chart with embedded data.")` + NEWLINE +
      `  .title("DEF")` + NEWLINE +
      `  .data([{"a":"A","b":28}])` + NEWLINE +
      `  .encode(vl.x().fieldO("a"), vl.y().mean("b"))`
    )
  });
});

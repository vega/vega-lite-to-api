import {toCode} from '../statement';
import {TransformToJS} from './transform';
describe('JS Transform', () => {
  const transformToJS = new TransformToJS();

  describe('Aggregate', () => {
    it('outputs correct JS API', () => {
      expect(
        toCode(
          transformToJS.transpile({
            aggregate: [{op: 'mean', field: 'a', as: 'b'}, {op: 'mean', field: 'e', as: 'f'}],
            groupby: ['c', 'd']
          })
        )
      ).toBe('vl.groupby("c","d").aggregate(vl.mean("a").as("b"), vl.mean("e").as("f"))');
    });
  });

  describe('Calculate', () => {
    it('outputs correct JS API', () => {
      expect(
        toCode(
          transformToJS.transpile({
            calculate: 'datum.b',
            as: 'b2'
          })
        )
      ).toBe('vl.calculate("datum.b").as("b2")');
    });
  });

  describe('TimeUnit', () => {
    it('outputs correct JS API', () => {
      expect(
        toCode(
          transformToJS.transpile({
            timeUnit: 'month',
            field: 'a',
            as: 'b'
          })
        )
      ).toBe('vl.month("a").as("b")');
    });
  });
});

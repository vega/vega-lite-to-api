import {toCode} from '../statement';
import {TransformToJS} from './transform';
describe('JS Transform', () => {
  const transformToJS = new TransformToJS();

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

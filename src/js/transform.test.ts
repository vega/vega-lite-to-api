import {NEWLINE, toCode} from '../statement';
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

  describe('Filter', () => {
    it('outputs correct JS API for filter expression', () => {
      expect(
        toCode(
          transformToJS.transpile({
            filter: 'datum.x'
          })
        )
      ).toBe('vl.filter("datum.x")');
    });

    it('outputs correct JS API for field predicate filter', () => {
      expect(
        toCode(
          transformToJS.transpile({
            filter: {field: 'a', equal: 5}
          })
        )
      ).toBe('vl.filter({"field":"a","equal":5})');
    });

    it('outputs correct JS API for logical operand', () => {
      expect(
        toCode(
          transformToJS.transpile({
            filter: {
              or: [{and: ['datum.a', 'datum.b']}, {not: 'datum.c'}]
            }
          })
        )
      ).toBe('vl.filter(vl.or(vl.and("datum.a", "datum.b"), vl.not("datum.c")))');
    });

    it('outputs correct JS API for selection', () => {
      expect(
        toCode(
          transformToJS.transpile({
            filter: {
              selection: 'brush'
            }
          })
        )
      ).toBe('vl.filter(brush)');
    });
  });

  describe('Flatten', () => {
    it('outputs correct JS API', () => {
      expect(
        toCode(
          transformToJS.transpile({
            flatten: ['a', 'b'],
            as: ['aa', 'bb']
          })
        )
      ).toBe('vl.flatten("a", "b").as("aa", "bb")');
    });
  });

  describe('Fold', () => {
    it('outputs correct JS API', () => {
      expect(
        toCode(
          transformToJS.transpile({
            fold: ['a', 'b'],
            as: ['aa', 'bb']
          })
        )
      ).toBe('vl.fold("a", "b").as("aa", "bb")');

      expect(
        toCode(
          transformToJS.transpile({
            fold: ['a', 'b']
          })
        )
      ).toBe('vl.fold("a", "b")');
    });
  });

  describe('Joinaggregate', () => {
    it('outputs correct JS API', () => {
      expect(
        toCode(
          transformToJS.transpile({
            joinaggregate: [{op: 'mean', field: 'a', as: 'b'}, {op: 'mean', field: 'e', as: 'f'}],
            groupby: ['c', 'd']
          })
        )
      ).toBe('vl.groupby("c","d").joinaggregate(vl.mean("a").as("b"), vl.mean("e").as("f"))');
    });
  });

  describe('Sample', () => {
    it('outputs correct JS API', () => {
      expect(
        toCode(
          transformToJS.transpile({
            sample: 1000
          })
        )
      ).toBe('vl.sample(1000)');
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

  describe('Window', () => {
    it('outputs correct JS API', () => {
      expect(
        toCode(
          transformToJS.transpile({
            window: [{op: 'mean', field: 'a', as: 'b'}, {op: 'mean', field: 'e', as: 'f'}],
            groupby: ['c', 'd'],
            frame: [0, 3]
          })
        )
      ).toBe(
        // prettier-ignore
        'vl.groupby("c","d")' + NEWLINE +
          '  .window(vl.mean("a").as("b"), vl.mean("e").as("f"))' + NEWLINE +
          '  .frame([0,3])'
      );
    });
  });
});

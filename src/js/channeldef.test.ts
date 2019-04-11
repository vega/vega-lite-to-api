import {TypedFieldDef} from 'vega-lite/build/src/channeldef';
import {TIMEUNIT_PARTS, UtcMultiTimeUnit, UtcSingleTimeUnit} from 'vega-lite/build/src/timeunit';
import {keys} from 'vega-lite/build/src/util';
import {FieldDefBaseToJS} from './channeldef';
import {MULTI_TIMEUNIT_SHORTHAND} from './timeUnit';

describe('JS ChannelDef', () => {
  describe('FieldDefBase', () => {
    const fieldDefBase = new FieldDefBaseToJS();

    it('compiles count correctly', () => {
      const fieldDef: TypedFieldDef<string> = {aggregate: 'count', type: 'quantitative'};
      expect(fieldDefBase.transpile(fieldDef)).toEqual(['.count()']);
    });

    it('compiles median:ordinal correctly', () => {
      const fieldDef: TypedFieldDef<string> = {aggregate: 'median', field: 'f', type: 'ordinal'};
      expect(fieldDefBase.transpile(fieldDef)).toEqual(['.median("f")', '.type("ordinal")']);
    });

    it('compiles argmax correctly', () => {
      const fieldDef: TypedFieldDef<string> = {aggregate: {argmax: 'a'}, field: 'b', type: 'quantitative'};
      expect(fieldDefBase.transpile(fieldDef)).toEqual(['.argmax("a")', '.fieldQ("b")']);
    });

    it('compiles argmin correctly', () => {
      const fieldDef: TypedFieldDef<string> = {aggregate: {argmin: 'a'}, field: 'b', type: 'quantitative'};
      expect(fieldDefBase.transpile(fieldDef)).toEqual(['.argmin("a")', '.fieldQ("b")']);
    });

    it('compiles bin correctly', () => {
      const fieldDef: TypedFieldDef<string> = {bin: {extent: [0, 1], maxbins: 20}, field: 'b', type: 'quantitative'};
      expect(fieldDefBase.transpile(fieldDef)).toEqual(['.fieldQ("b")', '.bin({"extent":[0,1],"maxbins":20})']);
    });

    it('compiles singleTimeUnit and its UTC counterpart correctly', () => {
      for (const timeUnit of TIMEUNIT_PARTS) {
        const fieldDef: TypedFieldDef<string> = {timeUnit, field: 'b', type: 'temporal'};
        expect(fieldDefBase.transpile(fieldDef)).toEqual([`.${timeUnit}("b")`]);

        const utcFieldDef: TypedFieldDef<string> = {
          timeUnit: ('utc' + timeUnit) as UtcSingleTimeUnit,
          field: 'b',
          type: 'temporal'
        };

        expect(fieldDefBase.transpile(utcFieldDef)).toEqual([`.utc${timeUnit}("b")`]);
      }
    });

    it('compiles singleTimeUnit: ordinal correctly', () => {
      for (const timeUnit of TIMEUNIT_PARTS) {
        const fieldDef: TypedFieldDef<string> = {timeUnit, field: 'b', type: 'ordinal'};
        expect(fieldDefBase.transpile(fieldDef)).toEqual([`.${timeUnit}("b")`, '.type("ordinal")']);
      }
    });

    it('compiles multiTimeUnit correctly', () => {
      for (const timeUnit of keys(MULTI_TIMEUNIT_SHORTHAND)) {
        const fieldDef: TypedFieldDef<string> = {timeUnit, field: 'b', type: 'temporal'};
        expect(fieldDefBase.transpile(fieldDef)).toEqual([`.time${MULTI_TIMEUNIT_SHORTHAND[timeUnit]}("b")`]);

        const utcFieldDef: TypedFieldDef<string> = {
          timeUnit: ('utc' + timeUnit) as UtcMultiTimeUnit,
          field: 'b',
          type: 'temporal'
        };

        expect(fieldDefBase.transpile(utcFieldDef)).toEqual([`.utc${MULTI_TIMEUNIT_SHORTHAND[timeUnit]}("b")`]);
      }
    });
  });
});

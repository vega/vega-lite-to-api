import {TypedFieldDef} from 'vega-lite/build/src/channeldef';
import {FieldDefBaseToJS} from './channeldef';

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
  });
});

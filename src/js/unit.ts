import {CompositeEncoding} from 'vega-lite/build/src/compositemark';
import {AnyMark, isMarkDef} from 'vega-lite/build/src/mark';
import {SelectionDef} from 'vega-lite/build/src/selection';
import {BaseSpec, UnitSpec} from 'vega-lite/build/src/spec';
import {Omit, stringify, titlecase} from 'vega-lite/build/src/util';
import {array} from 'vega-util';
import {APIFromWithAllKeys, transpileProps} from '../apifrom';
import {FunctionCall, FunctionChain, Statement} from '../statement';
import {BaseSpecToJS} from './basespec';
import {encodingToJS} from './encoding';
import {chain} from './js-util';

const UNIT_SPEC_CHAIN_ORDER: (keyof (Omit<UnitSpec, keyof BaseSpec>))[] = [
  'view',
  'width',
  'height',
  'selection',
  'encoding'
];

export class UnitSpecToJS extends BaseSpecToJS implements APIFromWithAllKeys<UnitSpec> {
  public transpile(spec: UnitSpec): Statement {
    const {mark} = spec;
    return new FunctionChain(`vl`, [
      this.mark(mark),
      ...array(super.transpile(spec)),
      ...transpileProps(this, spec, UNIT_SPEC_CHAIN_ORDER)
    ]);
  }

  public projection = chain('projection');

  public view = chain('view');

  public width = chain('width');
  public height = chain('height');

  public encoding(encoding: CompositeEncoding) {
    return new FunctionCall('.encode', encodingToJS.transpile(encoding));
  }

  public selection = chain('selection', (selection: {[name: string]: SelectionDef}) => {
    throw new Error('Selection not implemented yet');
  });

  /**
   * Return a markXXX method call (e.g., `markBar()`)
   * with optional markDef object (e.g.,`markBar({color:"red"}))`).
   */
  public mark(mark: AnyMark): string {
    const markDef = isMarkDef(mark) ? mark : {type: mark};
    const {type, ...markDefWithoutType} = markDef;

    const markParams = Object.keys(markDefWithoutType).length > 0 ? stringify(markDefWithoutType) : '';

    return `.mark${titlecase(type)}(${markParams})`;
  }
}

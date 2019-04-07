import {Channel} from 'vega-lite/build/src/channel';
import {Field, FieldDefWithCondition, isFieldDef, MarkPropFieldDef, ValueDef} from 'vega-lite/build/src/channeldef';
import {FacetedCompositeEncoding} from 'vega-lite/build/src/compositemark';
import {StandardType} from 'vega-lite/build/src/type';
import {APIFrom} from '../apifrom';
import {FunctionChain, Statement} from '../statement';
import {MarkPropFieldDefToJS, PositionFieldDefToJS} from './channeldef';
import {stringify} from './js-util';

// TODO: declare this in Vega-Lite so everyone can use
type PositionDef = FacetedCompositeEncoding['x'] | FacetedCompositeEncoding['y'];

const positionFieldDef = new PositionFieldDefToJS();

function position(channelDef: PositionDef, c: Channel): Statement {
  if (isFieldDef(channelDef)) {
    return new FunctionChain('vl', [channelChain(c), ...positionFieldDef.transpile(channelDef)]);
  } else {
    return value(channelDef, c);
  }
}

const markPropFieldDef = new MarkPropFieldDefToJS();

function markProperty(
  channelDef: FieldDefWithCondition<MarkPropFieldDef<Field, StandardType>, number | string | boolean | null>,
  c: Channel
): Statement {
  if (isFieldDef(channelDef)) {
    //
    return new FunctionChain('vl', [channelChain(c), ...markPropFieldDef.transpile(channelDef)]);
  } else {
    return value(channelDef, c);
  }
}

/**
 * @returns A method chain for a particiular channel (e.g., `.x()` or `.y(5)`)
 */
function channelChain(c: Channel, v?: number | string | boolean) {
  return `.${c}(${v !== undefined ? stringify(v) : ''})`;
}

function value(valueDef: ValueDef<number | string | boolean>, c: Channel) {
  // FIXME support condition

  return new FunctionChain('vl', [channelChain(c, valueDef.value)]);
}

export class EncodingToJS implements APIFrom<FacetedCompositeEncoding> {
  public transpile(encoding: FacetedCompositeEncoding): Statement[] {
    const out = [];
    // FIXME: add all channels
    for (const c of ['x', 'y', 'color']) {
      const def = encoding[c];
      if (def) {
        out.push(this[c](def, c));
      }
    }
    return out;
  }

  public x = position;
  public y = position;

  public color = markProperty;
}

export const encodingToJS = new EncodingToJS();

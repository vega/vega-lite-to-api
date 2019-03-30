import {Channel, POSITION_SCALE_CHANNELS} from 'vega-lite/build/src/channel';
import {FacetedCompositeEncoding} from 'vega-lite/build/src/compositemark';
import {Field, FieldDef, isFieldDef, isTypedFieldDef, isValueDef, ValueDef} from 'vega-lite/build/src/fielddef';
import {APIFrom} from '../apifrom';
import {FunctionChain, Statement} from '../statement';
import {stringify} from './js-util';

type PositionDef = FacetedCompositeEncoding['x'] | FacetedCompositeEncoding['y'];

function position(channelDef: PositionDef, c: Channel): Statement {
  if (isFieldDef(channelDef)) {
    return fieldDef(channelDef, c);
  } else if (isValueDef(channelDef)) {
    return value(channelDef, c);
  }
  throw new Error(`Transpirer not implemented for ${stringify(channelDef)}`);
}

/**
 * @returns method chain for a particiular channel (e.g., `.x()` or `.y(5)`)
 */
function channel(c: Channel, v?: number | string | boolean) {
  return `.${c}(${v !== undefined ? stringify(v) : ''})`;
}

function fieldDef(def: FieldDef<Field>, c: Channel): Statement {
  let t = '';
  const {field} = def;
  if (isTypedFieldDef(def)) {
    const {type} = def;
    t = type.charAt(0).toUpperCase();
  }

  // FIXME support condition, scale, axis, legend, format, etc.

  return new FunctionChain('vl', [channel(c), `.field${t}(${stringify(field)})`]);
}

function value(valueDef: ValueDef<number | string | boolean>, c: Channel) {
  // FIXME support condition

  return new FunctionChain('vl', [channel(c, valueDef.value)]);
}

export class EncodingToJS implements APIFrom<FacetedCompositeEncoding> {
  public transpile(encoding: FacetedCompositeEncoding): Statement[] {
    const out = [];
    // FIXME: add all channels
    for (const c of POSITION_SCALE_CHANNELS) {
      const def = encoding[c];
      if (def) {
        out.push(this[c](def, c));
      }
    }
    return out;
  }

  public x = position;
  public y = position;
}

export const encodingToJS = new EncodingToJS();

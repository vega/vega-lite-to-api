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
 * @returns A method chain for a particiular channel (e.g., `.x()` or `.y(5)`)
 */
function channelChain(c: Channel, v?: number | string | boolean) {
  return `.${c}(${v !== undefined ? stringify(v) : ''})`;
}

function fieldDef(def: FieldDef<Field>, c: Channel): FunctionChain {
  let type;
  const {field, aggregate, timeUnit, bin} = def;
  if (isTypedFieldDef(def)) {
    type = def.type;
  }

  // FIXME support condition

  if (aggregate) {
    if (isString(aggregate)) {
      return new FunctionChain('vl', [
        channelChain(c),
        `.${aggregate}(${stringify(field)})`,
        ...(type !== QUANTITATIVE ? [`.type(${type})`] : [])
      ]);
    } else {
      throw new Error('argmin/argmax not implemented yet');
    }
    // TODO: add argmin def / argmax def
  } else if (timeUnit) {
    throw new Error('timeUnit not implemented yet');
  } else if (bin) {
    throw new Error('bin not implemented yet');
  } else {
    const t = type ? type.charAt(0).toUpperCase() : '';
    return new FunctionChain('vl', [channelChain(c), `.field${t}(${stringify(field)})`]);
  }
}

function value(valueDef: ValueDef<number | string | boolean>, c: Channel) {
  // FIXME support condition

  return new FunctionChain('vl', [channelChain(c, valueDef.value)]);
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

import {Channel, POSITION_SCALE_CHANNELS} from 'vega-lite/build/src/channel';
import {FacetedCompositeEncoding} from 'vega-lite/build/src/compositemark';
import {isFieldDef, ValueDef} from 'vega-lite/build/src/fielddef';
import {APIFrom} from '../apifrom';
import {FunctionChain, Statement} from '../statement';
import {PositionFieldDefToJS} from './channeldef';
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

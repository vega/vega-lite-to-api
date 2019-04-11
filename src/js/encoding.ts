import {Channel} from 'vega-lite/build/src/channel';
import {
  ChannelDef,
  Field,
  FieldDef,
  FieldDefBase,
  FieldDefWithCondition,
  isFieldDef,
  isValueDef,
  MarkPropFieldDef,
  OrderFieldDef,
  PositionFieldDef,
  TextFieldDef,
  Value,
  ValueDef,
  ValueDefWithCondition
} from 'vega-lite/build/src/channeldef';
import {FacetedCompositeEncoding} from 'vega-lite/build/src/compositemark';
import {TitleMixins} from 'vega-lite/build/src/guide';
import {FacetFieldDef} from 'vega-lite/build/src/spec/facet';
import {Type} from 'vega-lite/build/src/type';
import {keys} from 'vega-lite/build/src/util';
import {isArray} from 'vega-util';
import {APIFromWithAllKeys} from '../apifrom';
import {FunctionChain, Statement} from '../statement';
import {
  FacetFieldDefToJS,
  FieldDefBaseWithTitleToJS,
  MarkPropFieldDefToJS,
  PositionFieldDefToJS,
  ScaleFieldDefToJS,
  TextFieldDefToJS
} from './channeldef';
import {stringify} from './js-util';

function fieldOrValue<FD extends FieldDef<Field>, V extends Value = Value>(transpiler: FieldDefBaseWithTitleToJS) {
  return (channelDef: FieldDefWithCondition<FD, V> | ValueDefWithCondition<FD, V> | FD[], c: Channel): Statement => {
    if (isArray(channelDef)) {
      throw new Error(c + ' array not implemented');
    } else if (isFieldDef(channelDef)) {
      // FIXME support condition
      return new FunctionChain('vl', [channelChain(c), ...transpiler.transpile(channelDef)]);
    } else if (isValueDef(channelDef)) {
      // FIXME support condition
      return value(channelDef, c);
    } else {
      throw new Error('Condition only def not implemented');
    }
  };
}

const positionFieldDefToJS = new PositionFieldDefToJS();
const position = fieldOrValue<PositionFieldDef<Field>>(positionFieldDefToJS);

const fieldDefBaseWithTitleToJS = new FieldDefBaseWithTitleToJS();
const fieldDefBaseWithTitle = fieldOrValue<FieldDefBase<Field> & TitleMixins>(fieldDefBaseWithTitleToJS);

const markPropFieldDefToJS = new MarkPropFieldDefToJS();
const markProperty = fieldOrValue<MarkPropFieldDef<Field, Type>>(markPropFieldDefToJS);

const textFieldDefToJS = new TextFieldDefToJS();
const text = fieldOrValue<TextFieldDef<Field>>(textFieldDefToJS);

const scaleFieldDefToJS = new ScaleFieldDefToJS();
const order = fieldOrValue<OrderFieldDef<Field>>(scaleFieldDefToJS);

const facetFieldDefToJS = new FacetFieldDefToJS();
function facet(channelDef: FacetFieldDef<Field>, c: Channel) {
  return new FunctionChain('vl', [channelChain(c), ...facetFieldDefToJS.transpile(channelDef)]);
}

/**
 * @returns A method chain for a particiular channel (e.g., `.x()` or `.y(5)`)
 */
function channelChain(c: Channel, v?: number | string | boolean) {
  return `.${c}(${v !== undefined ? stringify(v) : ''})`;
}

function value(valueDef: ValueDef<number | string | boolean>, c: Channel) {
  return new FunctionChain('vl', [channelChain(c, valueDef.value)]);
}

export class EncodingToJS implements APIFromWithAllKeys<FacetedCompositeEncoding, Channel> {
  public transpile(encoding: FacetedCompositeEncoding) {
    const out: Statement[] = [];

    keys(encoding).forEach((c: Channel) => {
      if (encoding[c]) {
        const o = this[c](
          encoding[c] as ChannelDef<any>, // need to cast as the method for each channel is different from each other
          c
        );
        out.push(o);
      }
    });
    return out;
  }

  // Position & Geo Position

  public x = position;
  public y = position;

  public x2 = fieldDefBaseWithTitle;
  public y2 = fieldDefBaseWithTitle;

  public latitude = fieldDefBaseWithTitle;
  public longitude = fieldDefBaseWithTitle;

  public latitude2 = fieldDefBaseWithTitle;
  public longitude2 = fieldDefBaseWithTitle;

  // Facet

  public facet = facet;
  public row = facet;
  public column = facet;

  // ErrorExtraEncoding

  public xError = fieldDefBaseWithTitle;
  public xError2 = fieldDefBaseWithTitle;
  public yError = fieldDefBaseWithTitle;
  public yError2 = fieldDefBaseWithTitle;

  // Mark Property

  public color = markProperty;

  public fill = markProperty;

  public stroke = markProperty;

  public opacity = markProperty;
  public fillOpacity = markProperty;
  public strokeOpacity = markProperty;

  public strokeWidth = markProperty;

  public shape = markProperty;

  public size = markProperty;

  public detail = fieldDefBaseWithTitle;

  public key = fieldDefBaseWithTitle;

  public text = text;

  public tooltip = text;

  public href = text;

  public order = order;
}

export const encodingToJS = new EncodingToJS();

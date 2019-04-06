import {BinParams} from 'vega-lite/build/src/bin';
import {
  Aggregate,
  Field,
  FieldDef,
  FieldDefBase,
  isTypedFieldDef,
  PositionFieldDef,
  TypedFieldDef
} from 'vega-lite/build/src/fielddef';
import {TimeUnit} from 'vega-lite/build/src/timeunit';
import {QUANTITATIVE} from 'vega-lite/build/src/type';
import {isString} from 'vega-util';
import {APIFromWithAllKeys, transpileProps} from '../apifrom';
import {Statement} from '../statement';
import {chain, stringify} from './js-util';

export class FieldDefBaseToJS implements APIFromWithAllKeys<FieldDefBase<Field>> {
  public transpile(def: FieldDefBase<Field>): Statement[] {
    const {field, aggregate, timeUnit, bin} = def;

    if (aggregate) {
      return this.aggregate(aggregate, def);
    } else if (timeUnit) {
      throw new Error('timeUnit not implemented yet');
    } else if (bin) {
      throw new Error('bin not implemented yet');
    } else {
      return [this.field(field, def)];
    }
  }

  public field(field: Field, def: FieldDef<Field>) {
    let t = '';
    if (isTypedFieldDef(def)) {
      t = def.type.charAt(0).toUpperCase();
    }
    return `.field${t}(${stringify(field)})`;
  }

  public aggregate(aggregate: Aggregate, def: FieldDef<Field>): string[] {
    const {field} = def;
    if (isString(aggregate)) {
      const aggregateChain = `.${aggregate}(${stringify(field)})`;

      if (isTypedFieldDef(def) && def.type !== QUANTITATIVE) {
        return [aggregateChain, this.type(def.type, def)];
      }
      return [aggregateChain];
    } else {
      throw new Error('argmin/argmax not implemented yet');
    }
  }

  public timeUnit(timeUnit: TimeUnit, def: FieldDef<Field>): string[] {
    throw new Error('TimeUnit not implemented yet');
  }
  public bin(bin: boolean | BinParams | 'binned' | null, def: FieldDef<Field>): string[] {
    throw new Error('TimeUnit not implemented yet');
  }

  public type = chain<TypedFieldDef<Field>, 'type'>('type');
}

const POSITION_FIELD_DEF_PROP_ORDER: (keyof PositionFieldDef<Field>)[] = [
  'sort',
  'title',
  'scale',
  'axis',
  'stack',
  'impute'
];

export class PositionFieldDefToJS extends FieldDefBaseToJS implements APIFromWithAllKeys<PositionFieldDef<Field>> {
  public transpile(def: PositionFieldDef<Field>): Statement[] {
    return [...super.transpile(def), ...transpileProps(this, def, POSITION_FIELD_DEF_PROP_ORDER)];
  }

  public sort = chain('sort');

  public title = chain('title');

  public scale = chain('scale');

  public axis = chain('axis');

  public stack = chain('stack');

  public impute = chain('impute');
}

// import {timeUnitOps} from 'vega-lite-api/api/ops';
import {Aggregate, isArgmaxDef, isArgminDef} from 'vega-lite/build/src/aggregate';
import {BinParams} from 'vega-lite/build/src/bin';
import {
  Field,
  FieldDef,
  FieldDefBase,
  HiddenCompositeAggregate,
  isTypedFieldDef,
  MarkPropFieldDef,
  PositionFieldDef,
  ScaleFieldDef,
  TextFieldDef,
  TypedFieldDef
} from 'vega-lite/build/src/channeldef';
import {TitleMixins} from 'vega-lite/build/src/guide';
import {FacetFieldDef} from 'vega-lite/build/src/spec/facet';
import {
  isLocalSingleTimeUnit,
  isUtcSingleTimeUnit,
  isUTCTimeUnit,
  LocalMultiTimeUnit,
  TimeUnit
} from 'vega-lite/build/src/timeunit';
import {QUANTITATIVE, TEMPORAL, Type} from 'vega-lite/build/src/type';
import {isObject} from 'vega-util';
import {APIFromWithAllKeys, transpileProps} from '../apifrom';
import {Statement} from '../statement';
import {BinParamsToJS} from './bin';
import {chain, stringify} from './js-util';

export const MULTI_TIMEUNIT_SHORTHAND: {[t in LocalMultiTimeUnit]: string} = {
  yearquarter: 'YQ',
  yearquartermonth: 'YQM',
  yearmonth: 'YM',
  yearmonthdate: 'YMD',
  yearmonthdatehours: 'YMDH',
  yearmonthdatehoursminutes: 'YMDHM',
  yearmonthdatehoursminutesseconds: 'YMDHMS',
  quartermonth: 'QM',
  monthdate: 'MD',
  monthdatehours: 'MDH',
  hoursminutes: 'HM',
  hoursminutesseconds: 'HMS',
  minutesseconds: 'MS',
  secondsmilliseconds: 'SMS'
};

function timeUnitMethod(timeUnit: TimeUnit) {
  if (isLocalSingleTimeUnit(timeUnit) || isUtcSingleTimeUnit(timeUnit)) {
    return timeUnit;
  } else {
    // Multi
    const prefix = isUTCTimeUnit(timeUnit) ? 'utc' : 'time';
    const localTimeUnit: LocalMultiTimeUnit = isUTCTimeUnit(timeUnit)
      ? (timeUnit.substr(3) as LocalMultiTimeUnit)
      : timeUnit;
    return prefix + MULTI_TIMEUNIT_SHORTHAND[localTimeUnit];
  }
}

const binParamsToJS = new BinParamsToJS();

export class FieldDefBaseToJS implements APIFromWithAllKeys<FieldDefBase<Field>, FieldDefBase<Field>> {
  public transpile(def: FieldDefBase<Field> | TypedFieldDef<Field>): Statement[] {
    const {field, aggregate, timeUnit, bin} = def;

    if (aggregate) {
      return this.aggregate(aggregate, def);
    } else if (timeUnit) {
      return this.timeUnit(timeUnit, def);
    } else if (bin) {
      return this.bin(bin, def);
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

  public aggregate(aggregate: Aggregate | HiddenCompositeAggregate, def: FieldDef<Field>): Statement[] {
    const {field} = def;
    let type: Type;
    if (isTypedFieldDef(def)) {
      type = def.type;
    }

    if (isArgmaxDef(aggregate)) {
      return [...this.transpile({aggregate: 'argmax', field: aggregate.argmax}), ...this.transpile({field, type})];
    } else if (isArgminDef(aggregate)) {
      return [...this.transpile({aggregate: 'argmin', field: aggregate.argmin}), ...this.transpile({field, type})];
    } else {
      const aggregateChain = [`.${aggregate}(${field ? stringify(field) : ''})`];

      if (isTypedFieldDef(def) && type !== QUANTITATIVE) {
        aggregateChain.push(this.type(type, def));
      }
      return aggregateChain;
    }
  }

  public timeUnit(timeUnit: TimeUnit, def: FieldDef<Field>): string[] {
    const {field} = def;
    const timeUnitChain = [`.${timeUnitMethod(timeUnit)}(${stringify(field)})`];

    if (isTypedFieldDef(def) && def.type !== TEMPORAL) {
      timeUnitChain.push(this.type(def.type, def));
    }
    return timeUnitChain;
  }

  public bin(bin: boolean | BinParams | 'binned' | null, def: FieldDef<Field>): Statement[] {
    const {field} = def;

    const binChain: Statement[] = [`.bin(${stringify(field)})`];

    if (bin === 'binned') {
      binChain.push('.binned(true)');
    } else if (isObject(bin)) {
      binChain.push(...binParamsToJS.transpile(bin));
    }

    if (isTypedFieldDef(def) && def.type !== QUANTITATIVE) {
      binChain.push(this.type(def.type, def));
    }

    return binChain;
  }

  public type = chain<TypedFieldDef<Field>, 'type', FieldDefBase<Field>>('type');
}

export class FieldDefBaseWithTitleToJS extends FieldDefBaseToJS
  implements APIFromWithAllKeys<FieldDefBase<Field> & TitleMixins> {
  public transpile(def: FieldDefBase<Field> & TitleMixins): Statement[] {
    return [...super.transpile(def), ...transpileProps(this, def, ['title'])];
  }

  public title = chain('title');
}

const SCALE_FIELD_DEF_PROP_ORDER: (keyof ScaleFieldDef<Field>)[] = ['sort', 'scale'];

export class ScaleFieldDefToJS extends FieldDefBaseWithTitleToJS
  implements APIFromWithAllKeys<ScaleFieldDef<Field, Type>> {
  public transpile(def: ScaleFieldDef<Field, Type>): Statement[] {
    return [...super.transpile(def), ...transpileProps(this, def, SCALE_FIELD_DEF_PROP_ORDER)];
  }

  public sort = chain('sort');

  public scale = chain('scale');
}

export class PositionFieldDefToJS extends ScaleFieldDefToJS implements APIFromWithAllKeys<PositionFieldDef<Field>> {
  public transpile(def: PositionFieldDef<Field>): Statement[] {
    return [...super.transpile(def), ...transpileProps(this, def, ['axis', 'stack', 'impute'])];
  }

  public axis = chain('axis');

  public stack = chain('stack');

  public impute = chain('impute');
}

export class MarkPropFieldDefToJS extends ScaleFieldDefToJS implements APIFromWithAllKeys<MarkPropFieldDef<Field>> {
  public transpile(def: MarkPropFieldDef<Field, Type>): Statement[] {
    return [...super.transpile(def), ...transpileProps(this, def, ['legend'])];
  }
  public legend = chain('legend');
}

export class FacetFieldDefToJS extends ScaleFieldDefToJS implements APIFromWithAllKeys<FacetFieldDef<Field>> {
  public transpile(def: FacetFieldDef<Field>): Statement[] {
    return [...super.transpile(def), ...transpileProps(this, def, ['header'])];
  }
  public header = chain('header');
}

export class TextFieldDefToJS extends FieldDefBaseWithTitleToJS implements APIFromWithAllKeys<TextFieldDef<Field>> {
  public transpile(def: TextFieldDef<Field>): Statement[] {
    return [...super.transpile(def), ...transpileProps(this, def, ['format', 'formatType'])];
  }
  public format = chain('format');
  public formatType = chain('formatType');
}

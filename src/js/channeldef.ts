import {Aggregate, isArgmaxDef, isArgminDef} from 'vega-lite/build/src/aggregate';
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
import {TimeUnit} from 'vega-lite/build/src/timeunit';
import {QUANTITATIVE, TEMPORAL, Type} from 'vega-lite/build/src/type';
import {APIFromWithAllKeys, transpileProps} from '../apifrom';
import {Statement} from '../statement';
import {chain, stringify} from './js-util';
import {timeUnitMethod} from './timeUnit';

export class FieldDefBaseToJS implements APIFromWithAllKeys<FieldDefBase<Field>, FieldDefBase<Field>> {
  public transpile(def: FieldDefBase<Field> | TypedFieldDef<Field>): Statement[] {
    const {field, aggregate, timeUnit} = def;

    if (aggregate) {
      return this.aggregate(aggregate, def);
    } else if (timeUnit) {
      return this.timeUnit(timeUnit, def);
    } else {
      return this.field(field, def);
    }
  }

  public field(field: Field, def: FieldDef<Field>) {
    let t = '';
    if (isTypedFieldDef(def)) {
      t = def.type.charAt(0).toUpperCase();
    }
    const out: Statement[] = [`.field${t}(${stringify(field)})`];

    const {bin} = def;

    if (bin) {
      out.push(this.bin(bin, def));
    }
    return out;
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
      const aggregateChain: Statement[] = [`.${aggregate}(${field ? stringify(field) : ''})`];

      if (isTypedFieldDef(def) && type !== QUANTITATIVE) {
        aggregateChain.push(this.type(type, def));
      }
      return aggregateChain;
    }
  }

  public timeUnit(timeUnit: TimeUnit, def: FieldDef<Field>) {
    const {field} = def;
    const timeUnitChain: Statement[] = [`.${timeUnitMethod(timeUnit)}(${stringify(field)})`];

    if (isTypedFieldDef(def) && def.type !== TEMPORAL) {
      timeUnitChain.push(this.type(def.type, def));
    }
    return timeUnitChain;
  }

  public bin = chain<TypedFieldDef<Field>, 'bin', FieldDefBase<Field>>('bin');

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

import {TimeUnit} from 'vega-lite/build/src/timeunit';
import {
  AggregatedFieldDef,
  AggregateTransform,
  CalculateTransform,
  FlattenTransform,
  FoldTransform,
  isAggregate,
  isCalculate,
  isFlatten,
  isFold,
  isJoinAggregate,
  isTimeUnit,
  isWindow,
  JoinAggregateTransform,
  TimeUnitTransform,
  Transform,
  WindowFieldDef,
  WindowTransform
} from 'vega-lite/build/src/transform';
import {APIFrom, APIFromWithAllKeys, transpileProps} from '../apifrom';
import {FunctionChain, Statement} from '../statement';
import {chain, flatten, stringify} from './js-util';
import {timeUnitMethod} from './timeUnit';

class OpFieldDefToJS implements APIFrom<AggregatedFieldDef | WindowFieldDef> {
  public transpile(def: AggregatedFieldDef | WindowFieldDef): FunctionChain {
    const {op, field, as} = def;
    return new FunctionChain('vl', [`.${op}(${stringify(field)})`, `.as(${stringify(as)})`]);
  }
}

const opFieldDefToJS = new OpFieldDefToJS();

class AggregateTransformToJS implements APIFromWithAllKeys<AggregateTransform> {
  public transpile(t: AggregateTransform): FunctionChain {
    return new FunctionChain(`vl`, transpileProps(this, t, ['groupby', 'aggregate']));
  }

  public aggregate = chain<AggregateTransform, 'aggregate'>('aggregate', aggregate => {
    return aggregate.map(fieldDef => {
      return opFieldDefToJS.transpile(fieldDef);
    });
  });

  public groupby = chain<AggregateTransform, 'groupby'>('groupby', groupBy => {
    return groupBy.map(f => stringify(f)).join(',');
  });
}

class CalculateTransformToJS implements APIFromWithAllKeys<CalculateTransform> {
  public transpile(t: CalculateTransform): FunctionChain {
    return new FunctionChain(`vl`, transpileProps(this, t, ['calculate', 'as']));
  }

  public calculate = chain('calculate');

  public as = chain('as');
}

class FoldTransformToJS implements APIFromWithAllKeys<FoldTransform> {
  public transpile(t: FoldTransform): FunctionChain {
    return new FunctionChain(`vl`, transpileProps(this, t, ['fold', 'as']));
  }

  public fold = chain<FoldTransform, 'fold'>('fold', flatten());

  public as = chain<FoldTransform, 'as'>('as', flatten());
}

class FlattenTransformToJS implements APIFromWithAllKeys<FlattenTransform> {
  public transpile(t: FlattenTransform): FunctionChain {
    return new FunctionChain(`vl`, transpileProps(this, t, ['flatten', 'as']));
  }

  public flatten = chain<FlattenTransform, 'flatten'>('flatten', flatten());

  public as = chain<FlattenTransform, 'as'>('as', flatten());
}

class JoinAggregateTransformToJS implements APIFromWithAllKeys<JoinAggregateTransform> {
  public transpile(t: JoinAggregateTransform): FunctionChain {
    return new FunctionChain(`vl`, transpileProps(this, t, ['groupby', 'joinaggregate']));
  }

  public joinaggregate = chain<JoinAggregateTransform, 'joinaggregate'>('joinaggregate', joinaggregate => {
    return joinaggregate.map(fieldDef => {
      return opFieldDefToJS.transpile(fieldDef);
    });
  });

  public groupby = chain<JoinAggregateTransform, 'groupby'>('groupby', groupBy => {
    return groupBy.map(f => stringify(f)).join(',');
  });
}

class TimeUnitTransformToJS implements APIFromWithAllKeys<TimeUnitTransform> {
  public transpile(t: TimeUnitTransform): FunctionChain {
    const {field} = t;
    return new FunctionChain(`vl`, transpileProps(this, t, ['timeUnit', 'as'], field));
  }

  public timeUnit(timeUnit: TimeUnit, field: string) {
    const method = timeUnitMethod(timeUnit);
    return `.${method}(${this.field(field)})`;
  }

  public field(field: string) {
    return stringify(field);
  }

  public as = chain('as');
}

class WindowTransformToJS implements APIFromWithAllKeys<WindowTransform> {
  public transpile(t: WindowTransform): FunctionChain {
    return new FunctionChain(`vl`, transpileProps(this, t, ['groupby', 'window', 'frame', 'ignorePeers', 'sort']));
  }

  public frame = chain('frame');
  public ignorePeers = chain('ignorePeers');
  public sort = chain('sort');

  public window = chain<WindowTransform, 'window'>('window', window => {
    return window.map(fieldDef => {
      return opFieldDefToJS.transpile(fieldDef);
    });
  });

  public groupby = chain<WindowTransform, 'groupby'>('groupby', groupBy => {
    return groupBy.map(f => stringify(f)).join(',');
  });
}

export class TransformToJS implements APIFrom<Transform> {
  constructor(
    private transpilers = {
      aggregate: new AggregateTransformToJS(),
      joinaggregate: new JoinAggregateTransformToJS(),
      calculate: new CalculateTransformToJS(),
      flatten: new FlattenTransformToJS(),
      fold: new FoldTransformToJS(),
      timeUnit: new TimeUnitTransformToJS(),
      window: new WindowTransformToJS()
    }
  ) {}
  public transpile(t: Transform): Statement {
    const {aggregate, joinaggregate, calculate, flatten, fold, timeUnit, window} = this.transpilers;

    if (isAggregate(t)) {
      return aggregate.transpile(t);
    } else if (isCalculate(t)) {
      return calculate.transpile(t);
    } else if (isFold(t)) {
      return fold.transpile(t);
    } else if (isFlatten(t)) {
      return flatten.transpile(t);
    } else if (isJoinAggregate(t)) {
      return joinaggregate.transpile(t);
    } else if (isTimeUnit(t)) {
      return timeUnit.transpile(t);
    } else if (isWindow(t)) {
      return window.transpile(t);
    }
    throw new Error(`Transform ${stringify(t)} not implemented.`);
  }
}

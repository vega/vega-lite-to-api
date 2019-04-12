import {TimeUnit} from 'vega-lite/build/src/timeunit';
import {
  AggregatedFieldDef,
  AggregateTransform,
  CalculateTransform,
  isAggregate,
  isCalculate,
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
import {chain, stringify} from './js-util';
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

const aggregateTransformToJS = new AggregateTransformToJS();
const joinaggregateTransformToJS = new JoinAggregateTransformToJS();
const calculateTransformToJS = new CalculateTransformToJS();
const timeUnitTransformToJS = new TimeUnitTransformToJS();
const windowTransformToJS = new WindowTransformToJS();

export class TransformToJS implements APIFrom<Transform> {
  public transpile(t: Transform): Statement {
    if (isAggregate(t)) {
      return aggregateTransformToJS.transpile(t);
    } else if (isCalculate(t)) {
      return calculateTransformToJS.transpile(t);
    } else if (isJoinAggregate(t)) {
      return joinaggregateTransformToJS.transpile(t);
    } else if (isTimeUnit(t)) {
      return timeUnitTransformToJS.transpile(t);
    } else if (isWindow(t)) {
      return windowTransformToJS.transpile(t);
    }
    throw new Error(`Transform ${stringify(t)} not implemented.`);
  }
}

import {TimeUnit} from 'vega-lite/build/src/timeunit';
import {
  AggregateTransform,
  CalculateTransform,
  isAggregate,
  isCalculate,
  isTimeUnit,
  TimeUnitTransform,
  Transform
} from 'vega-lite/build/src/transform';
import {APIFrom, APIFromWithAllKeys, transpileProps} from '../apifrom';
import {FunctionChain, Statement} from '../statement';
import {chain, stringify} from './js-util';
import {timeUnitMethod} from './timeUnit';

class AggregateTransformToJS implements APIFromWithAllKeys<AggregateTransform> {
  public transpile(t: AggregateTransform): FunctionChain {
    return new FunctionChain(`vl`, transpileProps(this, t, ['groupby', 'aggregate']));
  }

  public aggregate = chain<AggregateTransform, 'aggregate'>('aggregate', aggregate => {
    return aggregate.map(aggregateFieldDef => {
      const {op, field, as} = aggregateFieldDef;
      return new FunctionChain('vl', [`.${op}(${stringify(field)})`, `.as(${stringify(as)})`]);
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

const aggregateTransformToJS = new AggregateTransformToJS();
const calculateTransformToJS = new CalculateTransformToJS();
const timeUnitTransformToJS = new TimeUnitTransformToJS();

export class TransformToJS implements APIFrom<Transform> {
  public transpile(t: Transform): Statement {
    if (isAggregate(t)) {
      return aggregateTransformToJS.transpile(t);
    } else if (isCalculate(t)) {
      return calculateTransformToJS.transpile(t);
    } else if (isTimeUnit(t)) {
      return timeUnitTransformToJS.transpile(t);
    }
    throw new Error(`Transform ${stringify(t)} not implemented.`);
  }
}

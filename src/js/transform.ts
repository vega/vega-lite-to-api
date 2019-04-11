import {TimeUnit} from 'vega-lite/build/src/timeunit';
import {CalculateTransform, isCalculate, isTimeUnit, TimeUnitTransform, Transform} from 'vega-lite/build/src/transform';
import {APIFrom, APIFromWithAllKeys, transpileProps} from '../apifrom';
import {FunctionChain, Statement} from '../statement';
import {chain, stringify} from './js-util';
import {timeUnitMethod} from './timeUnit';

export class CalculateTransformToJS implements APIFromWithAllKeys<CalculateTransform> {
  public transpile(t: CalculateTransform): FunctionChain {
    return new FunctionChain(`vl`, transpileProps(this, t, ['calculate', 'as']));
  }

  public calculate = chain('calculate');

  public as = chain('as');
}

export class TimeUnitTransformToJS implements APIFromWithAllKeys<TimeUnitTransform> {
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

const calculateTransformToJS = new CalculateTransformToJS();
const timeUnitTransformToJS = new TimeUnitTransformToJS();

export class TransformToJS implements APIFrom<Transform> {
  public transpile(t: Transform): Statement {
    if (isCalculate(t)) {
      return calculateTransformToJS.transpile(t);
    } else if (isTimeUnit(t)) {
      return timeUnitTransformToJS.transpile(t);
    }
    throw new Error(`Transform ${stringify(t)} not implemented.`);
  }
}

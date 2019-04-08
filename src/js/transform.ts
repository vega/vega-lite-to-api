import {isTimeUnit, TimeUnitTransform, Transform} from 'vega-lite/build/src/transform';
import {APIFrom} from '../apifrom';
import {FunctionCall, Statement} from '../statement';
import {stringify} from './js-util';
import {timeUnitMethod} from './timeUnit';

export class TimeUnitTransformToJS implements APIFrom<TimeUnitTransform> {
  public transpile(t: TimeUnitTransform) {
    const {timeUnit, field, as} = t;
    const method = timeUnitMethod(timeUnit);
    return new FunctionCall('vl' + `.${method}`, [stringify(field), stringify(as)]);
  }
}

const timeUnitTransformToJS = new TimeUnitTransformToJS();

export class TransformToJS implements APIFrom<Transform> {
  public transpile(t: Transform): Statement {
    if (isTimeUnit(t)) {
      return timeUnitTransformToJS.transpile(t);
    }
    throw new Error(`Transform ${stringify(t)} not implemented.`);
  }
}

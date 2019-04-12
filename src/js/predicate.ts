import {isLogicalAnd, isLogicalNot, isLogicalOr, LogicalOperand} from 'vega-lite/build/src/logical';
import {isSelectionPredicate, Predicate} from 'vega-lite/build/src/predicate';
import {APIFrom} from '../apifrom';
import {FunctionCall, Statement} from '../statement';
import {stringify} from './js-util';

export class LogicalOperandToJS<T extends string | object> implements APIFrom<LogicalOperand<T>> {
  constructor(private transpileLeaf: (x: T) => Statement) {}
  public transpile(o: LogicalOperand<T>): Statement {
    if (isLogicalAnd(o)) {
      return new FunctionCall('vl.and', o.and.map(c => this.transpile(c)));
    } else if (isLogicalOr(o)) {
      return new FunctionCall('vl.or', o.or.map(c => this.transpile(c)));
    } else if (isLogicalNot(o)) {
      return new FunctionCall('vl.not', [this.transpile(o.not)]);
    }
    return this.transpileLeaf(o);
  }
}

export class PredicateToJS implements APIFrom<Predicate> {
  constructor(private selection = new LogicalOperandToJS<string>(x => x)) {}

  public transpile(p: Predicate): Statement {
    if (isSelectionPredicate(p)) {
      // TODO: This won't  be correct  if there are  duplicate selecton name
      return this.selection.transpile(p.selection);
    }
    return stringify(p);
  }
}

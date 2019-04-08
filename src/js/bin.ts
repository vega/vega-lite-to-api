import {BinParams} from 'vega-lite/build/src/bin';
import {flagKeys} from 'vega-lite/build/src/util';
import {APIFromWithAllKeys, transpileProps} from '../apifrom';
import {Statement} from '../statement';
import {chain} from './js-util';

const BIN_PARAMS_INDEX: {[p in keyof Required<BinParams>]: 1} = {
  binned: 1,
  anchor: 1,
  base: 1,
  divide: 1,
  extent: 1,
  maxbins: 1,
  minstep: 1,
  nice: 1,
  step: 1,
  steps: 1
};

const BIN_PARAMS_CHAIN_ORDER = flagKeys(BIN_PARAMS_INDEX);

export class BinParamsToJS implements APIFromWithAllKeys<BinParams> {
  public transpile(bin: BinParams): Statement[] {
    return transpileProps(this, bin, BIN_PARAMS_CHAIN_ORDER);
  }

  public binned = chain('binned');
  public anchor = chain('anchor');
  public base = chain('base');
  public divide = chain('divide');
  public extent = chain('extent');
  public maxbins = chain('maxbins');
  public minstep = chain('minstep');
  public nice = chain('nice');
  public step = chain('step');
  public steps = chain('steps');
}

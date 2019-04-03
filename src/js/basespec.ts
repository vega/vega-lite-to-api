import {Data, isInlineData, isUrlData} from 'vega-lite/build/src/data';
import {BaseSpec} from 'vega-lite/build/src/spec';
import {Transform} from 'vega-lite/build/src/transform';
import {APIFromWithAllKeys, transpileProps} from '../apifrom';
import {Statement} from '../statement';
import {chain, stringify} from './js-util';

const BASE_SPEC_CHAIN_ORDER: (keyof BaseSpec)[] = ['name', 'description', 'title', 'data', 'transform'];

export class BaseSpecToJS implements APIFromWithAllKeys<BaseSpec> {
  public transpile(spec: BaseSpec): Statement | Statement[] {
    return transpileProps(this, spec, BASE_SPEC_CHAIN_ORDER);
  }

  public name = chain('name');
  public description = chain('description');
  public title = chain('title');

  public data = chain(
    'data',
    (data: Data): string => {
      if (isUrlData(data)) {
        if (data.url && Object.keys(data).length === 1) {
          return data.url;
        }
        throw new Error('Url Data with other property not implemented yet');
      } else if (isInlineData(data)) {
        if (data.values && Object.keys(data).length === 1) {
          return stringify(data.values);
        }
        throw new Error('Inline Values Data with other property not implemented yet');
      }
      throw new Error('Non URL Data not implemented');
    }
  );

  public transform = chain(
    'transform',
    (transform: Transform[]): string => {
      throw new Error('Transform not implemented yet');
    }
  );
}

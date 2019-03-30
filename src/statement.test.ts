import {FunctionChain} from './statement';

describe('FunctionChain', () => {
  it('outputs a function chain code', () => {
    const chain = new FunctionChain('vl', ['.markBar()']);
    expect(chain.toCode(0)).toEqual(`vl.markBar()`);
  });
});

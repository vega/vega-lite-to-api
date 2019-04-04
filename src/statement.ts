import {isString} from 'vega-util';

const TAB = {0: ''};

export const NEWLINE = '\n';

export const DEFAULT_TAB_STRING = '  ';

function getTab(indentLevel: number, tabString = DEFAULT_TAB_STRING) {
  if (indentLevel in TAB) {
    return TAB[indentLevel];
  } else {
    return (TAB[indentLevel] = TAB[indentLevel - 1] + tabString);
  }
}

export interface IStatement {
  toCode(indentLevel: number): string;
}

export class FunctionCall implements IStatement {
  constructor(public fn: string, public args: Statement[]) {}

  public toCode(indentLevel: number): string {
    const {fn, args} = this;

    // TODO: add some heuristics whether to add line breaks

    // prettier-ignore
    return getTab(indentLevel) + fn + ['(', ...args.map(s => toCode(s, indentLevel + 1)), getTab(indentLevel) + ')'].join(NEWLINE);
  }
}

export class FunctionChain implements IStatement {
  constructor(public main: string, public chains: Statement[]) {}

  public toCode(indentLevel: number): string {
    const {main, chains} = this;

    const indentedMain = toCode(main, indentLevel);
    const flatChains = chains.map(c => toCode(c, 0)).join('');

    if (indentedMain.length + flatChains.length <= 80) {
      return indentedMain + flatChains;
    } else {
      const firstChain = chains.length > 0 ? toCode(chains[0], 0) : '';
      const restChains = chains
        .slice(1)
        .map(c => toCode(c, indentLevel + 1))
        .join(NEWLINE);

      // prettier-ignore
      return (
        indentedMain + firstChain + NEWLINE +
          restChains
      );
    }
  }
}

export type Statement = string | FunctionChain | FunctionCall;

export function toCode(s: Statement, indentLevel: number = 0) {
  if (s instanceof FunctionChain) {
    return s.toCode(indentLevel);
  } else if (s instanceof FunctionCall) {
    return s.toCode(indentLevel);
  } else if (isString(s)) {
    return getTab(indentLevel) + s;
  }
  throw new Error('toCode not implemented for ' + s);
}

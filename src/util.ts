import { NS } from '@ns';

export function printSeparator(ns: NS, silent = false) {
  tPrint(ns, '='.repeat(50), silent);
}

export function printHeader(ns: NS, headerText: string, silent = false) {
  printSeparator(ns, silent);
  tPrint(ns, headerText, silent);
  printSeparator(ns, silent);
}

export function tPrint(ns: NS, text: string, silent = false) {
  !silent && ns.tprint(text);
}

export function log(ns: NS, text: string, debug = false) {
  if (debug) {
    ns.tprint(text);
  } else {
    ns.print(text);
  }
}

export function logSeparator(ns: NS, debug = false) {
  const text = '='.repeat(50);
  if (debug) {
    ns.tprint(text);
  } else {
    ns.print(text);
  }
}

export function red(text: string) {
  return `\u001b[31m${text}\u001b[0m`;
}

export function boldRed(text: string) {
  return `\u001b[1;31m${text}\u001b[0m`;
}

export function bold(text: string) {
  return `\u001b[1;32m${text}\u001b[0m`;
}

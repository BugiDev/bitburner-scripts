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

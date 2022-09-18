import { NS } from '@ns';

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

export function formatMoney(ns: NS, money: number) {
  return ns.nFormat(money, '($ 0.00 a)');
}

export function printMoneyCalculation(ns: NS, serverName: string, debug = false, boldText = false) {
  const serverMaxMoney = ns.getServerMaxMoney(serverName);
  const serverCurrentMoney = ns.getServerMoneyAvailable(serverName);
  const text = `Money (current / max): ${formatMoney(ns, serverCurrentMoney)}/${formatMoney(
    ns,
    serverMaxMoney
  )}`;
  log(ns, boldText ? bold(text) : text, debug);
}

export function printSecurityCalculation(
  ns: NS,
  serverName: string,
  debug = false,
  boldText = false
) {
  const serverMinSecLevel = ns.getServerMinSecurityLevel(serverName);
  const serverCurrentSecLevel = ns.getServerSecurityLevel(serverName);
  const text = `Security (current / min): ${serverCurrentSecLevel}/${serverMinSecLevel}`;

  log(ns, boldText ? bold(text) : text, debug);
}

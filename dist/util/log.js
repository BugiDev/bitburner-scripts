export function log(ns, text, debug = false) {
    if (debug) {
        ns.tprint(text);
    }
    else {
        ns.print(text);
    }
}
export function logSeparator(ns, debug = false) {
    const text = '='.repeat(50);
    if (debug) {
        ns.tprint(text);
    }
    else {
        ns.print(text);
    }
}
export function red(text) {
    return `\u001b[31m${text}\u001b[0m`;
}
export function boldRed(text) {
    return `\u001b[1;31m${text}\u001b[0m`;
}
export function bold(text) {
    return `\u001b[1;32m${text}\u001b[0m`;
}
export function formatMoney(ns, money) {
    return ns.nFormat(money, '($ 0.00 a)');
}
export function printMoneyCalculation(ns, serverName, debug = false) {
    const serverMaxMoney = ns.getServerMaxMoney(serverName);
    const serverCurrentMoney = ns.getServerMoneyAvailable(serverName);
    log(ns, `Money (current / max): ${formatMoney(ns, serverCurrentMoney)}/${formatMoney(ns, serverMaxMoney)}`, debug);
}
export function printSecurityCalculation(ns, serverName, debug = false) {
    const serverMinSecLevel = ns.getServerMinSecurityLevel(serverName);
    const serverCurrentSecLevel = ns.getServerSecurityLevel(serverName);
    log(ns, `Security (current / min): ${serverCurrentSecLevel}/${serverMinSecLevel}`, debug);
}

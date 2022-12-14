export function printSeparator(ns, silent = false) {
    tPrint(ns, '='.repeat(50), silent);
}
export function printHeader(ns, headerText, silent = false) {
    printSeparator(ns, silent);
    tPrint(ns, headerText, silent);
    printSeparator(ns, silent);
}
export function tPrint(ns, text, silent = false) {
    !silent && ns.tprint(text);
}
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

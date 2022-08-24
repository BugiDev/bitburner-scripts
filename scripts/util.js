
export function printSeparator(ns, silent = false) {
    tPrint(ns, '='.repeat(50), silent)
}

export function printHeader(ns, headerText, silent = false) {
    printSeparator(ns, silent);
    tPrint(ns, headerText, silent)
    printSeparator(ns, silent);
}

export function tPrint(ns, text, silent = false) {
    !silent && ns.tprint(text);
}

export function log(ns, text, debug = false) {
    if (debug) {
        ns.tprint(text);
    } else {
        ns.print(text);
    }
}

export function logSeparator(ns, debug = false) {
    const text = '='.repeat(50);
    if (debug) {
        ns.tprint(text);
    } else {
        ns.print(text);
    }
}

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

export function log(ns, debug = false) {
    if (debug) {
        ns.tprint(text);
    } else {
        ns.print(text);
    }
}
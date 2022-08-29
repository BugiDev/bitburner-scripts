import { log, logSeparator } from '/util';
/** @param {NS} ns
 * @param debug
 */
export async function main(ns, debug = false) {
    const serverName = ns.args[0];
    ns.tail();
    while (true) {
        const serverMaxMoney = ns.getServerMaxMoney(serverName);
        const serverCurrentMoney = ns.getServerMoneyAvailable(serverName);
        const serverMinSecLevel = ns.getServerMinSecurityLevel(serverName);
        const serverCurrentSecLevel = ns.getServerSecurityLevel(serverName);
        logSeparator(ns, debug);
        log(ns, `Money calc: ${ns.nFormat(serverCurrentMoney, '($ 0.00 a)')}/${ns.nFormat(serverMaxMoney, '($ 0.00 a)')}`, debug);
        log(ns, `Security calc: ${serverCurrentSecLevel}/${serverMinSecLevel}`, debug);
        await ns.sleep(1000);
    }
}

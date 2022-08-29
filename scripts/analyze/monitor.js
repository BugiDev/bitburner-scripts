import {log, logSeparator} from "/scripts/util";

/** @param {NS} ns
 * @param debug
 */
export async function main(ns, debug = false) {
    const serverName = ns.args[0];
    ns.tail();

    while (true) {
        const serverMaxMoney = await ns.getServerMaxMoney(serverName);
        const serverCurrentMoney = await ns.getServerMoneyAvailable(serverName);

        const serverMinSecLevel = await ns.getServerMinSecurityLevel(serverName);
        const serverCurrentSecLevel = await ns.getServerSecurityLevel(serverName);

        logSeparator(ns, debug);
        log(ns, `Money calc: ${ns.nFormat(serverCurrentMoney, '($ 0.00 a)')}/${ns.nFormat(serverMaxMoney, '($ 0.00 a)')}`, debug);
        log(ns, `Security calc: ${serverCurrentSecLevel}/${serverMinSecLevel}`, debug);
        await ns.sleep(1000);
    }
}
import {log} from "/scripts/util";

/** @param {NS} ns
 * @param debug
 */
export async function main(ns, debug = false) {
    const serverName = ns.args[0];

    const serverMaxMoney = await ns.getServerMaxMoney(serverName);
    const serverCurrentMoney = await ns.getServerMoneyAvailable(serverName);

    const serverMinSecLevel = await ns.getServerMinSecurityLevel(serverName);
    const serverCurrentSecLevel = await ns.getServerSecurityLevel(serverName);

    ns.tail();

    while(true) {
        log(ns, `Money calc: ${ns.nFormat(serverCurrentMoney, '($ 0.00 a)')}/${ns.nFormat(serverMaxMoney, '($ 0.00 a)')}`, debug);
        log(ns, `Security calc: ${serverCurrentSecLevel}/${serverMinSecLevel}`, debug);
        await ns.sleep(10000);
    }
}
import {getServerFreeThreadCount} from "/scripts/util/thread";
import {log, logSeparator} from "/scripts/util";
import {CONFIG} from "/scripts/config";

export async function maxOutServer(ns, serverName, debug = false) {
    const freeTreadCount = getServerFreeThreadCount(ns, 'home');

    if (freeTreadCount < 1) {
        log(ns, 'No enough threads on home to max out the server!', debug);
        return;
    }

    const serverMaxMoney = await ns.getServerMaxMoney(serverName);
    let serverCurrentMoney = await ns.getServerMoneyAvailable(serverName);

    while (serverCurrentMoney < serverMaxMoney) {
        log(ns, `Money calc: ${ns.nFormat(serverCurrentMoney, '($ 0.00 a)')}/${ns.nFormat(serverMaxMoney, '($ 0.00 a)')}`, debug);
        ns.run(CONFIG.loopMalwareGrow, freeTreadCount, serverName, freeTreadCount);
        const growTime = await ns.getGrowTime(serverName);
        await ns.sleep(growTime + 10);
        serverCurrentMoney = await ns.getServerMoneyAvailable(serverName);
    }

    const serverMinSecLevel = await ns.getServerMinSecurityLevel(serverName);
    let serverCurrentSecLevel = await ns.getServerSecurityLevel(serverName);

    while (serverCurrentSecLevel > serverMinSecLevel) {
        log(ns, `Security calc: ${serverCurrentSecLevel}/${serverMinSecLevel}`, debug);
        ns.run(CONFIG.loopMalwareWeaken, freeTreadCount, serverName, freeTreadCount);
        const weakenTime = await ns.getWeakenTime(serverName);
        await ns.sleep(weakenTime + 10);
        serverCurrentSecLevel = await ns.getServerSecurityLevel(serverName);
    }
    log(ns, `Maxed out server: ${serverName}`, debug);
    logSeparator(ns, debug);
}
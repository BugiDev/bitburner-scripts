import { getServerFreeThreadCount } from '/util/thread';
import { log, logSeparator } from '/util';
import { CONFIG } from '/config';
export async function maxOutServer(ns, serverName, debug = false) {
    ns.disableLog('ALL');
    const freeTreadCount = getServerFreeThreadCount(ns, 'home');
    if (freeTreadCount < 1) {
        log(ns, 'No enough threads on home to max out the server!', debug);
        return;
    }
    const serverMaxMoney = ns.getServerMaxMoney(serverName);
    let serverCurrentMoney = ns.getServerMoneyAvailable(serverName);
    while (serverCurrentMoney < serverMaxMoney) {
        log(ns, `Money calc: ${ns.nFormat(serverCurrentMoney, '($ 0.00 a)')}/${ns.nFormat(serverMaxMoney, '($ 0.00 a)')}`, debug);
        logSeparator(ns, debug);
        ns.run(CONFIG.loopMalwareGrow, freeTreadCount, serverName, freeTreadCount);
        const growTime = ns.getGrowTime(serverName);
        await ns.sleep(growTime + 10);
        serverCurrentMoney = ns.getServerMoneyAvailable(serverName);
    }
    log(ns, `Money calc: ${ns.nFormat(serverCurrentMoney, '($ 0.00 a)')}/${ns.nFormat(serverMaxMoney, '($ 0.00 a)')}`, debug);
    logSeparator(ns, debug);
    const serverMinSecLevel = ns.getServerMinSecurityLevel(serverName);
    let serverCurrentSecLevel = ns.getServerSecurityLevel(serverName);
    while (serverCurrentSecLevel > serverMinSecLevel) {
        log(ns, `Security calc: ${serverCurrentSecLevel}/${serverMinSecLevel}`, debug);
        logSeparator(ns, debug);
        ns.run(CONFIG.loopMalwareWeaken, freeTreadCount, serverName, freeTreadCount);
        const weakenTime = ns.getWeakenTime(serverName);
        await ns.sleep(weakenTime + 10);
        serverCurrentSecLevel = ns.getServerSecurityLevel(serverName);
    }
    log(ns, `Security calc: ${serverCurrentSecLevel}/${serverMinSecLevel}`, debug);
    logSeparator(ns, debug);
    log(ns, `Maxed out server: ${serverName}`, debug);
    logSeparator(ns, debug);
}

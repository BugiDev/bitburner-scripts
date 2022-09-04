import { getNetworkFreeThreadCount } from '/util/thread';
import { log, logSeparator } from '/util';
import { executeRemoteGrow, executeRemoteWeak } from '/util/remote-exec';
export async function maxOutServer(ns, serverName, debug = false) {
    ns.disableLog('ALL');
    const freeTreadCount = getNetworkFreeThreadCount(ns);
    if (freeTreadCount.total < 1) {
        log(ns, 'No enough threads to max out the server!', debug);
        return;
    }
    const serverMaxMoney = ns.getServerMaxMoney(serverName);
    let serverCurrentMoney = ns.getServerMoneyAvailable(serverName);
    const growthAnalyzeSecurity = ns.growthAnalyzeSecurity(1, serverName);
    const weakenAnalyze = ns.weakenAnalyze(1);
    const ratio = Math.floor(weakenAnalyze / growthAnalyzeSecurity);
    const cycle = 1 + ratio;
    const cyclesCount = Math.floor(freeTreadCount.total / cycle);
    while (serverCurrentMoney < serverMaxMoney) {
        printMoneyCalculation(ns, serverName, debug);
        const growThreads = cyclesCount * ratio;
        const weakThreads = freeTreadCount.total - cyclesCount * ratio;
        log(ns, `Maxing out with ${growThreads} grow threads`, debug);
        log(ns, `Maxing out with ${weakThreads} weaken threads`, debug);
        executeRemoteGrow(ns, serverName, growThreads, 1);
        executeRemoteWeak(ns, serverName, weakThreads, 1);
        const weakenTime = ns.getWeakenTime(serverName);
        await ns.sleep(weakenTime + 10);
        serverCurrentMoney = ns.getServerMoneyAvailable(serverName);
    }
    printMoneyCalculation(ns, serverName, debug);
    const serverMinSecLevel = ns.getServerMinSecurityLevel(serverName);
    let serverCurrentSecLevel = ns.getServerSecurityLevel(serverName);
    while (serverCurrentSecLevel > serverMinSecLevel) {
        printSecurityCalculation(ns, serverName, debug);
        executeRemoteWeak(ns, serverName, freeTreadCount.total, 1);
        const weakenTime = ns.getWeakenTime(serverName);
        await ns.sleep(weakenTime + 10);
        serverCurrentSecLevel = ns.getServerSecurityLevel(serverName);
    }
    printSecurityCalculation(ns, serverName, debug);
    log(ns, `Maxed out server: ${serverName}`, debug);
    logSeparator(ns, debug);
}
function printMoneyCalculation(ns, serverName, debug = false) {
    const serverMaxMoney = ns.getServerMaxMoney(serverName);
    const serverCurrentMoney = ns.getServerMoneyAvailable(serverName);
    log(ns, `Money calc: ${formatMoney(ns, serverCurrentMoney)}/${formatMoney(ns, serverMaxMoney)}`, debug);
    logSeparator(ns, debug);
}
function formatMoney(ns, money) {
    return ns.nFormat(money, '($ 0.00 a)');
}
function printSecurityCalculation(ns, serverName, debug = false) {
    const serverMinSecLevel = ns.getServerMinSecurityLevel(serverName);
    const serverCurrentSecLevel = ns.getServerSecurityLevel(serverName);
    log(ns, `Security calc: ${serverCurrentSecLevel}/${serverMinSecLevel}`, debug);
    logSeparator(ns, debug);
}

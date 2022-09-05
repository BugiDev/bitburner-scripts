import { log, logSeparator, red } from '/util';
import { maxOutServer } from '/util/server';
import { getNetworkMaxThreadCount, getNetworkFreeThreadCount, getServerFreeThreadCount, } from '/util/thread';
import { executeRemoteGrow, executeRemoteHack, executeRemoteWeak } from '/util/remote-exec';
const TIME_STEP = 100;
/** @param {NS} ns */
export async function main(ns) {
    const serverName = ns.args[0];
    const debug = (ns.args[1] || false);
    if (!debug) {
        ns.disableLog('ALL');
        ns.tail();
    }
    logSeparator(ns, debug);
    log(ns, `Calculating threads for: ${serverName}`, debug);
    logSeparator(ns, debug);
    const maxThreads = await getNetworkMaxThreadCount(ns);
    log(ns, `Max threads in network: ${maxThreads.total}`, debug);
    logSeparator(ns, debug);
    await maxOutServer(ns, serverName, debug);
    const HWGWBatchConfig = await getHWGWBatchConfig(ns, serverName, debug);
    log(ns, `Batch config for server: ${serverName}`, debug);
    log(ns, JSON.stringify(HWGWBatchConfig), debug);
    logSeparator(ns, debug);
    if (HWGWBatchConfig) {
        const batchesCount = Math.floor(maxThreads.total / HWGWBatchConfig.total);
        log(ns, `Batch count: ${batchesCount}`, debug);
        const batchPromises = [];
        for (let i = 0; i < batchesCount; i++) {
            batchPromises.push(executeBatch(ns, serverName, HWGWBatchConfig, i * TIME_STEP * 2, i, debug));
        }
        await Promise.all(batchPromises);
    }
}
async function executeBatch(ns, targetServer, HWGWBatchConfig, delay, id, debug = false) {
    await ns.asleep(delay);
    while (true) {
        const freeThreads = getNetworkFreeThreadCount(ns);
        if (freeThreads.total - HWGWBatchConfig.total >= 0) {
            executeRemoteWeak(ns, targetServer, HWGWBatchConfig.weakHack, `${targetServer}-weak-hack-${id}`);
            await ns.asleep(TIME_STEP * 2);
            executeRemoteWeak(ns, targetServer, HWGWBatchConfig.weakGrow, `${targetServer}-weak-grow-${id}`);
            await ns.asleep(HWGWBatchConfig.weakenGrowTime - TIME_STEP - HWGWBatchConfig.growTime);
            executeRemoteGrow(ns, targetServer, HWGWBatchConfig.grow, `${targetServer}-grow-${id}`);
            await ns.asleep(HWGWBatchConfig.growTime - TIME_STEP * 2 - HWGWBatchConfig.hackTime);
            executeRemoteHack(ns, targetServer, HWGWBatchConfig.hack, `${targetServer}-hack-${id}`);
            await ns.asleep(HWGWBatchConfig.hackTime + TIME_STEP * 6);
        }
        else {
            log(ns, red(`No enough free threads, skipping batch ${id}. Free vs needed: ${freeThreads.total} vs ${HWGWBatchConfig.total}`), debug);
            await ns.asleep(HWGWBatchConfig.weakenHackTime + TIME_STEP * 2);
        }
    }
}
// Server needs to be prepared for this one to work
async function getHWGWBatchConfig(ns, serverName, debug = false) {
    const serverMaxMoney = ns.getServerMaxMoney(serverName);
    const threadsToHackHalf = Math.floor(ns.hackAnalyzeThreads(serverName, serverMaxMoney / 2)) || 1;
    const hackTime = ns.getHackTime(serverName);
    const freeTreadCount = getServerFreeThreadCount(ns, 'home');
    if (freeTreadCount < 1) {
        log(ns, 'No enough threads on home to calculate hwgw loop of a server!', debug);
        return null;
    }
    executeRemoteHack(ns, serverName, threadsToHackHalf, 1);
    await ns.sleep(hackTime + 100);
    const securityIncreaseForHack = ns.hackAnalyzeSecurity(threadsToHackHalf, serverName);
    const weakenAnalyze = ns.weakenAnalyze(1);
    const weakenThreadsNeededForHack = Math.ceil(securityIncreaseForHack / weakenAnalyze);
    const weakenHackTime = ns.getWeakenTime(serverName);
    executeRemoteWeak(ns, serverName, weakenThreadsNeededForHack, 1);
    await ns.sleep(weakenHackTime + 100);
    const growTime = ns.getGrowTime(serverName);
    const threadsToGrowHalf = Math.ceil(ns.growthAnalyze(serverName, 2));
    executeRemoteGrow(ns, serverName, threadsToGrowHalf, 1);
    await ns.sleep(growTime + 100);
    const securityIncreaseForGrow = ns.growthAnalyzeSecurity(threadsToGrowHalf);
    const weakenThreadsNeededForGrow = Math.ceil(securityIncreaseForGrow / weakenAnalyze);
    const weakenGrowTime = ns.getWeakenTime(serverName);
    executeRemoteWeak(ns, serverName, weakenThreadsNeededForGrow, 1);
    await ns.sleep(weakenGrowTime + 100);
    return {
        hack: threadsToHackHalf,
        hackTime,
        weakHack: weakenThreadsNeededForHack,
        weakenHackTime,
        grow: threadsToGrowHalf,
        growTime,
        weakGrow: weakenThreadsNeededForGrow,
        weakenGrowTime,
        total: threadsToHackHalf +
            weakenThreadsNeededForHack +
            threadsToGrowHalf +
            weakenThreadsNeededForGrow,
    };
}

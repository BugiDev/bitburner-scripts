import { log, logSeparator, red } from '/util';
import { maxOutServer } from '/util/server';
import { getNetworkMaxThreadCount, getNetworkFreeThreadCount, getServerFreeThreadCount, } from '/util/thread';
import { executeRemoteGrow, executeRemoteHack, executeRemoteWeak } from '/util/remote-exec';
import { hasFormulas } from '/util/home';
export const TIME_STEP = 200;
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
        const delays = calculateDelays(ns, serverName);
        log(ns, `Delays: ${JSON.stringify(delays)}`, debug);
        logSeparator(ns, debug);
        const maxBatchesPerCycle = Math.floor(delays.total / (TIME_STEP * 5));
        const batchesCount = Math.floor(maxThreads.total / HWGWBatchConfig.total);
        const batchesPerCycle = batchesCount >= maxBatchesPerCycle ? maxBatchesPerCycle : batchesCount;
        log(ns, `Batch count: ${batchesPerCycle}`, debug);
        const totalDelayBetweenBatches = TIME_STEP * batchesPerCycle;
        const cycleDelay = delays.total >= totalDelayBetweenBatches ? delays.total - totalDelayBetweenBatches : 0;
        while (true) {
            for (let i = 0; i < batchesPerCycle; i++) {
                await ns.sleep(TIME_STEP * 5);
                executeBatch(ns, serverName, HWGWBatchConfig, i, debug);
                log(ns, `Executed batch ${i}`, debug);
            }
            log(ns, 'Executed batch cycle', debug);
            logSeparator(ns, debug);
            await ns.sleep(cycleDelay);
        }
    }
}
function executeBatch(ns, targetServer, HWGWBatchConfig, id, debug = false) {
    const delays = calculateDelays(ns, targetServer);
    const freeThreads = getNetworkFreeThreadCount(ns);
    if (freeThreads.total - HWGWBatchConfig.total >= 0) {
        executeRemoteWeak(ns, targetServer, HWGWBatchConfig.weakHack, `${targetServer}-weak-hack-${id}`, delays.weakHack);
        executeRemoteWeak(ns, targetServer, HWGWBatchConfig.weakGrow, `${targetServer}-weak-grow-${id}`, delays.weakGrow);
        executeRemoteGrow(ns, targetServer, HWGWBatchConfig.grow, `${targetServer}-grow-${id}`, delays.grow);
        executeRemoteHack(ns, targetServer, HWGWBatchConfig.hack, `${targetServer}-hack-${id}`, delays.hack);
    }
    else {
        log(ns, red(`No enough free threads, skipping batch ${id}. Free vs needed: ${freeThreads.total} vs ${HWGWBatchConfig.total}`), debug);
    }
}
function calculateDelays(ns, serverName) {
    const { hackTime, growTime, weakenTime } = getTimings(ns, serverName);
    return {
        weakHack: 0,
        weakGrow: TIME_STEP * 2,
        grow: weakenTime - growTime + TIME_STEP,
        hack: weakenTime - hackTime - TIME_STEP,
        total: weakenTime,
    };
}
function getTimings(ns, serverName) {
    if (hasFormulas(ns)) {
        const server = ns.getServer(serverName);
        const player = ns.getPlayer();
        return {
            hackTime: ns.formulas.hacking.hackTime(server, player),
            growTime: ns.formulas.hacking.growTime(server, player),
            weakenTime: ns.formulas.hacking.weakenTime(server, player),
        };
    }
    return {
        hackTime: ns.getHackTime(serverName),
        growTime: ns.getGrowTime(serverName),
        weakenTime: ns.getWeakenTime(serverName),
    };
}
// Server needs to be prepared for this one to work
async function getHWGWBatchConfig(ns, serverName, debug = false) {
    const serverMaxMoney = ns.getServerMaxMoney(serverName);
    const threadsToHackHalf = Math.floor(ns.hackAnalyzeThreads(serverName, serverMaxMoney / 2)) || 1;
    const freeTreadCount = getServerFreeThreadCount(ns, 'home');
    const { hackTime, weakenTime, growTime } = getTimings(ns, serverName);
    if (freeTreadCount < 1) {
        log(ns, 'No enough threads on home to calculate hwgw loop of a server!', debug);
        return null;
    }
    executeRemoteHack(ns, serverName, threadsToHackHalf, 1, 0);
    await ns.sleep(hackTime + TIME_STEP);
    const securityIncreaseForHack = ns.hackAnalyzeSecurity(threadsToHackHalf, serverName);
    const weakenAnalyze = ns.weakenAnalyze(1);
    const weakenThreadsNeededForHack = Math.ceil(securityIncreaseForHack / weakenAnalyze);
    executeRemoteWeak(ns, serverName, weakenThreadsNeededForHack, 1, 0);
    await ns.sleep(weakenTime + TIME_STEP);
    const threadsToGrowHalf = Math.ceil(ns.growthAnalyze(serverName, 2));
    executeRemoteGrow(ns, serverName, threadsToGrowHalf, 1, 0);
    await ns.sleep(growTime + TIME_STEP);
    const securityIncreaseForGrow = ns.growthAnalyzeSecurity(threadsToGrowHalf);
    const weakenThreadsNeededForGrow = Math.ceil(securityIncreaseForGrow / weakenAnalyze);
    executeRemoteWeak(ns, serverName, weakenThreadsNeededForGrow, 1, 0);
    await ns.sleep(weakenTime + TIME_STEP);
    return {
        hack: threadsToHackHalf,
        grow: threadsToGrowHalf,
        weakHack: weakenThreadsNeededForHack,
        weakGrow: weakenThreadsNeededForGrow,
        total: threadsToHackHalf +
            weakenThreadsNeededForHack +
            threadsToGrowHalf +
            weakenThreadsNeededForGrow,
    };
}

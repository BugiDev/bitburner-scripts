import {log, logSeparator} from "/scripts/util";
import {maxOutServer} from "/scripts/util/server";
import {CONFIG} from "/scripts/config";
import {getNetworkMaxThreadCount, getServerFreeThreadCount} from "/scripts/util/thread";

/** @param {NS} ns
 * @param debug
 */
export async function main(ns) {
    const serverName = ns.args[0];
    const debug = ns.args[1] || false;
    logSeparator(ns, debug);
    log(ns, `Calculating threads for: ${serverName}`, debug);
    logSeparator(ns, debug);

    const maxThreads = await getNetworkMaxThreadCount(ns);
    const maxThreadsInNetwork = Object.keys(maxThreads).reduce((maxCount, threadsForServer) => {
        return maxCount + maxThreads[threadsForServer];
    }, 0);

    log(ns, `Max threads in network: ${maxThreadsInNetwork}`, debug);
    logSeparator(ns, debug);

    await maxOutServer(ns, serverName, debug);
    const HWGWLoopThreadCount = await getHWGWLoopThreadCount(ns, serverName, debug);
    log(ns, `Threads needed for server: ${serverName}`, debug);
    log(ns, JSON.stringify(HWGWLoopThreadCount), debug);
    logSeparator(ns, debug);
}

// Server needs to be prepared for this one to work
async function getHWGWLoopThreadCount(ns, serverName, debug = false) {
    const serverMaxMoney = await ns.getServerMaxMoney(serverName);
    const threadsToHackHalf = Math.floor(await ns.hackAnalyzeThreads(serverName, serverMaxMoney / 2)) || 1;
    const hackTime = ns.getHackTime(serverName);
    const freeTreadCount = getServerFreeThreadCount(ns, 'home');

    if (freeTreadCount < 1) {
        log(ns, 'No enough threads on home to calculate hwgw loop of a server!', debug);
        return;
    }

    if (freeTreadCount >= threadsToHackHalf) {
        await ns.run(CONFIG.loopMalwareHack, threadsToHackHalf, serverName, threadsToHackHalf);
        await ns.sleep(hackTime + 10);
    } else {
        let homeThreadsToHack = threadsToHackHalf;
        while (homeThreadsToHack > 0) {
            if (homeThreadsToHack - freeTreadCount >= 0) {
                await ns.run(CONFIG.loopMalwareHack, freeTreadCount, serverName, freeTreadCount);
            } else {
                await ns.run(CONFIG.loopMalwareHack, homeThreadsToHack, serverName, homeThreadsToHack);
            }
            homeThreadsToHack -= freeTreadCount;
            await ns.sleep(hackTime + 10);
        }
    }

    const securityIncreaseForHack = await ns.hackAnalyzeSecurity(threadsToHackHalf, serverName);
    const weakenAnalyze = await ns.weakenAnalyze(1);
    const weakenThreadsNeededForHack = Math.ceil(securityIncreaseForHack / weakenAnalyze);

    const threadsToGrowHalf = Math.ceil(await ns.growthAnalyze(serverName, 2));

    const securityIncreaseForGrow = await ns.growthAnalyzeSecurity(threadsToGrowHalf);
    const weakenThreadsNeededForGrow = Math.ceil(securityIncreaseForGrow / weakenAnalyze);

    return {
        hack: threadsToHackHalf,
        weakHack: weakenThreadsNeededForHack,
        grow: threadsToGrowHalf,
        weakGrow: weakenThreadsNeededForGrow,
        total: threadsToHackHalf + weakenThreadsNeededForHack + threadsToGrowHalf + weakenThreadsNeededForGrow
    }
}
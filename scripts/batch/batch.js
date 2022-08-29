import {log, logSeparator} from "/scripts/util";
import {maxOutServer} from "/scripts/util/server";
import {CONFIG} from "/scripts/config";
import {getNetworkMaxThreadCount, getNetworkFreeThreadCount, getServerFreeThreadCount} from "/scripts/util/thread";

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
    const HWGWBatchConfig = await getHWGWBatchConfig(ns, serverName, debug);
    log(ns, `Batch config for server: ${serverName}`, debug);
    log(ns, JSON.stringify(HWGWBatchConfig), debug);
    logSeparator(ns, debug);

    const batchesCount = Math.floor(maxThreadsInNetwork / HWGWBatchConfig.total);
    const batchPromises = [];
    for (var i = 0; i < batchesCount; i++) {
        batchPromises.push(executeBatch(ns, HWGWBatchConfig));
    }

    await Promise.all(batchPromises)
}

async function executeBatch(ns, HWGWBatchConfig) {
    while (true) {
        await executeRemoteWeak(ns, HWGWBatchConfig.weakHack);
        await ns.sleep(200);
        await executeRemoteWeak(ns, HWGWBatchConfig.weakGrow);
        await ns.sleep(HWGWBatchConfig.weakenGrowTime - 100 - HWGWBatchConfig.growTime);
        await executeRemoteGrow(ns, HWGWBatchConfig.grow);
        await ns.sleep(HWGWBatchConfig.growTime - 200 - HWGWBatchConfig.hackTime);
        await executeRemoteHack(ns, HWGWBatchConfig.hack);
        await ns.sleep(HWGWBatchConfig.hackTime + 300);
    }
}

async function executeRemoteScript(ns, scriptPath, threadCount) {
    const freeThreads = getNetworkFreeThreadCount(ns);
    const normalizedFreeThreads = Object.keys(freeThreads).reduce((normalized, server) => {
        const reducedValue = {
            ...normalized
        };
        if (freeThreads[server] > 0) {
            reducedValue[server] = freeThreads[server];
        }
        return reducedValue;
    }, {});
    let threadsToSpread = threadCount;

    for (const serverName in normalizedFreeThreads) {
        const serverThreads = normalizedFreeThreads[serverName];
        if (serverThreads >= threadsToSpread) {
            await ns.exec(scriptPath, serverName, threadsToSpread, serverName, threadsToSpread);
            break;
        } else {
            await ns.exec(scriptPath, serverName, serverThreads, serverName, serverThreads);
            threadsToSpread -= serverThreads;
        }
    }
}

async function executeRemoteWeak(ns, threadCount) {
    await executeRemoteScript(ns, CONFIG.loopMalwareWeaken, threadCount);
}

async function executeRemoteHack(ns, threadCount) {
    await executeRemoteScript(ns, CONFIG.loopMalwareHack, threadCount);
}

async function executeRemoteGrow(ns, threadCount) {
    await executeRemoteScript(ns, CONFIG.loopMalwareGrow, threadCount);
}

// Server needs to be prepared for this one to work
async function getHWGWBatchConfig(ns, serverName, debug = false) {
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
    const weakenHackTime = ns.getWeakenTime(serverName);

    if (freeTreadCount >= weakenThreadsNeededForHack) {
        await ns.run(CONFIG.loopMalwareWeaken, weakenThreadsNeededForHack, serverName, weakenThreadsNeededForHack);
        await ns.sleep(weakenHackTime + 10);
    } else {
        let homeThreadsToWeakenAfterHack = weakenThreadsNeededForHack;
        while (homeThreadsToWeakenAfterHack > 0) {
            if (homeThreadsToWeakenAfterHack - freeTreadCount >= 0) {
                await ns.run(CONFIG.loopMalwareWeaken, freeTreadCount, serverName, freeTreadCount);
            } else {
                await ns.run(CONFIG.loopMalwareWeaken, homeThreadsToWeakenAfterHack, serverName, homeThreadsToWeakenAfterHack);
            }
            homeThreadsToWeakenAfterHack -= freeTreadCount;
            await ns.sleep(weakenHackTime + 10);
        }
    }

    const growTime = ns.getGrowTime(serverName);
    const threadsToGrowHalf = Math.ceil(await ns.growthAnalyze(serverName, 2));
    if (freeTreadCount >= threadsToGrowHalf) {
        await ns.run(CONFIG.loopMalwareGrow, threadsToGrowHalf, serverName, threadsToGrowHalf);
        await ns.sleep(growTime + 10);
    } else {
        let homeThreadsToGrow = threadsToGrowHalf;
        while (homeThreadsToGrow > 0) {
            if (homeThreadsToGrow - freeTreadCount >= 0) {
                await ns.run(CONFIG.loopMalwareGrow, freeTreadCount, serverName, freeTreadCount);
            } else {
                await ns.run(CONFIG.loopMalwareGrow, homeThreadsToGrow, serverName, homeThreadsToGrow);
            }
            homeThreadsToGrow -= freeTreadCount;
            await ns.sleep(growTime + 10);
        }
    }

    const securityIncreaseForGrow = await ns.growthAnalyzeSecurity(threadsToGrowHalf);
    const weakenThreadsNeededForGrow = Math.ceil(securityIncreaseForGrow / weakenAnalyze);
    const weakenGrowTime = ns.getWeakenTime(serverName);

    if (freeTreadCount >= weakenThreadsNeededForGrow) {
        await ns.run(CONFIG.loopMalwareWeaken, weakenThreadsNeededForGrow, serverName, weakenThreadsNeededForGrow);
        await ns.sleep(weakenGrowTime + 10);
    } else {
        let homeThreadsToWeakenAfterGrow = weakenThreadsNeededForGrow;
        while (homeThreadsToWeakenAfterGrow > 0) {
            if (homeThreadsToWeakenAfterGrow - freeTreadCount >= 0) {
                await ns.run(CONFIG.loopMalwareWeaken, freeTreadCount, serverName, freeTreadCount);
            } else {
                await ns.run(CONFIG.loopMalwareWeaken, homeThreadsToWeakenAfterGrow, serverName, homeThreadsToWeakenAfterGrow);
            }
            homeThreadsToWeakenAfterGrow -= freeTreadCount;
            await ns.sleep(weakenGrowTime + 10);
        }
    }

    return {
        hack: threadsToHackHalf,
        hackTime,
        weakHack: weakenThreadsNeededForHack,
        weakenHackTime,
        grow: threadsToGrowHalf,
        growTime,
        weakGrow: weakenThreadsNeededForGrow,
        weakenGrowTime,
        total: threadsToHackHalf + weakenThreadsNeededForHack + threadsToGrowHalf + weakenThreadsNeededForGrow
    }
}
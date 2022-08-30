import { log, logSeparator } from '/util';
import { maxOutServer } from '/util/server';
import { CONFIG } from '/config';
import { getNetworkMaxThreadCount, getNetworkFreeThreadCount, getServerFreeThreadCount, } from '/util/thread';
/** @param {NS} ns */
export async function main(ns) {
    const serverName = ns.args[0];
    const debug = (ns.args[1] || false);
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
    if (HWGWBatchConfig) {
        const batchesCount = Math.floor(maxThreadsInNetwork / HWGWBatchConfig.total);
        log(ns, `Batch count: ${batchesCount}`, debug);
        const batchPromises = [];
        for (let i = 0; i < batchesCount; i++) {
            batchPromises.push(executeBatch(ns, serverName, HWGWBatchConfig, i * 1000));
        }
        await Promise.all(batchPromises);
    }
}
async function executeBatch(ns, targetServer, HWGWBatchConfig, delay) {
    await ns.asleep(delay);
    while (true) {
        await executeRemoteWeak(ns, targetServer, HWGWBatchConfig.weakHack);
        await ns.asleep(200);
        await executeRemoteWeak(ns, targetServer, HWGWBatchConfig.weakGrow);
        await ns.asleep(HWGWBatchConfig.weakenGrowTime - 100 - HWGWBatchConfig.growTime);
        await executeRemoteGrow(ns, targetServer, HWGWBatchConfig.grow);
        await ns.asleep(HWGWBatchConfig.growTime - 200 - HWGWBatchConfig.hackTime);
        await executeRemoteHack(ns, targetServer, HWGWBatchConfig.hack);
        await ns.asleep(HWGWBatchConfig.hackTime + 300);
    }
}
async function executeRemoteScript(ns, scriptPath, targetServer, threadCount) {
    const freeThreads = getNetworkFreeThreadCount(ns);
    const normalizedFreeThreads = Object.keys(freeThreads).reduce((normalized, server) => {
        const reducedValue = {
            ...normalized,
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
            ns.exec(scriptPath, serverName, threadsToSpread, targetServer, threadsToSpread);
            break;
        }
        else {
            ns.exec(scriptPath, serverName, serverThreads, targetServer, serverThreads);
            threadsToSpread -= serverThreads;
        }
    }
}
async function executeRemoteWeak(ns, targetServer, threadCount) {
    await executeRemoteScript(ns, CONFIG.loopMalwareWeaken, targetServer, threadCount);
}
async function executeRemoteHack(ns, targetServer, threadCount) {
    await executeRemoteScript(ns, CONFIG.loopMalwareHack, targetServer, threadCount);
}
async function executeRemoteGrow(ns, targetServer, threadCount) {
    await executeRemoteScript(ns, CONFIG.loopMalwareGrow, targetServer, threadCount);
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
    if (freeTreadCount >= threadsToHackHalf) {
        ns.run(CONFIG.loopMalwareHack, threadsToHackHalf, serverName, threadsToHackHalf);
        await ns.sleep(hackTime + 10);
    }
    else {
        let homeThreadsToHack = threadsToHackHalf;
        while (homeThreadsToHack > 0) {
            if (homeThreadsToHack - freeTreadCount >= 0) {
                ns.run(CONFIG.loopMalwareHack, freeTreadCount, serverName, freeTreadCount);
            }
            else {
                ns.run(CONFIG.loopMalwareHack, homeThreadsToHack, serverName, homeThreadsToHack);
            }
            homeThreadsToHack -= freeTreadCount;
            await ns.sleep(hackTime + 10);
        }
    }
    const securityIncreaseForHack = ns.hackAnalyzeSecurity(threadsToHackHalf, serverName);
    const weakenAnalyze = ns.weakenAnalyze(1);
    const weakenThreadsNeededForHack = Math.ceil(securityIncreaseForHack / weakenAnalyze);
    const weakenHackTime = ns.getWeakenTime(serverName);
    if (freeTreadCount >= weakenThreadsNeededForHack) {
        ns.run(CONFIG.loopMalwareWeaken, weakenThreadsNeededForHack, serverName, weakenThreadsNeededForHack);
        await ns.sleep(weakenHackTime + 10);
    }
    else {
        let homeThreadsToWeakenAfterHack = weakenThreadsNeededForHack;
        while (homeThreadsToWeakenAfterHack > 0) {
            if (homeThreadsToWeakenAfterHack - freeTreadCount >= 0) {
                ns.run(CONFIG.loopMalwareWeaken, freeTreadCount, serverName, freeTreadCount);
            }
            else {
                ns.run(CONFIG.loopMalwareWeaken, homeThreadsToWeakenAfterHack, serverName, homeThreadsToWeakenAfterHack);
            }
            homeThreadsToWeakenAfterHack -= freeTreadCount;
            await ns.sleep(weakenHackTime + 10);
        }
    }
    const growTime = ns.getGrowTime(serverName);
    const threadsToGrowHalf = Math.ceil(ns.growthAnalyze(serverName, 2));
    if (freeTreadCount >= threadsToGrowHalf) {
        ns.run(CONFIG.loopMalwareGrow, threadsToGrowHalf, serverName, threadsToGrowHalf);
        await ns.sleep(growTime + 10);
    }
    else {
        let homeThreadsToGrow = threadsToGrowHalf;
        while (homeThreadsToGrow > 0) {
            if (homeThreadsToGrow - freeTreadCount >= 0) {
                ns.run(CONFIG.loopMalwareGrow, freeTreadCount, serverName, freeTreadCount);
            }
            else {
                ns.run(CONFIG.loopMalwareGrow, homeThreadsToGrow, serverName, homeThreadsToGrow);
            }
            homeThreadsToGrow -= freeTreadCount;
            await ns.sleep(growTime + 10);
        }
    }
    const securityIncreaseForGrow = ns.growthAnalyzeSecurity(threadsToGrowHalf);
    const weakenThreadsNeededForGrow = Math.ceil(securityIncreaseForGrow / weakenAnalyze);
    const weakenGrowTime = ns.getWeakenTime(serverName);
    if (freeTreadCount >= weakenThreadsNeededForGrow) {
        ns.run(CONFIG.loopMalwareWeaken, weakenThreadsNeededForGrow, serverName, weakenThreadsNeededForGrow);
        await ns.sleep(weakenGrowTime + 10);
    }
    else {
        let homeThreadsToWeakenAfterGrow = weakenThreadsNeededForGrow;
        while (homeThreadsToWeakenAfterGrow > 0) {
            if (homeThreadsToWeakenAfterGrow - freeTreadCount >= 0) {
                ns.run(CONFIG.loopMalwareWeaken, freeTreadCount, serverName, freeTreadCount);
            }
            else {
                ns.run(CONFIG.loopMalwareWeaken, homeThreadsToWeakenAfterGrow, serverName, homeThreadsToWeakenAfterGrow);
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
        total: threadsToHackHalf +
            weakenThreadsNeededForHack +
            threadsToGrowHalf +
            weakenThreadsNeededForGrow,
    };
}

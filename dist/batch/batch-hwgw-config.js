import { CONFIG } from '/config';
import { log } from '/util/log';
import { getNetworkFreeThreadCount } from '/util/thread';
import { validateServerName } from '/util/validation';
/** @param {NS} ns
 * @param debug
 */
export async function main(ns) {
    const serverName = ns.args[0];
    validateServerName(serverName);
    const freeNetworkThreads = getNetworkFreeThreadCount(ns);
    const config = getBatchHWGWConfig(ns, serverName, freeNetworkThreads);
    log(ns, 'Batch HWGW config', true);
    log(ns, `${JSON.stringify(config)}`, true);
}
function getServerMaxBatches(ns, serverName) {
    const weakenTime = ns.getWeakenTime(serverName);
    const cycleUsableTime = weakenTime - CONFIG.timeStep;
    return Math.floor(cycleUsableTime / (CONFIG.timeStep * 4)) + 1;
}
export function getBatchHWGWConfig(ns, serverName, freeNetworkThreads) {
    const batchConfigs = [];
    const maxBatches = getServerMaxBatches(ns, serverName);
    const serverMaxMoney = ns.getServerMaxMoney(serverName);
    for (let i = 1; i <= 9; i++) {
        const config = calculateBatchHWGWConfig(ns, freeNetworkThreads, serverName, maxBatches, serverMaxMoney, i * 0.1);
        if (config) {
            batchConfigs.push(config);
        }
    }
    if (batchConfigs.length === 0) {
        return null;
    }
    return batchConfigs.reduce((reducedConfig, config) => {
        if (config.hackAmount > reducedConfig.hackAmount) {
            return config;
        }
        return reducedConfig;
    }, { hackAmount: 0 });
}
function calculateBatchHWGWConfig(ns, freeNetworkThreads, serverName, maxBatches, maxMoney, hackRatio) {
    const freeThreadsClone = _.cloneDeep(freeNetworkThreads);
    const hackAmount = maxMoney * hackRatio;
    const threadsToHack = Math.floor(ns.hackAnalyzeThreads(serverName, hackAmount)) || 1;
    const securityIncreaseForHack = ns.hackAnalyzeSecurity(threadsToHack, serverName);
    const weakenAnalyze = ns.weakenAnalyze(1);
    const weakenThreadsNeededForHack = Math.ceil(securityIncreaseForHack / weakenAnalyze);
    const threadsToGrow = Math.ceil(ns.growthAnalyze(serverName, Math.ceil(maxMoney / (maxMoney - hackAmount))));
    const securityIncreaseForGrow = ns.growthAnalyzeSecurity(threadsToGrow);
    const weakenThreadsNeededForGrow = Math.ceil(securityIncreaseForGrow / weakenAnalyze);
    //BATCH ITERATION
    const batchConfig = [];
    let threadCount = freeNetworkThreads;
    for (let b = 0; b < maxBatches; b++) {
        const singleBatchConfig = calculateSingleBatchConfig(threadCount, threadsToHack, threadsToGrow, weakenThreadsNeededForHack, weakenThreadsNeededForGrow);
        if (singleBatchConfig) {
            batchConfig.push(singleBatchConfig.config);
            threadCount = singleBatchConfig.threadCount;
        }
        else {
            break;
        }
    }
    if (batchConfig.length === 0) {
        return null;
    }
    return {
        batches: batchConfig,
        hackRatio,
        hackAmount: hackAmount * batchConfig.length,
        networkThreads: freeThreadsClone,
    };
}
function calculateSingleBatchConfig(freeNetworkThreads, threadsToHack, threadsToGrow, weakenThreadsNeededForGrow, weakenThreadsNeededForHack) {
    const freeThreadsClone = _.cloneDeep(freeNetworkThreads);
    // Early return no free threads in total, no need to check individual threads
    if (freeThreadsClone.total <
        threadsToHack + threadsToGrow + weakenThreadsNeededForGrow + weakenThreadsNeededForHack) {
        return null;
    }
    const hackServer = _.findKey(freeThreadsClone.threads, (threadCount) => threadCount >= threadsToHack) ||
        null;
    if (hackServer) {
        freeThreadsClone.threads[hackServer] -= threadsToHack;
    }
    const growServer = _.findKey(freeThreadsClone.threads, (threadCount) => threadCount >= threadsToGrow) ||
        null;
    if (growServer) {
        freeThreadsClone.threads[growServer] -= threadsToGrow;
    }
    const weakHackServer = _.findKey(freeThreadsClone.threads, (threadCount) => threadCount >= weakenThreadsNeededForHack) || null;
    if (weakHackServer) {
        freeThreadsClone.threads[weakHackServer] -= weakenThreadsNeededForHack;
    }
    const weakGrowServer = _.findKey(freeThreadsClone.threads, (threadCount) => threadCount >= weakenThreadsNeededForGrow) || null;
    if (weakGrowServer) {
        freeThreadsClone.threads[weakGrowServer] -= weakenThreadsNeededForGrow;
    }
    if (hackServer && growServer && weakHackServer && weakGrowServer) {
        freeThreadsClone.total -=
            threadsToHack + threadsToGrow + weakenThreadsNeededForHack + weakenThreadsNeededForGrow;
        return {
            threadCount: freeThreadsClone,
            config: {
                hackServer,
                threadsToHack,
                growServer,
                threadsToGrow,
                weakHackServer,
                weakenThreadsNeededForHack,
                weakGrowServer,
                weakenThreadsNeededForGrow,
            },
        };
    }
    return null;
}

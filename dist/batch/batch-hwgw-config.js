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
    const config = getBatchHWGWConfig(ns, serverName);
    log(ns, 'Batch HWGW config', true);
    log(ns, `${JSON.stringify(config)}`, true);
}
function getServerMaxBatches(ns, serverName) {
    const weakenTime = ns.getWeakenTime(serverName);
    const cycleUsableTime = weakenTime - CONFIG.timeStep;
    return Math.floor(cycleUsableTime / (CONFIG.timeStep * 4)) + 1;
}
export function getBatchHWGWConfig(ns, serverName) {
    const batchConfigs = [];
    for (let i = 0.9; i >= 0.1; i -= 0.1) {
        const config = calculateBatchHWGWConfig(ns, serverName, i);
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
function calculateBatchHWGWConfig(ns, serverName, hackRatio = 0.9) {
    const maxBatches = getServerMaxBatches(ns, serverName);
    const serverMaxMoney = ns.getServerMaxMoney(serverName);
    const hackAmount = serverMaxMoney * hackRatio;
    const threadsToHack = Math.floor(ns.hackAnalyzeThreads(serverName, hackAmount)) || 1;
    const securityIncreaseForHack = ns.hackAnalyzeSecurity(threadsToHack, serverName);
    const weakenAnalyze = ns.weakenAnalyze(1);
    const weakenThreadsNeededForHack = Math.ceil(securityIncreaseForHack / weakenAnalyze);
    const threadsToGrow = Math.ceil(ns.growthAnalyze(serverName, Math.ceil(serverMaxMoney / (serverMaxMoney - hackAmount))));
    const securityIncreaseForGrow = ns.growthAnalyzeSecurity(threadsToGrow);
    const weakenThreadsNeededForGrow = Math.ceil(securityIncreaseForGrow / weakenAnalyze);
    const freeNetworkThreads = getNetworkFreeThreadCount(ns);
    //BATCH ITERATION
    const batchConfig = [];
    for (let b = 0; b < maxBatches; b++) {
        // Early return no free threads in total, no need to check individual threads
        if (freeNetworkThreads.total <
            threadsToHack + threadsToGrow + weakenThreadsNeededForGrow + weakenThreadsNeededForHack) {
            break;
        }
        // const entries = Object.entries(freeNetworkThreads.threads);
        let hackServer = null;
        let growServer = null;
        let weakHackServer = null;
        let weakGrowServer = null;
        // Check if enough hacking threads
        for (const key in freeNetworkThreads.threads) {
            if (freeNetworkThreads.threads[key] >= threadsToHack) {
                hackServer = key;
                freeNetworkThreads.threads[key] = freeNetworkThreads.threads[key] - threadsToHack;
                freeNetworkThreads.total -= threadsToHack;
                break;
            }
        }
        // Check if enough grow threads
        for (const key in freeNetworkThreads.threads) {
            if (freeNetworkThreads.threads[key] >= threadsToGrow) {
                growServer = key;
                freeNetworkThreads.threads[key] = freeNetworkThreads.threads[key] - threadsToGrow;
                freeNetworkThreads.total -= threadsToGrow;
                break;
            }
        }
        // Check if enough threads for weaken after hack
        for (const key in freeNetworkThreads.threads) {
            if (freeNetworkThreads.threads[key] >= weakenThreadsNeededForHack) {
                weakHackServer = key;
                freeNetworkThreads.threads[key] =
                    freeNetworkThreads.threads[key] - weakenThreadsNeededForHack;
                freeNetworkThreads.total -= weakenThreadsNeededForHack;
                break;
            }
        }
        // Check if enough threads for weaken after grow
        for (const key in freeNetworkThreads.threads) {
            if (freeNetworkThreads.threads[key] >= weakenThreadsNeededForGrow) {
                weakGrowServer = key;
                freeNetworkThreads.threads[key] =
                    freeNetworkThreads.threads[key] - weakenThreadsNeededForGrow;
                freeNetworkThreads.total -= weakenThreadsNeededForGrow;
                break;
            }
        }
        if (hackServer && growServer && weakHackServer && weakGrowServer) {
            batchConfig.push({
                hackServer,
                threadsToHack,
                growServer,
                threadsToGrow,
                weakHackServer,
                weakenThreadsNeededForHack,
                weakGrowServer,
                weakenThreadsNeededForGrow,
            });
        }
    }
    if (batchConfig.length === 0) {
        return null;
    }
    return {
        batches: batchConfig,
        hackRatio,
        hackAmount,
    };
}

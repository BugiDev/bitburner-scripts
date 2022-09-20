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
    for (let b = 0; b < maxBatches; b++) {
        // Early return no free threads in total, no need to check individual threads
        if (freeThreadsClone.total <
            threadsToHack + threadsToGrow + weakenThreadsNeededForGrow + weakenThreadsNeededForHack) {
            break;
        }
        const hackServer = _.findKey(freeThreadsClone.threads, (threadCount) => threadCount >= threadsToHack) ||
            null;
        const growServer = _.findKey(freeThreadsClone.threads, (threadCount) => threadCount >= threadsToGrow) ||
            null;
        const weakHackServer = _.findKey(freeThreadsClone.threads, (threadCount) => threadCount >= weakenThreadsNeededForHack) || null;
        const weakGrowServer = _.findKey(freeThreadsClone.threads, (threadCount) => threadCount >= weakenThreadsNeededForGrow) || null;
        // freeThreadsClone.threads[key] = freeThreadsClone.threads[key] - threadsToHack;
        // freeThreadsClone.total -= threadsToHack;
        if (hackServer && growServer && weakHackServer && weakGrowServer) {
            freeThreadsClone.threads[hackServer] -= threadsToHack;
            freeThreadsClone.threads[growServer] -= threadsToHack;
            freeThreadsClone.threads[weakHackServer] -= threadsToHack;
            freeThreadsClone.threads[weakGrowServer] -= threadsToHack;
            freeThreadsClone.total -=
                threadsToHack + threadsToGrow + weakenThreadsNeededForHack + weakenThreadsNeededForGrow;
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
        hackAmount: hackAmount * batchConfig.length,
        networkThreads: freeThreadsClone,
    };
}

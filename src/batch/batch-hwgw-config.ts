import { NS } from '@ns';
import { CONFIG } from '/config';
import { log } from '/util/log';
import { getNetworkFreeThreadCount, ThreadCount } from '/util/thread';
import { validateServerName } from '/util/validation';

/** @param {NS} ns
 * @param debug
 */
export async function main(ns: NS) {
  const serverName = ns.args[0] as string;
  validateServerName(serverName);

  const freeNetworkThreads = getNetworkFreeThreadCount(ns);
  const config = getBatchHWGWConfig(ns, serverName, freeNetworkThreads);
  log(ns, 'Batch HWGW config', true);
  log(ns, `${JSON.stringify(config)}`, true);
}

function getServerMaxBatches(ns: NS, serverName: string) {
  const weakenTime = ns.getWeakenTime(serverName);
  const cycleUsableTime = weakenTime - CONFIG.timeStep;
  return Math.floor(cycleUsableTime / (CONFIG.timeStep * 4)) + 1;
}

export interface SingleBatchHWGWConfig {
  hackServer: string;
  threadsToHack: number;
  growServer: string;
  threadsToGrow: number;
  weakHackServer: string;
  weakenThreadsNeededForHack: number;
  weakGrowServer: string;
  weakenThreadsNeededForGrow: number;
}

export interface BatchHWGWConfig {
  batches: SingleBatchHWGWConfig[];
  hackAmount: number;
  hackRatio: number;
  networkThreads: ThreadCount;
}

export function getBatchHWGWConfig(
  ns: NS,
  serverName: string,
  freeNetworkThreads: ThreadCount
): BatchHWGWConfig | null {
  const batchConfigs: Array<BatchHWGWConfig> = [];
  const maxBatches = getServerMaxBatches(ns, serverName);
  const serverMaxMoney = ns.getServerMaxMoney(serverName);

  for (let i = 1; i <= 9; i++) {
    const config = calculateBatchHWGWConfig(
      ns,
      freeNetworkThreads,
      serverName,
      maxBatches,
      serverMaxMoney,
      i * 0.1
    );
    if (config) {
      batchConfigs.push(config);
    }
  }

  if (batchConfigs.length === 0) {
    return null;
  }

  return batchConfigs.reduce(
    (reducedConfig: BatchHWGWConfig, config: BatchHWGWConfig) => {
      if (config.hackAmount > reducedConfig.hackAmount) {
        return config;
      }
      return reducedConfig;
    },
    { hackAmount: 0 } as BatchHWGWConfig
  );
}

function calculateBatchHWGWConfig(
  ns: NS,
  freeNetworkThreads: ThreadCount,
  serverName: string,
  maxBatches: number,
  maxMoney: number,
  hackRatio: number
) {
  const freeThreadsClone = _.cloneDeep(freeNetworkThreads);
  const hackAmount = maxMoney * hackRatio;
  const threadsToHack = Math.floor(ns.hackAnalyzeThreads(serverName, hackAmount)) || 1;

  const securityIncreaseForHack = ns.hackAnalyzeSecurity(threadsToHack, serverName);
  const weakenAnalyze = ns.weakenAnalyze(1);
  const weakenThreadsNeededForHack = Math.ceil(securityIncreaseForHack / weakenAnalyze);

  const threadsToGrow = Math.ceil(
    ns.growthAnalyze(serverName, Math.ceil(maxMoney / (maxMoney - hackAmount)))
  );

  const securityIncreaseForGrow = ns.growthAnalyzeSecurity(threadsToGrow);
  const weakenThreadsNeededForGrow = Math.ceil(securityIncreaseForGrow / weakenAnalyze);

  //BATCH ITERATION

  const batchConfig: SingleBatchHWGWConfig[] = [];
  for (let b = 0; b < maxBatches; b++) {
    // Early return no free threads in total, no need to check individual threads
    if (
      freeThreadsClone.total <
      threadsToHack + threadsToGrow + weakenThreadsNeededForGrow + weakenThreadsNeededForHack
    ) {
      break;
    }

    let hackServer: string | null = null;
    let growServer: string | null = null;
    let weakHackServer: string | null = null;
    let weakGrowServer: string | null = null;

    // Check if enough hacking threads
    for (const key in freeThreadsClone.threads) {
      if (freeThreadsClone.threads[key] >= threadsToHack) {
        hackServer = key;
        freeThreadsClone.threads[key] = freeThreadsClone.threads[key] - threadsToHack;
        freeThreadsClone.total -= threadsToHack;
        break;
      }
    }

    // Check if enough grow threads
    for (const key in freeThreadsClone.threads) {
      if (freeThreadsClone.threads[key] >= threadsToGrow) {
        growServer = key;
        freeThreadsClone.threads[key] = freeThreadsClone.threads[key] - threadsToGrow;
        freeThreadsClone.total -= threadsToGrow;
        break;
      }
    }

    // Check if enough threads for weaken after hack
    for (const key in freeThreadsClone.threads) {
      if (freeThreadsClone.threads[key] >= weakenThreadsNeededForHack) {
        weakHackServer = key;
        freeThreadsClone.threads[key] = freeThreadsClone.threads[key] - weakenThreadsNeededForHack;
        freeThreadsClone.total -= weakenThreadsNeededForHack;
        break;
      }
    }

    // Check if enough threads for weaken after grow
    for (const key in freeThreadsClone.threads) {
      if (freeThreadsClone.threads[key] >= weakenThreadsNeededForGrow) {
        weakGrowServer = key;
        freeThreadsClone.threads[key] = freeThreadsClone.threads[key] - weakenThreadsNeededForGrow;
        freeThreadsClone.total -= weakenThreadsNeededForGrow;
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
    hackAmount: hackAmount * batchConfig.length,
    networkThreads: freeThreadsClone,
  };
}

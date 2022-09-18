import { NS } from '@ns';
import { CONFIG } from '/config';
import { log } from '/util/log';
import { getNetworkFreeThreadCount } from '/util/thread';
import { validateServerName } from '/util/validation';

/** @param {NS} ns
 * @param debug
 */
export async function main(ns: NS) {
  const serverName = ns.args[0] as string;
  validateServerName(serverName);

  const config = getBatchHWGWConfig(ns, serverName);
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
  hackRatio: number;
}

export function getBatchHWGWConfig(
  ns: NS,
  serverName: string,
  hackRatio = 0.9
): BatchHWGWConfig | null {
  if (hackRatio === 0) {
    return null;
  }

  const maxBatches = getServerMaxBatches(ns, serverName);

  const serverMaxMoney = ns.getServerMaxMoney(serverName);

  const hackAmount = serverMaxMoney * hackRatio;
  const threadsToHack = Math.floor(ns.hackAnalyzeThreads(serverName, hackAmount)) || 1;

  const securityIncreaseForHack = ns.hackAnalyzeSecurity(threadsToHack, serverName);
  const weakenAnalyze = ns.weakenAnalyze(1);
  const weakenThreadsNeededForHack = Math.ceil(securityIncreaseForHack / weakenAnalyze);

  const threadsToGrow = Math.ceil(
    ns.growthAnalyze(serverName, serverMaxMoney / (serverMaxMoney - hackAmount))
  );

  const securityIncreaseForGrow = ns.growthAnalyzeSecurity(threadsToGrow);
  const weakenThreadsNeededForGrow = Math.ceil(securityIncreaseForGrow / weakenAnalyze);

  const freeNetworkThreads = getNetworkFreeThreadCount(ns);

  //BATCH ITERATION

  const batchConfig: SingleBatchHWGWConfig[] = [];
  for (let b = 0; b < maxBatches; b++) {
    // Early return no free threads in total, no need to check individual threads
    if (
      freeNetworkThreads.total <
      threadsToHack + threadsToGrow + weakenThreadsNeededForGrow + weakenThreadsNeededForHack
    ) {
      break;
    }

    // const entries = Object.entries(freeNetworkThreads.threads);

    let hackServer: string | null = null;
    let growServer: string | null = null;
    let weakHackServer: string | null = null;
    let weakGrowServer: string | null = null;

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

  if (batchConfig.length > 0) {
    return {
      batches: batchConfig,
      hackRatio,
    };
  } else {
    return getBatchHWGWConfig(ns, serverName, hackRatio - 0.1);
  }
}
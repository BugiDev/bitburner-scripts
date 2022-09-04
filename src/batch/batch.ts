import { NS } from '@ns';
import { log, logSeparator } from '/util';
import { maxOutServer } from '/util/server';
import { getNetworkMaxThreadCount, getServerFreeThreadCount } from '/util/thread';
import { executeRemoteGrow, executeRemoteHack, executeRemoteWeak } from '/util/remote-exec';

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.disableLog('ALL');
  const serverName = ns.args[0] as string;
  const debug = (ns.args[1] || false) as boolean;
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
      batchPromises.push(executeBatch(ns, serverName, HWGWBatchConfig, i * 1000, i));
    }

    await Promise.all(batchPromises);
  }
}

async function executeBatch(
  ns: NS,
  targetServer: string,
  HWGWBatchConfig: HWGWBatchConfigInterface,
  delay: number,
  id: string | number
) {
  await ns.asleep(delay);
  while (true) {
    executeRemoteWeak(ns, targetServer, HWGWBatchConfig.weakHack, id);
    await ns.asleep(400);
    executeRemoteWeak(ns, targetServer, HWGWBatchConfig.weakGrow, id);
    await ns.asleep(HWGWBatchConfig.weakenGrowTime - 200 - HWGWBatchConfig.growTime);
    executeRemoteGrow(ns, targetServer, HWGWBatchConfig.grow, id);
    await ns.asleep(HWGWBatchConfig.growTime - 400 - HWGWBatchConfig.hackTime);
    executeRemoteHack(ns, targetServer, HWGWBatchConfig.hack, id);
    await ns.asleep(HWGWBatchConfig.hackTime + 600);
  }
}

interface HWGWBatchConfigInterface {
  hack: number;
  hackTime: number;
  weakHack: number;
  weakenHackTime: number;
  grow: number;
  growTime: number;
  weakGrow: number;
  weakenGrowTime: number;
  total: number;
}

// Server needs to be prepared for this one to work
async function getHWGWBatchConfig(
  ns: NS,
  serverName: string,
  debug = false
): Promise<HWGWBatchConfigInterface | null> {
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
    total:
      threadsToHackHalf +
      weakenThreadsNeededForHack +
      threadsToGrowHalf +
      weakenThreadsNeededForGrow,
  };
}

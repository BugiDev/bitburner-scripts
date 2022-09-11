import { NS } from '@ns';
import { bold, boldRed, formatMoney, log, logSeparator, red } from '/util';
import { maxOutServer } from '/util/server';
import {
  getNetworkMaxThreadCount,
  getNetworkFreeThreadCount,
  getServerFreeThreadCount,
} from '/util/thread';
import { executeRemoteGrow, executeRemoteHack, executeRemoteWeak } from '/util/remote-exec';
import { hasFormulas } from '/util/home';
import { CONFIG } from '/config';

/** @param {NS} ns */
export async function main(ns: NS) {
  const serverName = ns.args[0] as string;
  const debug = (ns.args[1] || false) as boolean;
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
    const cycleUsableTime = delays.total - CONFIG.timeStep;
    const maxBatchesPerCycle = Math.floor(cycleUsableTime / (CONFIG.timeStep * 5)) + 1;
    const batchesCount = Math.floor(maxThreads.total / HWGWBatchConfig.total);
    const batchesPerCycle = batchesCount >= maxBatchesPerCycle ? maxBatchesPerCycle : batchesCount;
    log(ns, `Batch count: ${batchesPerCycle}`, debug);
    log(
      ns,
      `Total threads used vs max: ${bold(`${HWGWBatchConfig.total * batchesPerCycle}`)} / ${
        maxThreads.total
      }`,
      debug
    );
    const totalDelayBetweenBatches = CONFIG.timeStep * batchesPerCycle;
    const cycleDelay =
      delays.total >= totalDelayBetweenBatches ? delays.total - totalDelayBetweenBatches : 0;
    let prevIncome = 0;

    while (true) {
      if (batchesPerCycle === 1) {
        executeBatch(ns, serverName, HWGWBatchConfig, 1, debug);
        await ns.sleep(delays.total + CONFIG.timeStep);
      } else {
        for (let i = 0; i < batchesPerCycle; i++) {
          await ns.sleep(CONFIG.timeStep * 5);
          executeBatch(ns, serverName, HWGWBatchConfig, i, debug);
        }
      }

      const scriptIncome = ns.getScriptIncome('/batch/batch.js', 'home', ...ns.args);
      if (scriptIncome >= prevIncome) {
        log(ns, bold(`Script income: ${formatMoney(ns, scriptIncome)}`), debug);
      } else {
        log(ns, boldRed(`Script income: ${formatMoney(ns, scriptIncome)}`), debug);
      }
      prevIncome = scriptIncome;
      logSeparator(ns, debug);
      await ns.sleep(cycleDelay);
    }
  }
}

function executeBatch(
  ns: NS,
  targetServer: string,
  HWGWBatchConfig: HWGWBatchConfigInterface,
  id: string | number,
  debug = false
) {
  const delays = calculateDelays(ns, targetServer);
  const freeThreads = getNetworkFreeThreadCount(ns);
  if (freeThreads.total - HWGWBatchConfig.total >= 0) {
    executeRemoteWeak(
      ns,
      targetServer,
      HWGWBatchConfig.weakHack,
      `${targetServer}-weak-hack-${id}`,
      delays.weakHack
    );
    executeRemoteWeak(
      ns,
      targetServer,
      HWGWBatchConfig.weakGrow,
      `${targetServer}-weak-grow-${id}`,
      delays.weakGrow
    );
    executeRemoteGrow(
      ns,
      targetServer,
      HWGWBatchConfig.grow,
      `${targetServer}-grow-${id}`,
      delays.grow
    );
    executeRemoteHack(
      ns,
      targetServer,
      HWGWBatchConfig.hack,
      `${targetServer}-hack-${id}`,
      delays.hack
    );
  } else {
    log(
      ns,
      red(
        `No enough free threads, skipping batch ${id}. Free vs needed: ${freeThreads.total} vs ${HWGWBatchConfig.total}`
      ),
      debug
    );
  }
}

function calculateDelays(ns: NS, serverName: string) {
  const { hackTime, growTime, weakenTime } = getTimings(ns, serverName);
  return {
    weakHack: 0,
    weakGrow: CONFIG.timeStep * 2,
    grow: weakenTime - growTime + CONFIG.timeStep,
    hack: weakenTime - hackTime - CONFIG.timeStep,
    total: weakenTime,
  };
}

function getTimings(ns: NS, serverName: string) {
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

interface HWGWBatchConfigInterface {
  hack: number;
  weakHack: number;
  grow: number;
  weakGrow: number;
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
  const freeTreadCount = getServerFreeThreadCount(ns, 'home');
  const { hackTime, weakenTime, growTime } = getTimings(ns, serverName);

  if (freeTreadCount < 1) {
    log(ns, 'No enough threads on home to calculate hwgw loop of a server!', debug);
    return null;
  }

  executeRemoteHack(ns, serverName, threadsToHackHalf, 1, 0);
  await ns.sleep(hackTime + CONFIG.timeStep);

  const securityIncreaseForHack = ns.hackAnalyzeSecurity(threadsToHackHalf, serverName);
  const weakenAnalyze = ns.weakenAnalyze(1);
  const weakenThreadsNeededForHack = Math.ceil(securityIncreaseForHack / weakenAnalyze);

  executeRemoteWeak(ns, serverName, weakenThreadsNeededForHack, 1, 0);
  await ns.sleep(weakenTime + CONFIG.timeStep);

  // Adding + 10% because of bad calculation
  // const threadsToGrowHalf =
  //   Math.ceil(ns.growthAnalyze(serverName, 2)) + Math.ceil(ns.growthAnalyze(serverName, 2) * 0.1);
  const threadsToGrowHalf = Math.ceil(ns.growthAnalyze(serverName, 2));

  executeRemoteGrow(ns, serverName, threadsToGrowHalf, 1, 0);
  await ns.sleep(growTime + CONFIG.timeStep);

  const securityIncreaseForGrow = ns.growthAnalyzeSecurity(threadsToGrowHalf);
  const weakenThreadsNeededForGrow = Math.ceil(securityIncreaseForGrow / weakenAnalyze);

  executeRemoteWeak(ns, serverName, weakenThreadsNeededForGrow, 1, 0);
  await ns.sleep(weakenTime + CONFIG.timeStep);

  return {
    hack: threadsToHackHalf,
    grow: threadsToGrowHalf,
    weakHack: weakenThreadsNeededForHack,
    weakGrow: weakenThreadsNeededForGrow,
    total:
      threadsToHackHalf +
      weakenThreadsNeededForHack +
      threadsToGrowHalf +
      weakenThreadsNeededForGrow,
  };
}

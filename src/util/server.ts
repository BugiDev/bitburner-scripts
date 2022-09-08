import { NS } from '@ns';
import { getNetworkFreeThreadCount } from '/util/thread';
import { bold, log, logSeparator } from '/util';
import { executeRemoteGrow, executeRemoteWeak } from '/util/remote-exec';
import { CONFIG } from '/config';

export async function maxOutServer(ns: NS, serverName: string, debug = false) {
  ns.disableLog('ALL');
  log(ns, `Maxing out server: ${serverName}`, debug);
  logSeparator(ns, debug);

  const freeTreadCount = getNetworkFreeThreadCount(ns);

  if (freeTreadCount.total < 1) {
    log(ns, 'No enough threads to max out the server!', debug);
    return;
  }

  const serverMaxMoney = ns.getServerMaxMoney(serverName);
  let serverCurrentMoney = ns.getServerMoneyAvailable(serverName);

  while (serverCurrentMoney < serverMaxMoney) {
    printMoneyCalculation(ns, serverName, debug);
    const currentMoneyRatio = serverMaxMoney / serverCurrentMoney;
    const growThreads = ns.growthAnalyze(serverName, currentMoneyRatio);
    const growTime = ns.getGrowTime(serverName);

    if (growThreads >= freeTreadCount.total) {
      log(ns, `Maxing out with ${growThreads} grow threads`, debug);
      executeRemoteGrow(ns, serverName, freeTreadCount.total, 1, 0);
      await ns.sleep(growTime + CONFIG.timeStep);
    } else {
      const weakThreads = freeTreadCount.total - growThreads;
      log(ns, `Maxing out with ${growThreads} grow threads`, debug);
      log(ns, `Maxing out with ${weakThreads} weaken threads`, debug);
      executeRemoteGrow(ns, serverName, growThreads, 1, 0);
      executeRemoteWeak(ns, serverName, weakThreads, 1, 0);
      const weakenTime = ns.getWeakenTime(serverName);
      await ns.sleep(weakenTime + CONFIG.timeStep);
    }
    serverCurrentMoney = ns.getServerMoneyAvailable(serverName);
  }
  printMoneyCalculation(ns, serverName, debug);

  const serverMinSecLevel = ns.getServerMinSecurityLevel(serverName);
  let serverCurrentSecLevel = ns.getServerSecurityLevel(serverName);

  while (serverCurrentSecLevel > serverMinSecLevel) {
    printSecurityCalculation(ns, serverName, debug);
    executeRemoteWeak(ns, serverName, freeTreadCount.total, 1, 0);
    const weakenTime = ns.getWeakenTime(serverName);
    await ns.sleep(weakenTime + CONFIG.timeStep);
    serverCurrentSecLevel = ns.getServerSecurityLevel(serverName);
  }
  printSecurityCalculation(ns, serverName, debug);
  log(ns, bold(`Maxed out server: ${serverName}`), debug);
  logSeparator(ns, debug);
}

function printMoneyCalculation(ns: NS, serverName: string, debug = false) {
  const serverMaxMoney = ns.getServerMaxMoney(serverName);
  const serverCurrentMoney = ns.getServerMoneyAvailable(serverName);
  log(
    ns,
    `Money calc: ${formatMoney(ns, serverCurrentMoney)}/${formatMoney(ns, serverMaxMoney)}`,
    debug
  );
  logSeparator(ns, debug);
}

function formatMoney(ns: NS, money: number) {
  return ns.nFormat(money, '($ 0.00 a)');
}

function printSecurityCalculation(ns: NS, serverName: string, debug = false) {
  const serverMinSecLevel = ns.getServerMinSecurityLevel(serverName);
  const serverCurrentSecLevel = ns.getServerSecurityLevel(serverName);

  log(ns, `Security calc: ${serverCurrentSecLevel}/${serverMinSecLevel}`, debug);
  logSeparator(ns, debug);
}

import { NS } from '@ns';
import { getNetworkFreeThreadCount } from '/util/thread';
import { log, logSeparator } from '/util';
import { executeRemoteGrow, executeRemoteWeak } from '/util/remote-exec';

export async function maxOutServer(ns: NS, serverName: string, debug = false) {
  ns.disableLog('ALL');
  const freeTreadCount = getNetworkFreeThreadCount(ns);

  if (freeTreadCount.total < 1) {
    log(ns, 'No enough threads to max out the server!', debug);
    return;
  }

  const serverMaxMoney = ns.getServerMaxMoney(serverName);
  let serverCurrentMoney = ns.getServerMoneyAvailable(serverName);

  while (serverCurrentMoney < serverMaxMoney) {
    printMoneyCalculation(ns, serverName, debug);
    executeRemoteGrow(ns, serverName, freeTreadCount.total, 1);
    const growTime = ns.getGrowTime(serverName);
    await ns.sleep(growTime + 10);
    serverCurrentMoney = ns.getServerMoneyAvailable(serverName);
  }
  printMoneyCalculation(ns, serverName, debug);

  const serverMinSecLevel = ns.getServerMinSecurityLevel(serverName);
  let serverCurrentSecLevel = ns.getServerSecurityLevel(serverName);

  while (serverCurrentSecLevel > serverMinSecLevel) {
    printSecurityCalculation(ns, serverName, debug);
    executeRemoteWeak(ns, serverName, freeTreadCount.total, 1);
    const weakenTime = ns.getWeakenTime(serverName);
    await ns.sleep(weakenTime + 10);
    serverCurrentSecLevel = ns.getServerSecurityLevel(serverName);
  }
  printSecurityCalculation(ns, serverName, debug);
  log(ns, `Maxed out server: ${serverName}`, debug);
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

import { NS } from '@ns';
import {
  getMaxThreadServerInNetwork,
  getNetworkFreeThreadCount,
  getServerFreeThreadCount,
} from '/util/thread';
import { CONFIG } from '/config';
import { getHackedServersInNetwork, walkWholeNetwork } from '/util/network';
import {
  bold,
  log,
  logSeparator,
  red,
  printMoneyCalculation,
  printSecurityCalculation,
} from './log';
import { executeGrowScript, executeWeakScript } from '/util/remote-exec';

export async function maxOutServer(ns: NS, serverName: string, debug = false) {
  ns.disableLog('ALL');
  log(ns, `Maxing out server: ${bold(serverName)}`, debug);
  printMoneyCalculation(ns, serverName, debug);
  printSecurityCalculation(ns, serverName, debug);
  logSeparator(ns, debug);

  const freeTreadCount = getNetworkFreeThreadCount(ns);

  if (freeTreadCount.total < 1) {
    log(ns, red('No enough threads to max out the server!'), debug);
    return;
  }

  const maxThreadsOnServer = getMaxThreadServerInNetwork(ns);
  if (!maxThreadsOnServer) {
    log(ns, red('No free thread server to max out the server!'), debug);
    return;
  }

  const serverMaxMoney = ns.getServerMaxMoney(serverName);
  let serverCurrentMoney = ns.getServerMoneyAvailable(serverName);

  const serverMinSecLevel = ns.getServerMinSecurityLevel(serverName);
  let serverCurrentSecLevel = ns.getServerSecurityLevel(serverName);

  while (serverCurrentSecLevel > serverMinSecLevel || serverCurrentMoney < serverMaxMoney) {
    const weakenTime = ns.getWeakenTime(serverName);
    const weakenAnalyze = ns.weakenAnalyze(1);
    const secDifference = serverCurrentSecLevel - serverMinSecLevel;

    // Reduce security level
    if (secDifference > 0) {
      const weakDiffThreads = Math.ceil(secDifference / weakenAnalyze);

      const weakThreads =
        weakDiffThreads >= maxThreadsOnServer.freeThreadCount
          ? maxThreadsOnServer.freeThreadCount
          : weakDiffThreads;

      const availableWeakenServers = await findServerToExecuteThreads(ns, weakThreads);
      if (availableWeakenServers.length < 1) {
        log(ns, red('No available server to execute weak!'), debug);
        break;
      }
      const weakServer = availableWeakenServers[0];

      log(ns, `Reducing security lvl with ${weakThreads} weak threads`, debug);
      executeWeakScript(ns, weakServer, serverName, weakThreads, `max-out-${serverName}`, 0);
    }

    const moneyDifference = serverMaxMoney - serverCurrentMoney;
    // Increase money and reduce security
    if (moneyDifference > 0) {
      const currentMoneyRatio = serverMaxMoney / serverCurrentMoney;
      const maxGrowThreadsNeeded = Math.ceil(ns.growthAnalyze(serverName, currentMoneyRatio));
      const growThreads =
        maxGrowThreadsNeeded >= maxThreadsOnServer.freeThreadCount
          ? maxThreadsOnServer.freeThreadCount
          : maxGrowThreadsNeeded;

      const securityIncreaseForGrow = ns.growthAnalyzeSecurity(growThreads);
      const weakenThreadsNeededForGrow = Math.ceil(securityIncreaseForGrow / weakenAnalyze);

      const availableGrowthServers = await findServerToExecuteThreads(ns, growThreads);
      if (availableGrowthServers.length < 1) {
        log(ns, red('No available server to execute growth!'), debug);
        break;
      }
      const growServer = availableGrowthServers[0];

      const availableWeakenGrowServers = await findServerToExecuteThreads(
        ns,
        weakenThreadsNeededForGrow
      );
      if (availableWeakenGrowServers.length < 1) {
        log(ns, red('No available server to execute weak!'), debug);
        break;
      }
      const weakGrowServer = availableWeakenGrowServers[0];

      log(ns, `Increasing money with ${growThreads} grow threads`, debug);
      log(ns, `Reducing security for grow with ${weakenThreadsNeededForGrow} weak threads`, debug);

      executeGrowScript(ns, growServer, serverName, growThreads, `max-out-${serverName}`, 0);
      executeWeakScript(
        ns,
        weakGrowServer,
        serverName,
        weakenThreadsNeededForGrow,
        `max-out-${serverName}`,
        0
      );
    }

    await ns.sleep(weakenTime + CONFIG.timeStep);

    serverCurrentSecLevel = ns.getServerSecurityLevel(serverName);
    serverCurrentMoney = ns.getServerMoneyAvailable(serverName);

    printMoneyCalculation(ns, serverName, debug);
    printSecurityCalculation(ns, serverName, debug);
    logSeparator(ns, debug);
  }
}

async function findServerToExecuteThreads(
  ns: NS,
  threadCount: number,
  debug = false
): Promise<string[]> {
  const servers: string[] = [];
  await walkWholeNetwork(
    ns,
    (_callbackNS, serverName: string) => {
      if (getServerFreeThreadCount(ns, serverName) >= threadCount) {
        servers.push(serverName);
      }
    },
    debug
  );
  return servers;
}

export async function maxOutAllHackedServers(ns: NS, debug = false) {
  log(ns, 'Maxing out all hacked servers...', debug);
  logSeparator(ns, debug);
  const hackedServers = await getHackedServersInNetwork(ns, debug);
  const sortedServers = hackedServers.sort((a, b) => {
    if (a.requiredHackingSkill < b.requiredHackingSkill) {
      return -1;
    }
    if (a.requiredHackingSkill > b.requiredHackingSkill) {
      return 1;
    }
    return 0;
  });

  for (const server of sortedServers) {
    await maxOutServer(ns, server.hostname, debug);
  }
  log(ns, 'Maxed out all hacked servers!', debug);
  logSeparator(ns, debug);
}

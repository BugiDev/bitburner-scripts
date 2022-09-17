import { NS } from '@ns';
import { getServerFreeThreadCount } from '/util/thread';
import { CONFIG } from '/config';
import { log, red } from '/util';
import { walkWholeNetwork } from '/util/network';

function executeScript(
  ns: NS,
  scriptPath: string,
  hostServer: string,
  targetServer: string,
  threadCount: number,
  id: string | number,
  delay: number
) {
  const pid = ns.exec(scriptPath, hostServer, threadCount, targetServer, threadCount, delay, id);
  if (pid === 0) {
    log(ns, red(`Could not execute: ${scriptPath} on: ${hostServer} for target: ${targetServer}!`));
  }
}

export async function executeRemoteWeak(
  ns: NS,
  targetServer: string,
  threadCount: number,
  id: string | number,
  delay: number
) {
  const availableWeakenServer = await findServerToExecuteThreads(ns, threadCount);
  executeScript(
    ns,
    CONFIG.loopMalwareWeaken,
    availableWeakenServer,
    targetServer,
    threadCount,
    id,
    delay
  );
}

export async function executeRemoteHack(
  ns: NS,
  targetServer: string,
  threadCount: number,
  id: string | number,
  delay: number
) {
  const availableHackServer = await findServerToExecuteThreads(ns, threadCount);
  executeScript(
    ns,
    CONFIG.loopMalwareHack,
    availableHackServer,
    targetServer,
    threadCount,
    id,
    delay
  );
}

export async function executeRemoteGrow(
  ns: NS,
  targetServer: string,
  threadCount: number,
  id: string | number,
  delay: number
) {
  const availableGrowServer = await findServerToExecuteThreads(ns, threadCount);
  executeScript(
    ns,
    CONFIG.loopMalwareGrow,
    availableGrowServer,
    targetServer,
    threadCount,
    id,
    delay
  );
}

export function executeWeakScript(
  ns: NS,
  hostServer: string,
  targetServer: string,
  threadCount: number,
  id: string | number,
  delay: number
) {
  executeScript(ns, CONFIG.loopMalwareWeaken, hostServer, targetServer, threadCount, id, delay);
}

export function executeHackScript(
  ns: NS,
  hostServer: string,
  targetServer: string,
  threadCount: number,
  id: string | number,
  delay: number
) {
  executeScript(ns, CONFIG.loopMalwareHack, hostServer, targetServer, threadCount, id, delay);
}

export function executeGrowScript(
  ns: NS,
  hostServer: string,
  targetServer: string,
  threadCount: number,
  id: string | number,
  delay: number
) {
  executeScript(ns, CONFIG.loopMalwareGrow, hostServer, targetServer, threadCount, id, delay);
}

async function findServerToExecuteThreads(
  ns: NS,
  threadCount: number,
  debug = false
): Promise<string> {
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
  if (servers.length === 0) {
    throw new Error(`No available server to execute ${threadCount} treads!`);
  }
  return servers[0];
}

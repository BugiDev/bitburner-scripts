import { NS } from '@ns';
import { getNetworkFreeThreadCount, ThreadCount } from '/util/thread';
import { CONFIG } from '/config';
import { log, red } from '/util';

function executeRemoteScript(
  ns: NS,
  scriptPath: string,
  targetServer: string,
  threadCount: number,
  id: string | number,
  delay: number
) {
  const freeThreads: ThreadCount = getNetworkFreeThreadCount(ns);
  let threadsToSpread = threadCount;

  for (const serverName in freeThreads.threads) {
    if (freeThreads.threads[serverName] > 0) {
      const serverThreads = freeThreads.threads[serverName];
      if (serverThreads >= threadsToSpread) {
        if (ns.isRunning(scriptPath, serverName, targetServer, threadsToSpread, id)) {
          log(ns, red(`Previous batch didn't finish for ${scriptPath} in batch ${id}!`));
          break;
        }
        const execPid = ns.exec(
          scriptPath,
          serverName,
          threadsToSpread,
          targetServer,
          threadsToSpread,
          delay,
          id
        );
        if (execPid === 0) {
          log(ns, red(`Could not execute ${scriptPath} in batch ${id}!`));
        }
        threadsToSpread = 0;
        break;
      } else {
        if (ns.isRunning(scriptPath, serverName, targetServer, serverThreads, id)) {
          log(ns, red(`Previous batch didn't finish for ${scriptPath} in batch ${id}!`));
          break;
        }
        const execPid = ns.exec(
          scriptPath,
          serverName,
          serverThreads,
          targetServer,
          serverThreads,
          delay,
          id
        );
        if (execPid === 0) {
          log(ns, red(`Could not execute ${scriptPath} in batch ${id}!`));
        }
        threadsToSpread -= serverThreads;
      }
    }
  }

  if (threadsToSpread > 0) {
    log(ns, red(`Not all threads executed for ${scriptPath} in batch ${id}!`));
  }
}

export function executeRemoteWeak(
  ns: NS,
  targetServer: string,
  threadCount: number,
  id: string | number,
  delay: number
) {
  executeRemoteScript(ns, CONFIG.loopMalwareWeaken, targetServer, threadCount, id, delay);
}

export function executeRemoteHack(
  ns: NS,
  targetServer: string,
  threadCount: number,
  id: string | number,
  delay: number
) {
  executeRemoteScript(ns, CONFIG.loopMalwareHack, targetServer, threadCount, id, delay);
}

export function executeRemoteGrow(
  ns: NS,
  targetServer: string,
  threadCount: number,
  id: string | number,
  delay: number
) {
  executeRemoteScript(ns, CONFIG.loopMalwareGrow, targetServer, threadCount, id, delay);
}

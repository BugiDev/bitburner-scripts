import { NS } from '@ns';

export function getServerMaxThreadCount(ns: NS, serverName: string): number {
  if (ns.hasRootAccess(serverName)) {
    const scriptRam = 1.75;
    const serverMaxRam = ns.getServerMaxRam(serverName);
    return Math.floor(serverMaxRam / scriptRam);
  }
  return 0;
}

export function getServerFreeThreadCount(ns: NS, serverName: string): number {
  if (ns.hasRootAccess(serverName)) {
    const scriptRam = 1.75;
    const serverMaxRam = ns.getServerMaxRam(serverName);
    const serverUsedRam = ns.getServerUsedRam(serverName);
    const serverFreeRam = serverMaxRam - serverUsedRam;
    return Math.floor(serverFreeRam / scriptRam);
  }
  return 0;
}

export interface ThreadCount {
  [key: string]: number;
}

function getNetworkThreadCount(
  ns: NS,
  startServer: string,
  targetServer: string,
  callback: (ns: NS, serverName: string) => number
): ThreadCount {
  const servers = ns.scan(targetServer).filter((server) => server !== startServer);
  if (servers.length > 0) {
    return servers.reduce((maxThreadsCount, serverName): ThreadCount => {
      const reducedValue = {
        ...maxThreadsCount,
        ...getNetworkThreadCount(ns, targetServer, serverName, callback),
      };
      reducedValue[serverName] = callback(ns, serverName);
      return reducedValue;
    }, {} as ThreadCount);
  }

  return {};
}

export function getNetworkFreeThreadCount(ns: NS): ThreadCount {
  return getNetworkThreadCount(ns, 'home', 'home', getServerFreeThreadCount);
}

export function getNetworkMaxThreadCount(ns: NS): ThreadCount {
  return getNetworkThreadCount(ns, 'home', 'home', getServerMaxThreadCount);
}

export function getNetworkFreeServers(ns: NS, startServer: string, targetServer: string): string[] {
  const servers = ns.scan(targetServer).filter((server) => server !== startServer);
  if (servers.length > 0) {
    return servers.reduce((freeServers, serverName) => {
      const reducedValue = [...freeServers, ...getNetworkFreeServers(ns, targetServer, serverName)];
      if (ns.hasRootAccess(serverName)) {
        const ps = ns.ps(serverName);
        if (ps.length === 0) {
          reducedValue.push(serverName);
        }
      }
      return reducedValue;
    }, [] as string[]);
  }

  return [];
}

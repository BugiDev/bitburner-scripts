import { NS, Server } from '@ns';

export async function walkNetwork(
  ns: NS,
  startServer: string,
  targetServer: string,
  callback: (ns: NS, serverName: string, debug: boolean) => void,
  debug = false
) {
  const servers = ns.scan(targetServer).filter((server) => server !== startServer);
  if (servers.length > 0) {
    for (const serverName of servers) {
      await callback(ns, serverName, debug);
      await walkNetwork(ns, targetServer, serverName, callback, debug);
    }
  }
}

export async function walkWholeNetwork(
  ns: NS,
  callback: (ns: NS, serverName: string, debug: boolean) => void,
  debug = false
) {
  await walkNetwork(ns, 'home', 'home', callback, debug);
}

export async function getAllServersInNetwork(ns: NS, debug = false): Promise<Server[]> {
  const servers: Server[] = [];
  await walkWholeNetwork(
    ns,
    (_callbackNS, serverName: string) => {
      servers.push(ns.getServer(serverName));
    },
    debug
  );
  return servers;
}

export interface HackedServer extends Server {
  hackChance: number;
}

export async function getHackedServersInNetwork(ns: NS, debug = false): Promise<HackedServer[]> {
  const servers: HackedServer[] = [];
  await walkWholeNetwork(
    ns,
    (_callbackNS, serverName: string) => {
      if (ns.hasRootAccess(serverName)) {
        const hackedServer: HackedServer = {
          ...ns.getServer(serverName),
          hackChance: ns.hackAnalyzeChance(serverName),
        };
        servers.push(hackedServer);
      }
    },
    debug
  );
  return servers;
}

export async function getNotHackedServersInNetwork(ns: NS, debug = false): Promise<Server[]> {
  const servers: Server[] = [];
  await walkWholeNetwork(
    ns,
    (_callbackNS, serverName: string) => {
      if (!ns.hasRootAccess(serverName)) {
        const hackedServer: Server = {
          ...ns.getServer(serverName),
        };
        servers.push(hackedServer);
      }
    },
    debug
  );
  return servers;
}

export async function getHackedServersWithNoBackdoorInNetwork(
  ns: NS,
  debug = false
): Promise<string[]> {
  const servers: string[] = [];
  await walkWholeNetwork(
    ns,
    (_callbackNS, serverName: string) => {
      const server = ns.getServer(serverName);
      if (!server.purchasedByPlayer && server.hasAdminRights && !server.backdoorInstalled) {
        servers.push(serverName);
      }
    },
    debug
  );
  return servers;
}

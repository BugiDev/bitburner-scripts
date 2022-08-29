import { NS } from '@ns';

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

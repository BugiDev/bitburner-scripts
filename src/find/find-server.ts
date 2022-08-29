import { NS } from '@ns';

interface ServerPaths {
  [key: string]: string;
}

/** @param {NS} ns */
export async function main(ns: NS) {
  const serverName = ns.args[0] as string;
  const serverPaths: ServerPaths = findServer(ns, 'home', 'home');
  ns.tprint(serverPaths[serverName]);
  ns.tprint('Copied path to clipboard!');
  await navigator.clipboard.writeText(serverPaths[serverName]);
}

export function findServer(
  ns: NS,
  startServer: string,
  nextServer: string,
  parentPath = ''
): ServerPaths {
  let serverPath = 'home;';
  if (nextServer !== 'home') {
    serverPath = `${parentPath} connect ${nextServer};`;
  }
  const servers = ns.scan(nextServer).filter((server) => server !== startServer);
  if (servers.length > 0) {
    const results = servers.reduce((combinedPaths, serverName): ServerPaths => {
      return {
        ...combinedPaths,
        ...findServer(ns, nextServer, serverName, serverPath),
      };
    }, {});
    return {
      [nextServer]: serverPath,
      ...results,
    };
  }

  return { [nextServer]: serverPath };
}

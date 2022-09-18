import { AutocompleteData, NS } from '@ns';
import { log } from '/util/log';
import { validateServerName } from '/util/validation';

interface ServerPaths {
  [key: string]: string;
}

export function autocomplete(data: AutocompleteData) {
  return [...data.servers]; // This script autocompletes the list of servers.
}

/** @param {NS} ns */
export async function main(ns: NS) {
  const serverName = ns.args[0] as string;
  const debug = (ns.args[1] || true) as boolean;
  validateServerName(serverName);

  const serverPaths: ServerPaths = findServer(ns, 'home', 'home');
  log(ns, serverPaths[serverName], debug);
  log(ns, 'Copied path to clipboard!', debug);
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

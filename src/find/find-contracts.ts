import { NS } from '@ns';
import { walkWholeNetwork } from '/util/network';
import { log } from '/util/log';

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
  const debug = (ns.args[0] || false) as boolean;
  await walkWholeNetwork(ns, findContract, debug);
}

function findContract(ns: NS, serverName: string, debug = false) {
  if (ns.hasRootAccess(serverName)) {
    const hasContract = ns.ls(serverName, 'contract').length > 0;
    if (hasContract) {
      log(ns, `Found contract on server: ${serverName}`, debug);
    }
  }
}

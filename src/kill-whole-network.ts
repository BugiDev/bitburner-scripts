import { NS } from '@ns';
import { walkNetwork } from '/util/network';

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
  await walkNetwork(ns, 'home', 'home', killScriptsOnServer);
}

function killScriptsOnServer(ns: NS, serverName: string, _debug: boolean) {
  ns.killall(serverName);
}

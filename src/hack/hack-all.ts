import { NS } from '@ns';
import { walkWholeNetwork } from '/util/network.js';
import { hackServer } from '/hack/hack';

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
  const debug = (ns.args[0] || false) as boolean;
  await hackAll(ns, debug);
}

export async function hackAll(ns: NS, debug = false) {
  await walkWholeNetwork(ns, hackServer, debug);
}

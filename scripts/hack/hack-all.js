import {walkWholeNetwork} from "/scripts/util/network.js";
import {hackServer} from "/scripts/hack/hack.js";

/** @param {NS} ns */
export async function main(ns) {
    const debug = ns.args[0] || false;
    await hackAll(ns, debug);
}

export async function hackAll(ns, debug = false) {
    await walkWholeNetwork(ns, hackServer, debug)
}
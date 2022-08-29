import {HWGWLoop} from "scripts/loop/loop-hwgw";

/** @param {NS} ns */
export async function main(ns) {
    const debug = ns.args[0] || false;

    const servers = [];

    for (const serverName of servers) {
        await HWGWLoop(ns, serverName, debug)
    }
}
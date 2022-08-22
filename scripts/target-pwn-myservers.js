import { printSeparator, printHeader, tPrint } from '/scripts/util';
import {pwnAllServers, pwnServer} from '/scripts/pwn';

/**
 * @param {NS} ns
 */
export async function main(ns) {
    const malwareTarget = ns.args[0];
    const silent = ns.args[1] || false;
    printHeader(ns, `Pwning all my servers for target ${malwareTarget}...`, silent);
    await pwnMyServers(ns, malwareTarget, silent);
}

/**
 * @param {NS} ns
 * @param malwareForServer
 * @param silent
 */
export async function pwnMyServers(ns, malwareForServer, silent) {
    const servers = ns.getPurchasedServers();
    for (const serverName of servers) {
        await pwnServer(ns, serverName, malwareForServer || serverName, silent);
    }
}
import { printSeparator, printHeader, tPrint } from '/scripts/util';
import { CONFIG } from '/scripts/config';

/**
 * @param {NS} ns
 * @param serverName
 * @param silent
 */
export async function installMalwareOnServer(ns, serverName, silent = false) {
    await ns.killall(serverName);
    await ns.scp(CONFIG.malwareFile, serverName);
    tPrint(ns,`Copied malware on: ${serverName}`, silent);
}

/**
 * @param {NS} ns
 * @param hostServerName
 * @param targetServerName
 * @param threadCount
 * @param silent
 */
export async function executeMalware(ns, hostServerName, targetServerName, threadCount = 1, silent = false) {
    await ns.exec(CONFIG.malwareFile, hostServerName, threadCount, targetServerName, threadCount)
    tPrint(ns, `Started ${threadCount} processes on: ${targetServerName}`, silent)
}
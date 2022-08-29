import { log } from '/util';
/** @param {NS} ns */
export async function main(ns) {
    const serverName = ns.args[0];
    hackServer(ns, serverName);
}
export function hackServer(ns, serverName) {
    if (!ns.hasRootAccess(serverName) &&
        ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(serverName) &&
        getCrackablePortsNumber(ns) >= ns.getServerNumPortsRequired(serverName)) {
        openPorts(ns, serverName);
        ns.nuke(serverName);
        log(ns, `Hacked new server: ${serverName}`, true);
    }
}
function openPorts(ns, serverName) {
    if (ns.fileExists('BruteSSH.exe')) {
        ns.brutessh(serverName);
    }
    if (ns.fileExists('FTPCrack.exe')) {
        ns.ftpcrack(serverName);
    }
    if (ns.fileExists('relaySMTP.exe')) {
        ns.relaysmtp(serverName);
    }
    if (ns.fileExists('HTTPWorm.exe')) {
        ns.httpworm(serverName);
    }
    if (ns.fileExists('SQLInject.exe')) {
        ns.sqlinject(serverName);
    }
}
function getCrackablePortsNumber(ns) {
    let crackablePortsNumber = 0;
    if (ns.fileExists('BruteSSH.exe')) {
        crackablePortsNumber++;
    }
    if (ns.fileExists('FTPCrack.exe')) {
        crackablePortsNumber++;
    }
    if (ns.fileExists('relaySMTP.exe')) {
        crackablePortsNumber++;
    }
    if (ns.fileExists('HTTPWorm.exe')) {
        crackablePortsNumber++;
    }
    if (ns.fileExists('SQLInject.exe')) {
        crackablePortsNumber++;
    }
    return crackablePortsNumber;
}

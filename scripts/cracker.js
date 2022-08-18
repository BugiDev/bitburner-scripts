// Script used to crack servers
import { tPrint } from '/scripts/util';

export async function main(ns) {
    const serverName = ns.args[0];
    const silent = ns.args[1] || false;
    await crackServer(ns, serverName, silent);
}

/**
 * @param {NS} ns
 * @param serverName
 * @param silent
 */
export async function crackServer(ns, serverName, silent = false) {
    tPrint(ns, `Cracking server: ${serverName} ...`, silent);
    if (ns.hasRootAccess(serverName)) {
        tPrint(ns, 'Already has root access.', silent);
        return true;
    }

    if (
        ns.getServerRequiredHackingLevel(serverName) > ns.getHackingLevel() ||
        ns.getServerNumPortsRequired(serverName) > getCrackablePortsNumber(ns)
    ) {
        tPrint(ns, `Server can't be cracked: ${serverName}`, silent);
        return false;
    }

    if (ns.getServerNumPortsRequired(serverName) > 0) {
        tPrint(ns, 'Opening ports...', silent);
        openPorts(ns, serverName);
    }

    ns.nuke(serverName);
    tPrint(ns, `New Server Cracked: ${serverName}!`, silent);
    return true;
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
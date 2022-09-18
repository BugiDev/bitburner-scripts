import { NS } from '@ns';
import { log } from '/util/log';
import { validateServerName } from '/util/validation';

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
  const serverName = ns.args[0] as string;
  validateServerName(serverName);
  hackServer(ns, serverName);
}

export function hackServer(ns: NS, serverName: string) {
  if (
    !ns.hasRootAccess(serverName) &&
    ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(serverName) &&
    getCrackablePortsNumber(ns) >= ns.getServerNumPortsRequired(serverName)
  ) {
    openPorts(ns, serverName);
    ns.nuke(serverName);
    log(ns, `Hacked new server: ${serverName}`, true);
  }
}

function openPorts(ns: NS, serverName: string) {
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

function getCrackablePortsNumber(ns: NS) {
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

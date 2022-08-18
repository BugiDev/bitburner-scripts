import { printSeparator, printHeader, tPrint } from '/scripts/util';
import { installMalwareOnServer, executeMalware } from '/scripts/hacker';
import { crackServer } from '/scripts/cracker';
import { CONFIG } from '/scripts/config';

export async function main(ns) {
    const silent = ns.args[0] || false;
    printHeader(ns, 'Pwning all servers...', silent);
    await pwnAllServers(ns, 'home', 'home', pwnServer, silent);
}


/**
 * @param {NS} ns
 * @param startServer
 * @param targetServer
 * @param func
 * @param silent
 */
export async function pwnAllServers(ns, startServer, targetServer, func, silent = false) {
    const servers = ns.scan(targetServer, true).filter((server) => server !== startServer);
    for (const serverName of servers) {
        const success = await func.call(this, ns, serverName, serverName, silent);
        if (success) {
            await pwnAllServers(ns, targetServer, serverName, func, silent);
        }
    }
}

/**
 * @param {NS} ns
 * @param hostServerName
 * @param targetServerName
 * @param silent
 */
export async function pwnServer(ns, hostServerName, targetServerName, silent = false) {
    tPrint(ns, `Pwning server: ${hostServerName}`, silent);
    if (!await crackServer(ns, hostServerName, silent)) {
        printSeparator(ns, silent);
        return false;
    }

    await installMalwareOnServer(ns, hostServerName, silent);

    const scriptRam = ns.getScriptRam(CONFIG.malwareFile);
    const serverRam = ns.getServerMaxRam(hostServerName);
    const threadCount = Math.floor(serverRam / scriptRam);
    await executeMalware(ns, hostServerName, targetServerName, threadCount, silent);

    printSeparator(ns, silent);
    return true;
}
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
        const success = await func.call(this, ns, serverName, silent);
        if (success) {
            await pwnAllServers(ns, targetServer, serverName, func, silent);
        }
    }
}

/**
 * @param {NS} ns
 * @param serverName
 * @param silent
 */
export async function pwnServer(ns, serverName, silent = false) {
    tPrint(ns, `Pwning server: ${serverName}`, silent);
    if (!await crackServer(ns, serverName, silent)) {
        return false;
    }

    await installMalwareOnServer(ns, serverName, silent);

    const scriptRam = ns.getScriptRam(CONFIG.malwareFile);
    const serverRam = ns.getServerMaxRam(serverName);
    const threadCount = Math.floor(serverRam / scriptRam);
    await executeMalware(ns, serverName, threadCount, silent);

    printSeparator(ns, silent);
    return true;
}
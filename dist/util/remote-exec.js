import { getServerFreeThreadCount } from '/util/thread';
import { CONFIG } from '/config';
import { log, red } from '/util/log';
import { walkWholeNetwork } from '/util/network';
function executeScript(ns, scriptPath, hostServer, targetServer, threadCount, id, delay) {
    const pid = ns.exec(scriptPath, hostServer, threadCount, targetServer, threadCount, delay, id);
    if (pid === 0) {
        log(ns, red(`Could not execute: ${scriptPath} on: ${hostServer} for target: ${targetServer}!`));
    }
}
export async function executeRemoteWeak(ns, targetServer, threadCount, id, delay) {
    const availableWeakenServer = await findServerToExecuteThreads(ns, threadCount);
    executeScript(ns, CONFIG.loopMalwareWeaken, availableWeakenServer, targetServer, threadCount, id, delay);
}
export async function executeRemoteHack(ns, targetServer, threadCount, id, delay) {
    const availableHackServer = await findServerToExecuteThreads(ns, threadCount);
    executeScript(ns, CONFIG.loopMalwareHack, availableHackServer, targetServer, threadCount, id, delay);
}
export async function executeRemoteGrow(ns, targetServer, threadCount, id, delay) {
    const availableGrowServer = await findServerToExecuteThreads(ns, threadCount);
    executeScript(ns, CONFIG.loopMalwareGrow, availableGrowServer, targetServer, threadCount, id, delay);
}
export function executeWeakScript(ns, hostServer, targetServer, threadCount, id, delay) {
    executeScript(ns, CONFIG.loopMalwareWeaken, hostServer, targetServer, threadCount, id, delay);
}
export function executeHackScript(ns, hostServer, targetServer, threadCount, id, delay) {
    executeScript(ns, CONFIG.loopMalwareHack, hostServer, targetServer, threadCount, id, delay);
}
export function executeGrowScript(ns, hostServer, targetServer, threadCount, id, delay) {
    executeScript(ns, CONFIG.loopMalwareGrow, hostServer, targetServer, threadCount, id, delay);
}
async function findServerToExecuteThreads(ns, threadCount, debug = false) {
    const servers = [];
    await walkWholeNetwork(ns, (_callbackNS, serverName) => {
        if (getServerFreeThreadCount(ns, serverName) >= threadCount) {
            servers.push(serverName);
        }
    }, debug);
    if (servers.length === 0) {
        throw new Error(`No available server to execute ${threadCount} treads!`);
    }
    return servers[0];
}

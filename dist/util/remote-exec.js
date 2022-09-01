import { getNetworkFreeThreadCount } from '/util/thread';
import { CONFIG } from '/config';
import { log, red } from '/util';
function executeRemoteScript(ns, scriptPath, targetServer, threadCount, id) {
    const freeThreads = getNetworkFreeThreadCount(ns);
    let threadsToSpread = threadCount;
    for (const serverName in freeThreads.threads) {
        if (freeThreads.threads[serverName] > 0) {
            const serverThreads = freeThreads.threads[serverName];
            if (serverThreads >= threadsToSpread) {
                if (ns.isRunning(scriptPath, serverName, targetServer, threadsToSpread, id)) {
                    break;
                }
                ns.exec(scriptPath, serverName, threadsToSpread, targetServer, threadsToSpread, id);
                threadsToSpread = 0;
                break;
            }
            else {
                if (ns.isRunning(scriptPath, serverName, targetServer, serverThreads, id)) {
                    break;
                }
                ns.exec(scriptPath, serverName, serverThreads, targetServer, serverThreads, id);
                threadsToSpread -= serverThreads;
            }
        }
    }
    log(ns, red(`Not all threads executed for ${scriptPath} in batch ${id}!`));
}
export function executeRemoteWeak(ns, targetServer, threadCount, id) {
    executeRemoteScript(ns, CONFIG.loopMalwareWeaken, targetServer, threadCount, id);
}
export function executeRemoteHack(ns, targetServer, threadCount, id) {
    executeRemoteScript(ns, CONFIG.loopMalwareHack, targetServer, threadCount, id);
}
export function executeRemoteGrow(ns, targetServer, threadCount, id) {
    executeRemoteScript(ns, CONFIG.loopMalwareGrow, targetServer, threadCount, id);
}

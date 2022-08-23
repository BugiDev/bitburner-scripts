import {printSeparator, tPrint} from "/scripts/util";
import {CONFIG} from "/scripts/config";

/** @param {NS} ns */
export async function main(ns) {
    const serverName = ns.args[0];
    const silent = ns.args[1] || false
    await prepareServer(ns, serverName, silent);
}

function getNetworkThreadCount(ns, startServer, targetServer, maxThreadCount) {
    const servers = ns.scan(targetServer, true).filter((server) => server !== startServer);
    for (const serverName of servers) {
        if(ns.hasRootAccess(serverName)) {
            const scriptRam = 1.75;
            const serverRam = ns.getServerMaxRam(serverName);
            const threadCount = Math.floor(serverRam / scriptRam);
            maxThreadCount.servers[serverName] = threadCount;
            maxThreadCount.threadCount += threadCount;
        }
        getNetworkThreadCount(ns, targetServer, serverName, maxThreadCount);
    }
}

async function prepareServer(ns, targetServer, silent = false) {
    const maxThreadCount = {threadCount: 0, servers: {}};
    getNetworkThreadCount(ns, 'home', 'home', maxThreadCount);

    if (maxThreadCount.threadCount < 1) {
        tPrint(ns,'No enough threads to execute malware!');
        return;
    }

    const growthAnalyzeSecurity = await ns.growthAnalyzeSecurity(1);
    // const hackAnalyzeSecurity = ns.hackAnalyzeSecurity(1);
    const weakenAnalyze = await ns.weakenAnalyze(1);

    const growToWeakenRatio = Math.floor(weakenAnalyze/growthAnalyzeSecurity);
    // const hackToWeakenRatio = Math.floor(weakenAnalyze/hackAnalyzeSecurity);

    let threadCountToGrow = 0;
    let threadCountToWeaken = 0;

    if (maxThreadCount.threadCount < growToWeakenRatio + 1) {
        threadCountToWeaken = 1;
        threadCountToGrow = maxThreadCount - 1;
    } else {
        const ratio = Math.floor(maxThreadCount.threadCount/(growToWeakenRatio + 1));
        threadCountToWeaken = maxThreadCount.threadCount - (ratio * growToWeakenRatio);
        threadCountToGrow = ratio * growToWeakenRatio;
    }

    const servers = Object.keys(maxThreadCount.servers);

    for(let serverName of servers) {
        let threadCount = maxThreadCount.servers[serverName];
        let growThreads = 0;
        let weakenThreads = 0;

        if (threadCountToWeaken > 0) {
            if (threadCountToWeaken - threadCount >= 0) {
                weakenThreads = threadCount;
                threadCountToWeaken -= threadCount;
                threadCount = 0;
            } else {
                weakenThreads = threadCountToWeaken;
                threadCountToWeaken = 0;
                threadCount -=threadCountToWeaken
            }
        }

        if (threadCountToGrow > 0) {
            if (threadCountToGrow - threadCount >= 0) {
                growThreads = threadCount;
                threadCountToGrow -= threadCount;
                threadCount = 0;
            } else {
                growThreads = threadCountToGrow;
                threadCountToGrow = 0;
                threadCount -=threadCountToGrow
            }
        }

        await ns.killall(serverName);

        if(weakenThreads > 0) {
            await ns.exec(CONFIG.loopMalwareWeaken, serverName, weakenThreads, targetServer, weakenThreads);
        }

        if (growThreads > 0) {
            await ns.exec(CONFIG.loopMalwareGrow, serverName, growThreads, targetServer, growThreads);
        }
    }

    const serverMaxMoney = await ns.getServerMaxMoney(targetServer);
    let serverCurrentMoney = await ns.getServerMoneyAvailable(targetServer);

    const serverMinSecLevel = await ns.getServerMinSecurityLevel(targetServer);
    let serverCurrentSecLevel = await ns.getServerSecurityLevel(targetServer);

    const weakenTime = await ns.getWeakenTime(targetServer);

    while((serverCurrentMoney < serverMaxMoney) && (serverCurrentSecLevel > serverMinSecLevel)) {
        await ns.sleep(weakenTime);
        serverCurrentMoney = await ns.getServerMoneyAvailable(targetServer);
        serverCurrentSecLevel = await ns.getServerSecurityLevel(targetServer);
        tPrint(ns, `Money calc: ${ns.nFormat(serverCurrentMoney, '($ 0.00 a)')}/${ns.nFormat(serverMaxMoney, '($ 0.00 a)')}`, silent);
        tPrint(ns, `Security calc: ${serverCurrentSecLevel}/${serverMinSecLevel}`, silent);
        printSeparator(ns, silent);
    }
    tPrint(ns, `Server prepared!`);
}
import {log, logSeparator} from "/scripts/util.js";
import {
    getNetworkMaxThreadCount,
    getNetworkFreeServers
} from "/scripts/util/thread.js";
import {CONFIG} from '/scripts/config.js';
import {maxOutServer} from "/scripts/util/server";

/** @param {NS} ns */
export async function main(ns) {
    const serverName = ns.args[0];
    const debug = ns.args[1] || false;
    await HWGWLoop(ns, serverName, debug)
}

export async function HWGWLoop(ns, serverName, debug = false) {
    const serverMaxMoney = await ns.getServerMaxMoney(serverName);
    const serverMinSecLevel = await ns.getServerMinSecurityLevel(serverName);
    await maxOutServer(ns, serverName, debug);
    const HWGWLoopThreadCount = await getHWGWLoopThreadCount(ns, serverName, debug);
    log(ns, JSON.stringify(HWGWLoopThreadCount), debug);
    logSeparator(ns, debug);

    const maxThreads = await getNetworkMaxThreadCount(ns);
    const freeServers = getNetworkFreeServers(ns, 'home', 'home');

    if (freeServers.length === 0) {
        log(ns, `No enough free servers to execute loop for server: ${serverName}!`, debug);
        return;
    }

    const maxUsedThreads = Math.max(HWGWLoopThreadCount.grow, HWGWLoopThreadCount.hack, HWGWLoopThreadCount.weakGrow, HWGWLoopThreadCount.weakHack);
    const filteredServers = freeServers.filter((server) => maxThreads[server] >= maxUsedThreads).sort((a, b) => {
        if (maxThreads[a] < maxThreads[b]) {
            return -1;
        }
        if (maxThreads[a] > maxThreads[b]) {
            return 1;
        }
        // a must be equal to b
        return 0;
    });

    if (filteredServers.length === 0) {
        log(ns, `No free servers with enough threads to execute loop for server: ${serverName}!`, debug);
        return;
    }

    const serverToRunMalwareOn = filteredServers[0];
    log(ns, `Running malware on server: ${serverToRunMalwareOn} to hack: ${serverName}`, debug);

    while (true) {
        const hackTime = await ns.getHackTime(serverName);
        ns.exec(CONFIG.loopMalwareHack, serverToRunMalwareOn, HWGWLoopThreadCount.hack, serverName, HWGWLoopThreadCount.hack);
        await ns.sleep(hackTime + 10);
        log(ns, `Money after hack: ${ns.nFormat(ns.getServerMoneyAvailable(serverName), '($ 0.00 a)')}/${ns.nFormat(serverMaxMoney, '($ 0.00 a)')}`, debug);
        log(ns, `Security after hack: ${ns.getServerSecurityLevel(serverName)}/${serverMinSecLevel}`, debug);

        const weakenTime = await ns.getWeakenTime(serverName);
        ns.exec(CONFIG.loopMalwareWeaken, serverToRunMalwareOn, HWGWLoopThreadCount.weakHack, serverName, HWGWLoopThreadCount.weakHack);
        await ns.sleep(weakenTime + 10);
        log(ns, `Security after weaken after hack: ${ns.getServerSecurityLevel(serverName)}/${serverMinSecLevel}`, debug);

        const growTime = await ns.getGrowTime(serverName);
        ns.exec(CONFIG.loopMalwareGrow, serverToRunMalwareOn, HWGWLoopThreadCount.grow, serverName, HWGWLoopThreadCount.grow);
        await ns.sleep(growTime + 10);
        log(ns, `Money after grow: ${ns.nFormat(ns.getServerMoneyAvailable(serverName), '($ 0.00 a)')}/${ns.nFormat(serverMaxMoney, '($ 0.00 a)')}`, debug);
        log(ns, `Security after grow: ${ns.getServerSecurityLevel(serverName)}/${serverMinSecLevel}`, debug);

        ns.exec(CONFIG.loopMalwareWeaken, serverToRunMalwareOn, HWGWLoopThreadCount.weakGrow, serverName, HWGWLoopThreadCount.weakGrow);
        await ns.sleep(weakenTime + 10);
        log(ns, `Security after weaken after grow: ${ns.getServerSecurityLevel(serverName)}/${serverMinSecLevel}`, debug);
        logSeparator(ns, debug);
    }
}

// Server needs to be prepared for this one to work
async function getHWGWLoopThreadCount(ns, serverName, debug = false) {
    const serverMaxMoney = await ns.getServerMaxMoney(serverName);
    const threadsToHackHalf = Math.floor(await ns.hackAnalyzeThreads(serverName, serverMaxMoney / 2)) || 1;
    const hackTime = ns.getHackTime(serverName);

    const pid = await ns.run(CONFIG.loopMalwareHack, threadsToHackHalf, serverName, threadsToHackHalf);
    await ns.sleep(hackTime + 10);
    await ns.kill(pid);

    const securityIncreaseForHack = await ns.hackAnalyzeSecurity(threadsToHackHalf, serverName);
    const weakenAnalyze = await ns.weakenAnalyze(1);
    const weakenThreadsNeededForHack = Math.ceil(securityIncreaseForHack / weakenAnalyze);

    const threadsToGrowHalf = Math.ceil(await ns.growthAnalyze(serverName, 2));

    const securityIncreaseForGrow = await ns.growthAnalyzeSecurity(threadsToGrowHalf);
    const weakenThreadsNeededForGrow = Math.ceil(securityIncreaseForGrow / weakenAnalyze);

    return {
        hack: threadsToHackHalf,
        weakHack: weakenThreadsNeededForHack,
        grow: threadsToGrowHalf,
        weakGrow: weakenThreadsNeededForGrow,
        total: threadsToHackHalf + weakenThreadsNeededForHack + threadsToGrowHalf + weakenThreadsNeededForGrow
    }
}

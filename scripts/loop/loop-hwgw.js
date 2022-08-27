import {tPrint} from "/scripts/util.js";
import {getServerFreeThreadCount} from "/scripts/util/thread.js";
import {CONFIG} from '/scripts/config.js';

/** @param {NS} ns */
export async function main(ns) {
    const serverName = ns.args[0];
    await maxOutServer(ns, serverName);
    const HWGWLoopThreadCount = await getHWGWLoopThreadCount(ns, serverName);
}

// Server needs to be prepared for this one to work
async function getHWGWLoopThreadCount(ns, serverName) {
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

async function maxOutServer(ns, serverName) {
    const freeTreadCount = getServerFreeThreadCount(ns, 'home');

    if (freeTreadCount < 1) {
        tPrint(ns, 'No enough threads on home to max out the server!');
        return;
    }

    const serverMaxMoney = await ns.getServerMaxMoney(serverName);
    let serverCurrentMoney = await ns.getServerMoneyAvailable(serverName);
    let growPID = 0;

    while ((serverCurrentMoney < serverMaxMoney)) {
        growPID = await ns.run(CONFIG.loopMalwareGrow, freeTreadCount, serverName, freeTreadCount);
        const growTime = await ns.getGrowTime(serverName);
        await ns.sleep(growTime + 10);
    }
    await ns.kill(growPID);

    const serverMinSecLevel = await ns.getServerMinSecurityLevel(serverName);
    const serverCurrentSecLevel = await ns.getServerSecurityLevel(serverName);
    let weakenPID = 0;

    while ((serverCurrentMoney < serverMaxMoney)) {
        weakenPID = await ns.run(CONFIG.loopMalwareWeaken, freeTreadCount, serverName, freeTreadCount);
        const weakenTime = await ns.getWeakenTime(serverName);
        await ns.sleep(weakenTime + 10);
    }
    await ns.kill(weakenPID);
    tPrint(ns, `Maxed out server: ${serverName}`);
}
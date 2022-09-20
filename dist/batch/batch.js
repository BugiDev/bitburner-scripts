import { bold, boldRed, formatMoney, log, logSeparator, red } from '/util/log';
import { maxOutServer } from '/util/server';
import { getNetworkFreeThreadCount, getNetworkMaxThreadCount } from '/util/thread';
import { executeGrowScript, executeHackScript, executeWeakScript } from '/util/remote-exec';
import { hasFormulas } from '/util/home';
import { CONFIG } from '/config';
import { validateServerName } from '/util/validation';
import { getBatchHWGWConfig } from '/batch/batch-hwgw-config';
export function autocomplete(data) {
    return [...data.servers]; // This script autocompletes the list of servers.
}
/** @param {NS} ns */
export async function main(ns) {
    const serverName = ns.args[0];
    const debug = (ns.args[1] || false);
    validateServerName(serverName);
    if (!debug) {
        ns.disableLog('ALL');
        ns.tail();
    }
    logSeparator(ns, debug);
    log(ns, `Calculating threads for: ${serverName}`, debug);
    logSeparator(ns, debug);
    const maxThreads = await getNetworkMaxThreadCount(ns);
    log(ns, `Max threads in network: ${maxThreads.total}`, debug);
    logSeparator(ns, debug);
    await maxOutServer(ns, serverName, debug);
    const freeNetworkThreads = getNetworkFreeThreadCount(ns);
    const batchHWGWConfig = getBatchHWGWConfig(ns, serverName, freeNetworkThreads);
    if (!batchHWGWConfig) {
        log(ns, red(`Can not batch hack ${serverName}!`), debug);
        return;
    }
    log(ns, `Batch config for server: ${serverName}`, debug);
    log(ns, JSON.stringify(batchHWGWConfig), debug);
    logSeparator(ns, debug);
    const delays = calculateDelays(ns, serverName);
    log(ns, `Delays: ${JSON.stringify(delays)}`, debug);
    logSeparator(ns, debug);
    const batchesPerCycle = batchHWGWConfig.batches.length;
    log(ns, `Batch count: ${batchesPerCycle}`, debug);
    log(ns, `Hack ratio for ${serverName}: ${bold(`${batchHWGWConfig.hackRatio}`)} `, debug);
    const totalDelayBetweenBatches = CONFIG.timeStep * batchesPerCycle;
    const cycleDelay = delays.total >= totalDelayBetweenBatches ? delays.total - totalDelayBetweenBatches : 0;
    let prevIncome = 0;
    while (true) {
        for (let i = 0; i < batchHWGWConfig.batches.length; i++) {
            await executeBatch(ns, serverName, batchHWGWConfig?.batches[i], i);
            await ns.sleep(CONFIG.timeStep * 3);
        }
        const scriptIncome = ns.getScriptIncome('/batch/batch.js', 'home', ...ns.args);
        if (scriptIncome >= prevIncome) {
            log(ns, bold(`Script income: ${formatMoney(ns, scriptIncome)}`), debug);
        }
        else {
            log(ns, boldRed(`Script income: ${formatMoney(ns, scriptIncome)}`), debug);
        }
        prevIncome = scriptIncome;
        logSeparator(ns, debug);
        await ns.sleep(cycleDelay);
    }
}
async function executeBatch(ns, targetServer, batchConfig, id) {
    const delays = calculateDelays(ns, targetServer);
    await executeWeakScript(ns, batchConfig.weakHackServer, targetServer, batchConfig.weakenThreadsNeededForHack, `${targetServer}-weak-hack-${id}`, delays.weakHack);
    await executeWeakScript(ns, batchConfig.weakGrowServer, targetServer, batchConfig.weakenThreadsNeededForGrow, `${targetServer}-weak-grow-${id}`, delays.weakGrow);
    await executeGrowScript(ns, batchConfig.growServer, targetServer, batchConfig.threadsToGrow, `${targetServer}-grow-${id}`, delays.grow);
    await executeHackScript(ns, batchConfig.hackServer, targetServer, batchConfig.threadsToHack, `${targetServer}-hack-${id}`, delays.hack);
}
function calculateDelays(ns, serverName) {
    const { hackTime, growTime, weakenTime } = getTimings(ns, serverName);
    return {
        weakHack: 0,
        weakGrow: CONFIG.timeStep * 2,
        grow: weakenTime - growTime + CONFIG.timeStep,
        hack: weakenTime - hackTime - CONFIG.timeStep,
        total: weakenTime,
    };
}
function getTimings(ns, serverName) {
    if (hasFormulas(ns)) {
        const server = ns.getServer(serverName);
        const player = ns.getPlayer();
        return {
            hackTime: ns.formulas.hacking.hackTime(server, player),
            growTime: ns.formulas.hacking.growTime(server, player),
            weakenTime: ns.formulas.hacking.weakenTime(server, player),
        };
    }
    return {
        hackTime: ns.getHackTime(serverName),
        growTime: ns.getGrowTime(serverName),
        weakenTime: ns.getWeakenTime(serverName),
    };
}

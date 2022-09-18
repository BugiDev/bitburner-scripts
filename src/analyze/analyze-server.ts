import { NS, AutocompleteData } from '@ns';
import { bold, boldRed, formatMoney, log, logSeparator, red } from '/util/log';
import { CONFIG } from '/config';
import { validateServerName } from '/util/validation';
import { getBatchHWGWConfig } from '/batch/batch-hwgw-config';

export function autocomplete(data: AutocompleteData) {
  return [...data.servers]; // This script autocompletes the list of servers.
}

/** @param {NS} ns */
export async function main(ns: NS) {
  const serverName = ns.args[0] as string;

  validateServerName(serverName);

  log(ns, `Analyzing server: ${serverName}...`, true);

  const serverRequiredHackingLevel = ns.getServerRequiredHackingLevel(serverName);
  const serverMinSecLevel = ns.getServerMinSecurityLevel(serverName);
  const serverCurrentSecLevel = ns.getServerSecurityLevel(serverName);

  log(ns, `Server required hacking lvl: ${serverRequiredHackingLevel}`, true);
  log(ns, `Server MIN security lvl: ${serverMinSecLevel}`, true);
  log(ns, `Server current security lvl: ${serverCurrentSecLevel} `, true);
  logSeparator(ns, true);

  const serverMaxRAM = ns.getServerMaxRam(serverName);
  const serverUsedRAM = ns.getServerUsedRam(serverName);

  log(ns, `Server MAX RAM: ${serverMaxRAM} GB`, true);
  log(ns, `Server used RAM: ${serverUsedRAM} GB`, true);
  logSeparator(ns, true);

  const growTime = ns.tFormat(ns.getGrowTime(serverName));
  const hackTime = ns.tFormat(ns.getHackTime(serverName));
  const weakenTime = ns.getWeakenTime(serverName);

  log(ns, `Server growth time: ${growTime}`, true);
  log(ns, `Server hack time: ${hackTime}`, true);
  log(ns, `Server weaken time: ${ns.tFormat(weakenTime)} `, true);
  logSeparator(ns, true);

  const serverGrowth = ns.getServerGrowth(serverName);

  const serverMaxMoney = ns.getServerMaxMoney(serverName);
  const serverCurrentMoney = ns.getServerMoneyAvailable(serverName);

  log(ns, `Server growth rate: ${serverGrowth}`, true);
  log(ns, `Server MAX money: ${formatMoney(ns, serverMaxMoney)}`, true);
  log(ns, `Server current money: ${formatMoney(ns, serverCurrentMoney)}`, true);
  logSeparator(ns, true);

  const hackChance = ns.nFormat(ns.hackAnalyzeChance(serverName), '0 %');
  log(ns, `Server hack chance: ${hackChance}`, true);
  logSeparator(ns, true);

  const batchHWGWConfig = getBatchHWGWConfig(ns, serverName);
  if (batchHWGWConfig) {
    const cycleUsableTime = weakenTime - CONFIG.timeStep;
    const maxExecutableBatches = batchHWGWConfig?.batches?.length;
    const totalCycleTime =
      maxExecutableBatches > 1
        ? (cycleUsableTime + CONFIG.timeStep * 3 * maxExecutableBatches) / 1000
        : (cycleUsableTime + CONFIG.timeStep * 4) / 1000;
    const maxMoneyPerSecond = (serverMaxMoney / 2 / totalCycleTime) * maxExecutableBatches;
    log(ns, bold(`Max executable batches: ${maxExecutableBatches}`), true);
    log(ns, bold(`Max money per second: ${formatMoney(ns, maxMoneyPerSecond)}`), true);
    log(ns, bold(`Hack ratio: ${batchHWGWConfig.hackRatio}`), true);
  } else {
    log(ns, red(`Server ${boldRed(serverName)} can't be batched!`));
  }

  const serverGrowthRate = ns.getServerGrowth(serverName);
  log(ns, bold(`Server growth rate: ${serverGrowthRate}`), true);
  logSeparator(ns, true);
}

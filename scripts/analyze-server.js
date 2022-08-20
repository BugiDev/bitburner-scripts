import {tPrint, printHeader, printSeparator} from "/scripts/util";

/** @param {NS} ns */
export async function main(ns) {
    const serverName = ns.args[0];

    if (!serverName) {
        tPrint(ns, 'No server name provided!');
    }

    printHeader(ns, `Analyzing server: ${serverName}...`);

    const serverRequiredHackingLevel = ns.getServerRequiredHackingLevel(serverName);
    const serverMinSecLevel = ns.getServerMinSecurityLevel(serverName);
    const serverCurrentSecLevel = ns.getServerSecurityLevel(serverName);

    tPrint(ns, `Server required hacking lvl: ${serverRequiredHackingLevel}`);
    tPrint(ns, `Server MIN security lvl: ${serverMinSecLevel}`);
    tPrint(ns, `Server current security lvl: ${serverCurrentSecLevel} `);
    printSeparator(ns);

    const serverMaxRAM = ns.getServerMaxRam(serverName);
    const serverUsedRAM = ns.getServerUsedRam(serverName);

    tPrint(ns, `Server MAX RAM: ${serverMaxRAM} GB`);
    tPrint(ns, `Server used RAM: ${serverUsedRAM} GB`);
    printSeparator(ns);

    const growTime = ns.tFormat(ns.getGrowTime(serverName));
    const hackTime = ns.tFormat(ns.getHackTime(serverName));
    const weakenTime = ns.tFormat(ns.getWeakenTime(serverName));

    tPrint(ns, `Server growth time: ${growTime}`);
    tPrint(ns, `Server hack time: ${hackTime}`);
    tPrint(ns, `Server weaken time: ${weakenTime} `);
    printSeparator(ns);

    const serverGrowth = ns.getServerGrowth(serverName);

    const serverMaxMoney = ns.nFormat(ns.getServerMaxMoney(serverName), '($ 0.00 a)');
    const serverCurrentMoney = ns.nFormat(ns.getServerMoneyAvailable(serverName), '($ 0.00 a)');

    tPrint(ns, `Server growth rate: ${serverGrowth}`);
    tPrint(ns, `Server MAX money: ${serverMaxMoney}`);
    tPrint(ns, `Server current money: ${serverCurrentMoney} `);
    printSeparator(ns);

    const hackChance = ns.nFormat(ns.hackAnalyzeChance(serverName), '0 %');
    tPrint(ns, `Server hack chance: ${hackChance} `);
    printSeparator(ns);
}
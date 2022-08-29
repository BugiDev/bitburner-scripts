import {tPrint} from '/scripts/util';
import {CONFIG} from '/scripts/config';
import {installMalware} from "/scripts/malware/install-malware";

const DEFAULT_MYSERVER_LEVEL = 2;

/** @param {NS} ns */
export async function main(ns) {
    const timer = ns.args[0] || 5000;
    const silent = ns.args[1] || false;
    while (true) {
        await ns.sleep(timer);
        await autoPurchaseServer(ns, silent);
    }
}

/**
 * @param {NS} ns
 * @param silent
 */
async function autoPurchaseServer(ns, silent = false) {
    const purchasedServers = ns.getPurchasedServers();
    const purchaseServerLimit = ns.getPurchasedServerLimit();

    if (purchasedServers.length === 0) {
        const purchasedServer = ns.purchaseServer(CONFIG.myServerPrefix, Math.pow(2, 1));
        tPrint(ns, `Purchased server: ${purchasedServer}`, silent);
        await installMalware(ns, purchasedServer, !silent);
        return;
    }

    const nextServerLevel = getNextServerLevel(ns, silent);
    tPrint(ns, `Next server level: ${nextServerLevel}`, silent);

    const currentMoney = ns.getPlayer().money;
    const nextServerCost = getNextServerCost(ns, nextServerLevel);
    tPrint(ns, `Next server costs: ${nextServerCost}`, silent);

    if (currentMoney > nextServerCost) {
        if (purchasedServers.length >= purchaseServerLimit) {
            await ns.killall(purchasedServers[0]);
            ns.deleteServer(purchasedServers[0]);
        }
        const purchasedServer = ns.purchaseServer(CONFIG.myServerPrefix, Math.pow(2, nextServerLevel));
        tPrint(ns, `Purchased server: ${purchasedServer}`, silent);
        await installMalware(ns, purchasedServer, !silent);
    } else {
        tPrint(ns, `No enough money!`, silent);
    }
}

/**
 * @param {NS} ns
 * @param silent
 */
function getNextServerLevel(ns, silent = false) {
    const purchasedServers = ns.getPurchasedServers();
    const purchaseServerLimit = ns.getPurchasedServerLimit();
    tPrint(ns, `purchased servers: ${JSON.stringify(purchasedServers)}`, silent);
    if (purchasedServers.length > 0) {
        const maxServerLevel = purchasedServers.reduce((previousLevel, server) => {
            tPrint(ns, `Running calc for server: ${server}`, silent);
            const serverMaxRam = ns.getServerMaxRam(server);
            const serverLevel = Math.log(serverMaxRam) / Math.log(2);
            tPrint(ns, `Max RAM for server: ${server} is: ${serverMaxRam} with level: ${serverLevel}`, silent);
            return serverLevel >= previousLevel ? serverLevel : previousLevel;
        }, DEFAULT_MYSERVER_LEVEL)

        if (purchasedServers.length + 1 >= purchaseServerLimit) {
            const firstServerMaxRam = ns.getServerMaxRam(purchasedServers[0]);
            const firstServerLevel = Math.log(firstServerMaxRam) / Math.log(2);
            if (firstServerLevel !== maxServerLevel) {
                return firstServerLevel + 1;
            } else {
                return maxServerLevel + 1;
            }
        } else {
            return maxServerLevel;
        }
    }
    return DEFAULT_MYSERVER_LEVEL;
}

function getNextServerCost(ns, nextServerLevel) {
    return ns.getPurchasedServerCost(Math.pow(2, nextServerLevel));
}

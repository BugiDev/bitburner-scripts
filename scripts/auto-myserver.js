import {tPrint} from '/scripts/util';
import { CONFIG } from '/scripts/config';

/** @param {NS} ns */
export async function main(ns) {
    const silent = ns.args[0] || false;
    const timer = ns.args[1] || 5000;
    while(true) {
        await ns.sleep(timer);
        autoPurchaseServer(ns, silent);
    }
}

/**
 * @param {NS} ns
 * @param silent
 */
function autoPurchaseServer(ns, silent = false) {
    const purchasedServers = ns.getPurchasedServers();
    const purchaseServerLimit = ns.getPurchasedServerLimit();

    if (purchasedServers.length === 0) {
        const purchasedServer = ns.purchaseServer(CONFIG.myServerPrefix, Math.pow(2, 1));
        tPrint(ns, `Purchased server: ${purchasedServer}`, silent);
        return;
    }

    const nextServerLevel = getNextServerLevel(ns, silent);
    tPrint(ns, `Next server level: ${nextServerLevel}`, silent);

    const currentMoney = ns.getPlayer().money;
    const nextServerCost = getNextServerCost(ns, nextServerLevel);
    tPrint(ns, `Next server costs: ${nextServerCost}`, silent);

    if (currentMoney > nextServerCost) {
        if (purchasedServers.length + 1 >= purchaseServerLimit) {
            ns.deleteServer(purchasedServers[0]);
        }
        const purchasedServer = ns.purchaseServer(CONFIG.myServerPrefix, Math.pow(2, nextServerLevel));
        tPrint(ns, `Purchased server: ${purchasedServer}`, silent);
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
        }, 1)

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
    return 1;
}

function getNextServerCost(ns, nextServerLevel) {
    return ns.getPurchasedServerCost(Math.pow(2, nextServerLevel));
}

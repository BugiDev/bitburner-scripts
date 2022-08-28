import {tPrint} from '/scripts/util';

/** @param {NS} ns */
export async function main(ns) {
    const timer = ns.args[0] || 5000;
    const silent = ns.args[1] || false;
    const currentNodeCount = ns.hacknet.numNodes();

    if ( currentNodeCount < 1) {
        ns.hacknet.purchaseNode();
    } else {
        while(true) {
            await ns.sleep(timer);
            autoUpgradeHacknet(ns, silent)
        }
    }
}

/**
 * @param {NS} ns
 * @param silent
 */
function autoUpgradeHacknet(ns, silent = false) {
    const currentMoney = ns.getPlayer().money;
    const maxNumberOfNodes = ns.hacknet.maxNumNodes();
    const currentNodeCount = ns.hacknet.numNodes();
    const newNodeCost = ns.hacknet.getPurchaseNodeCost();
    const leastExpensiveLevel = getLeastExpensiveLevel(ns, currentNodeCount);
    const leastExpensiveRAM = getLeastExpensiveRAM(ns, currentNodeCount);
    const leastExpensiveCore = getLeastExpensiveCore(ns, currentNodeCount);

    if (
        currentMoney < newNodeCost
        && currentMoney < leastExpensiveLevel.cost
        && currentMoney < leastExpensiveRAM.cost
        && currentMoney < leastExpensiveCore.cost
    ) {
        tPrint(ns, `No enough money to upgrade hacknet!`, silent);
        return;
    }

    if (
        newNodeCost < currentMoney
        && newNodeCost < leastExpensiveLevel.cost
        && newNodeCost < leastExpensiveRAM.cost
        && newNodeCost < leastExpensiveCore.cost
    ) {
        tPrint(ns, `Buying new hacknet node.`, silent);
        ns.hacknet.purchaseNode();
        return;
    }

    if (
        leastExpensiveCore.cost < currentMoney
        && leastExpensiveCore.cost < newNodeCost
        && leastExpensiveCore.cost < leastExpensiveLevel.cost
        && leastExpensiveCore.cost < leastExpensiveRAM.cost
    ) {
        tPrint(ns, `Upgrading CORE for node: ${leastExpensiveCore.index}.`, silent);
        ns.hacknet.upgradeCore(leastExpensiveCore.index, 1);
        return;
    }

    if (
        leastExpensiveRAM.cost < currentMoney
        && leastExpensiveRAM.cost < newNodeCost
        && leastExpensiveRAM.cost < leastExpensiveLevel.cost
        && leastExpensiveRAM.cost < leastExpensiveCore.cost
    ) {
        tPrint(ns, `Upgrading RAM for node: ${leastExpensiveRAM.index}.`, silent);
        ns.hacknet.upgradeRam(leastExpensiveRAM.index, 1);
        return;
    }

    if (
        leastExpensiveLevel.cost < currentMoney
        && leastExpensiveLevel.cost < newNodeCost
        && leastExpensiveLevel.cost < leastExpensiveRAM.cost
        && leastExpensiveLevel.cost < leastExpensiveCore.cost
    ) {
        tPrint(ns, `Upgrading LEVEL for node: ${leastExpensiveLevel.index}.`, silent);
        ns.hacknet.upgradeLevel(leastExpensiveLevel.index, 1);
        return;
    }

    return;
}

/**
 * @param {NS} ns
 * @param nodeCount
 */
function getLeastExpensiveLevel(ns, nodeCount) {
    let leastExpensiveCost = Infinity;
    let leastExpensiveIndex = 0;
    for (let i = 0; i < nodeCount; i++) {
        const upgradeCost = ns.hacknet.getLevelUpgradeCost(i);
        if (upgradeCost < leastExpensiveCost) {
            leastExpensiveCost = upgradeCost;
            leastExpensiveIndex = i;
        }
    }
    return {
        cost: leastExpensiveCost,
        index: leastExpensiveIndex,
    }
}

/**
 * @param {NS} ns
 * @param nodeCount
 */
function getLeastExpensiveRAM(ns, nodeCount) {
    let leastExpensiveCost = Infinity;
    let leastExpensiveIndex = 0;
    for (let i = 0; i < nodeCount; i++) {
        const upgradeCost = ns.hacknet.getRamUpgradeCost(i);
        if (upgradeCost < leastExpensiveCost) {
            leastExpensiveCost = upgradeCost;
            leastExpensiveIndex = i;
        }
    }
    return {
        cost: leastExpensiveCost,
        index: leastExpensiveIndex,
    }
}

/**
 * @param {NS} ns
 * @param nodeCount
 */
function getLeastExpensiveCore(ns, nodeCount) {
    let leastExpensiveCost = Infinity;
    let leastExpensiveIndex = 0;
    for (let i = 0; i < nodeCount; i++) {
        const upgradeCost = ns.hacknet.getCoreUpgradeCost(i);
        if (upgradeCost < leastExpensiveCost) {
            leastExpensiveCost = upgradeCost;
            leastExpensiveIndex = i;
        }
    }
    return {
        cost: leastExpensiveCost,
        index: leastExpensiveIndex,
    }
}
import { log } from '/util/log';
/** @param {NS} ns */
export async function main(ns) {
    const timer = (ns.args[0] || 1000);
    const debug = (ns.args[1] || false);
    while (true) {
        await ns.sleep(timer);
        autoUpgradeHacknet(ns, debug);
    }
}
/**
 * @param {NS} ns
 * @param debug
 */
function autoUpgradeHacknet(ns, debug = false) {
    const currentMoney = ns.getPlayer().money;
    const currentNodeCount = ns.hacknet.numNodes();
    const newNodeCost = ns.hacknet.getPurchaseNodeCost();
    const leastExpensiveLevel = getLeastExpensiveLevel(ns, currentNodeCount);
    const leastExpensiveRAM = getLeastExpensiveRAM(ns, currentNodeCount);
    const leastExpensiveCore = getLeastExpensiveCore(ns, currentNodeCount);
    if (currentMoney < newNodeCost &&
        currentMoney < leastExpensiveLevel.cost &&
        currentMoney < leastExpensiveRAM.cost &&
        currentMoney < leastExpensiveCore.cost) {
        log(ns, 'No enough money to upgrade hacknet!', debug);
        return;
    }
    if (currentNodeCount < 1 ||
        (newNodeCost < currentMoney &&
            newNodeCost < leastExpensiveLevel.cost &&
            newNodeCost < leastExpensiveRAM.cost &&
            newNodeCost < leastExpensiveCore.cost)) {
        log(ns, 'Buying new hacknet node.', debug);
        ns.hacknet.purchaseNode();
        return;
    }
    if (leastExpensiveCore.cost < currentMoney &&
        leastExpensiveCore.cost < newNodeCost &&
        leastExpensiveCore.cost < leastExpensiveLevel.cost &&
        leastExpensiveCore.cost < leastExpensiveRAM.cost) {
        log(ns, `Upgrading CORE for node: ${leastExpensiveCore.index}.`, debug);
        ns.hacknet.upgradeCore(leastExpensiveCore.index, 1);
        return;
    }
    if (leastExpensiveRAM.cost < currentMoney &&
        leastExpensiveRAM.cost < newNodeCost &&
        leastExpensiveRAM.cost < leastExpensiveLevel.cost &&
        leastExpensiveRAM.cost < leastExpensiveCore.cost) {
        log(ns, `Upgrading RAM for node: ${leastExpensiveRAM.index}.`, debug);
        ns.hacknet.upgradeRam(leastExpensiveRAM.index, 1);
        return;
    }
    if (leastExpensiveLevel.cost < currentMoney &&
        leastExpensiveLevel.cost < newNodeCost &&
        leastExpensiveLevel.cost < leastExpensiveRAM.cost &&
        leastExpensiveLevel.cost < leastExpensiveCore.cost) {
        log(ns, `Upgrading LEVEL for node: ${leastExpensiveLevel.index}.`, debug);
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
        const upgradeCost = ns.hacknet.getLevelUpgradeCost(i, 1);
        if (upgradeCost < leastExpensiveCost) {
            leastExpensiveCost = upgradeCost;
            leastExpensiveIndex = i;
        }
    }
    return {
        cost: leastExpensiveCost,
        index: leastExpensiveIndex,
    };
}
/**
 * @param {NS} ns
 * @param nodeCount
 */
function getLeastExpensiveRAM(ns, nodeCount) {
    let leastExpensiveCost = Infinity;
    let leastExpensiveIndex = 0;
    for (let i = 0; i < nodeCount; i++) {
        const upgradeCost = ns.hacknet.getRamUpgradeCost(i, 1);
        if (upgradeCost < leastExpensiveCost) {
            leastExpensiveCost = upgradeCost;
            leastExpensiveIndex = i;
        }
    }
    return {
        cost: leastExpensiveCost,
        index: leastExpensiveIndex,
    };
}
/**
 * @param {NS} ns
 * @param nodeCount
 */
function getLeastExpensiveCore(ns, nodeCount) {
    let leastExpensiveCost = Infinity;
    let leastExpensiveIndex = 0;
    for (let i = 0; i < nodeCount; i++) {
        const upgradeCost = ns.hacknet.getCoreUpgradeCost(i, 1);
        if (upgradeCost < leastExpensiveCost) {
            leastExpensiveCost = upgradeCost;
            leastExpensiveIndex = i;
        }
    }
    return {
        cost: leastExpensiveCost,
        index: leastExpensiveIndex,
    };
}

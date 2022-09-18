import { NS } from '@ns';
import { CONFIG } from '/config';
import { installMalware } from '/malware/install-malware';
import { bold, log } from '/util/log';

const DEFAULT_MYSERVER_LEVEL = 2;

/** @param {NS} ns */
export async function main(ns: NS) {
  const timer = (ns.args[0] || 1000) as number;
  const debug = (ns.args[1] || false) as boolean;
  ns.tail();

  while (true) {
    try {
      await autoPurchaseServer(ns, debug);
      await ns.sleep(timer);
    } catch (error) {
      log(ns, 'No more money to buy servers!', debug);
      break;
    }
  }

  await ns.sleep(2000);
  ns.closeTail();
}

async function purchaseServer(ns: NS, ram: number, debug = false) {
  const purchasedServer = ns.purchaseServer(CONFIG.myServerPrefix, ram);
  log(ns, `Purchased server: ${bold(purchasedServer)}`, debug);
  await installMalware(ns, purchasedServer, debug);
}

/**
 * @param {NS} ns
 * @param debug
 */
async function autoPurchaseServer(ns: NS, debug = false) {
  const purchasedServers = ns.getPurchasedServers();
  const purchaseServerLimit = ns.getPurchasedServerLimit();

  if (purchasedServers.length === 0) {
    await purchaseServer(ns, Math.pow(2, DEFAULT_MYSERVER_LEVEL), debug);
    return;
  }

  const nextServerLevel = getNextServerLevel(ns);
  log(ns, `Next server level: ${nextServerLevel}`, debug);

  const currentMoney = ns.getPlayer().money;
  const nextServerCost = getNextServerCost(ns, nextServerLevel);
  log(ns, `Next server costs: ${nextServerCost}`, debug);

  if (currentMoney > nextServerCost) {
    if (purchasedServers.length >= purchaseServerLimit) {
      ns.killall(purchasedServers[0]);
      ns.deleteServer(purchasedServers[0]);
    }
    await purchaseServer(ns, Math.pow(2, nextServerLevel), debug);
  } else {
    throw new Error('No more money to buy servers!');
  }
}

/**
 * @param {NS} ns
 * @param debug
 */
function getNextServerLevel(ns: NS) {
  const purchasedServers = ns.getPurchasedServers();
  const purchaseServerLimit = ns.getPurchasedServerLimit();

  if (purchasedServers.length === 0) {
    return DEFAULT_MYSERVER_LEVEL;
  }

  const maxServerLevel = purchasedServers.reduce((previousLevel, server) => {
    const serverMaxRam = ns.getServerMaxRam(server);
    const serverLevel = Math.log(serverMaxRam) / Math.log(2);
    return serverLevel >= previousLevel ? serverLevel : previousLevel;
  }, DEFAULT_MYSERVER_LEVEL);

  const areAllServerMaxedOut = purchasedServers.every((server: string) => {
    const serverMaxRam = ns.getServerMaxRam(server);
    const serverLevel = Math.log(serverMaxRam) / Math.log(2);
    return serverLevel === maxServerLevel;
  });

  if (purchasedServers.length === purchaseServerLimit && areAllServerMaxedOut) {
    return maxServerLevel + 1;
  } else {
    return maxServerLevel;
  }
}

function getNextServerCost(ns: NS, nextServerLevel: number) {
  return ns.getPurchasedServerCost(Math.pow(2, nextServerLevel));
}

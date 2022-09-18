import { AutocompleteData, NS } from '@ns';
import { logSeparator, printMoneyCalculation, printSecurityCalculation } from '/util/log';
import { validateServerName } from '/util/validation';

export function autocomplete(data: AutocompleteData) {
  return [...data.servers]; // This script autocompletes the list of servers.
}

/** @param {NS} ns
 * @param debug
 */
export async function main(ns: NS, debug = false) {
  ns.disableLog('ALL');
  const serverName = ns.args[0] as string;
  validateServerName(serverName);

  ns.tail();

  let prevServerCurrentMoney = 0;
  let prevServerCurrentSecLevel = 0;

  while (true) {
    const serverCurrentMoney = ns.getServerMoneyAvailable(serverName);
    const serverCurrentSecLevel = ns.getServerSecurityLevel(serverName);

    if (
      prevServerCurrentMoney !== serverCurrentMoney ||
      prevServerCurrentSecLevel !== serverCurrentSecLevel
    ) {
      printMoneyCalculation(ns, serverName, debug, prevServerCurrentMoney !== serverCurrentMoney);
      printSecurityCalculation(
        ns,
        serverName,
        debug,
        prevServerCurrentSecLevel !== serverCurrentSecLevel
      );
      logSeparator(ns, debug);
    }
    await ns.sleep(100);
    prevServerCurrentMoney = serverCurrentMoney;
    prevServerCurrentSecLevel = serverCurrentSecLevel;
  }
}

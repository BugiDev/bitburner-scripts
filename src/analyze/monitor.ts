import { NS } from '@ns';
import { log, logSeparator, formatMoney } from '/util';

/** @param {NS} ns
 * @param debug
 */
export async function main(ns: NS, debug = false) {
  ns.disableLog('ALL');
  const serverName = ns.args[0] as string;
  ns.tail();

  const serverMaxMoney = ns.getServerMaxMoney(serverName);
  let prevServerCurrentMoney = 0;

  const serverMinSecLevel = ns.getServerMinSecurityLevel(serverName);
  let prevServerCurrentSecLevel = 0;

  while (true) {
    const serverCurrentMoney = ns.getServerMoneyAvailable(serverName);
    const serverCurrentSecLevel = ns.getServerSecurityLevel(serverName);

    if (
      prevServerCurrentMoney !== serverCurrentMoney &&
      prevServerCurrentSecLevel !== serverCurrentSecLevel
    ) {
      logSeparator(ns, debug);
      log(
        ns,
        `Money calc: ${formatMoney(ns, serverCurrentMoney)}/${formatMoney(ns, serverMaxMoney)}`,
        debug
      );
      log(ns, `Security calc: ${serverCurrentSecLevel}/${serverMinSecLevel}`, debug);
    }
    await ns.sleep(100);
    prevServerCurrentMoney = serverCurrentMoney;
    prevServerCurrentSecLevel = serverCurrentSecLevel;
  }
}

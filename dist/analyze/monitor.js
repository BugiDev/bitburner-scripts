import { log, logSeparator, printMoneyCalculation, printSecurityCalculation } from '/util/log';
/** @param {NS} ns
 * @param debug
 */
export async function main(ns, debug = false) {
    ns.disableLog('ALL');
    const serverName = ns.args[0];
    ns.tail();
    let prevServerCurrentMoney = 0;
    let prevServerCurrentSecLevel = 0;
    while (true) {
        const serverCurrentMoney = ns.getServerMoneyAvailable(serverName);
        const serverCurrentSecLevel = ns.getServerSecurityLevel(serverName);
        if (prevServerCurrentMoney !== serverCurrentMoney ||
            prevServerCurrentSecLevel !== serverCurrentSecLevel) {
            logSeparator(ns, debug);
            if (prevServerCurrentMoney !== serverCurrentMoney) {
                log(ns, 'Money change', debug);
                printMoneyCalculation(ns, serverName, debug);
            }
            if (prevServerCurrentSecLevel !== serverCurrentSecLevel) {
                log(ns, 'Security change', debug);
                printSecurityCalculation(ns, serverName, debug);
            }
        }
        await ns.sleep(100);
        prevServerCurrentMoney = serverCurrentMoney;
        prevServerCurrentSecLevel = serverCurrentSecLevel;
    }
}

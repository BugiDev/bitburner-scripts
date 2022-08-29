import { walkNetwork } from '/util/network';
/** @param {NS} ns */
export async function main(ns) {
    await walkNetwork(ns, 'home', 'home', killScriptsOnServer);
}
function killScriptsOnServer(ns, serverName, _debug) {
    ns.killall(serverName);
}

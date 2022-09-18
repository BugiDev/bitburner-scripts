import { findServer } from '/find/find-server';
import { log } from '/util/log';
import { validateServerName } from '/util/validation';
export function autocomplete(data) {
    return [...data.servers]; // This script autocompletes the list of servers.
}
export async function main(ns) {
    const serverName = ns.args[0];
    const debug = (ns.args[1] || true);
    validateServerName(serverName);
    const serverPaths = findServer(ns, 'home', 'home');
    const pathWithBackdoor = `${serverPaths[serverName]} backdoor;`;
    log(ns, 'Copied path to clipboard!', debug);
    await navigator.clipboard.writeText(pathWithBackdoor);
}

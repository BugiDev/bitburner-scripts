import { findServer } from '/find/find-server';
import { log } from '/util/log';
export async function main(ns) {
    const serverName = ns.args[0];
    const debug = (ns.args[1] || true);
    const serverPaths = findServer(ns, 'home', 'home');
    const pathWithBackdoor = `${serverPaths[serverName]} backdoor;`;
    log(ns, pathWithBackdoor, debug);
    log(ns, 'Copied path to clipboard!', debug);
    await navigator.clipboard.writeText(pathWithBackdoor);
}

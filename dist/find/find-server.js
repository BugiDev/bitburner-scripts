import { log } from '/util/log';
import { validateServerName } from '/util/validation';
export function autocomplete(data) {
    return [...data.servers]; // This script autocompletes the list of servers.
}
/** @param {NS} ns */
export async function main(ns) {
    const serverName = ns.args[0];
    const debug = (ns.args[1] || true);
    validateServerName(serverName);
    const serverPaths = findServer(ns, 'home', 'home');
    log(ns, serverPaths[serverName], debug);
    log(ns, 'Copied path to clipboard!', debug);
    await navigator.clipboard.writeText(serverPaths[serverName]);
}
export function findServer(ns, startServer, nextServer, parentPath = '') {
    let serverPath = 'home;';
    if (nextServer !== 'home') {
        serverPath = `${parentPath} connect ${nextServer};`;
    }
    const servers = ns.scan(nextServer).filter((server) => server !== startServer);
    if (servers.length > 0) {
        const results = servers.reduce((combinedPaths, serverName) => {
            return {
                ...combinedPaths,
                ...findServer(ns, nextServer, serverName, serverPath),
            };
        }, {});
        return {
            [nextServer]: serverPath,
            ...results,
        };
    }
    return { [nextServer]: serverPath };
}

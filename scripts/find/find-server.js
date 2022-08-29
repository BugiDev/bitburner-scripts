/** @param {NS} ns */
export async function main(ns) {
    const serverName = ns.args[0];
    const serverPaths = findServer(ns, 'home', 'home');
    ns.tprint(serverPaths[serverName]);
    ns.tprint('Copied path to clipboard!');
    await navigator.clipboard.writeText(serverPaths[serverName]);
}

export function findServer(ns, startServer, nextServer, parentPath = '') {
    let serverPath = 'home;';
    if (nextServer !== 'home') {
        serverPath = `${parentPath} connect ${nextServer};`
    }
    const servers = ns.scan(nextServer, true).filter((server) => server !== startServer);
    if (servers.length > 0) {
        const results = servers.reduce((combinedPaths, serverName) => {
            return {
                ...combinedPaths,
                ...findServer(ns, nextServer, serverName, serverPath),
            }
        }, {});
        return {
            [nextServer]: serverPath,
            ...results,
        }
    }

    return {[nextServer]: serverPath};
}
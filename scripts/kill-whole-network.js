/** @param {NS} ns */
export async function main(ns) {
    await killWholeNetwork(ns, 'home', 'home');
}

export function killWholeNetwork(ns, startServer, targetServer,) {
    const servers = ns.scan(targetServer, true).filter((server) => server !== startServer);
    for (const serverName of servers) {
        ns.killall(serverName);
        killWholeNetwork(ns, targetServer, serverName);
    }
}
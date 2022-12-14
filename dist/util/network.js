export async function walkNetwork(ns, startServer, targetServer, callback, debug = false) {
    const servers = ns.scan(targetServer).filter((server) => server !== startServer);
    if (servers.length > 0) {
        for (const serverName of servers) {
            await callback(ns, serverName, debug);
            await walkNetwork(ns, targetServer, serverName, callback, debug);
        }
    }
}
export async function walkWholeNetwork(ns, callback, debug = false) {
    await walkNetwork(ns, 'home', 'home', callback, debug);
}
export async function getAllServersInNetwork(ns, debug = false) {
    const servers = [];
    await walkWholeNetwork(ns, (_callbackNS, serverName) => {
        servers.push(ns.getServer(serverName));
    }, debug);
    return servers;
}
export async function getHackedServersInNetwork(ns, debug = false) {
    const servers = [];
    await walkWholeNetwork(ns, (_callbackNS, serverName) => {
        if (ns.hasRootAccess(serverName)) {
            const hackedServer = {
                ...ns.getServer(serverName),
                hackChance: ns.hackAnalyzeChance(serverName),
            };
            servers.push(hackedServer);
        }
    }, debug);
    return servers;
}
export async function getNotHackedServersInNetwork(ns, debug = false) {
    const servers = [];
    await walkWholeNetwork(ns, (_callbackNS, serverName) => {
        if (!ns.hasRootAccess(serverName)) {
            const hackedServer = {
                ...ns.getServer(serverName),
            };
            servers.push(hackedServer);
        }
    }, debug);
    return servers;
}
export async function getHackedServersWithNoBackdoorInNetwork(ns, debug = false) {
    const servers = [];
    await walkWholeNetwork(ns, (_callbackNS, serverName) => {
        const server = ns.getServer(serverName);
        if (!server.purchasedByPlayer && server.hasAdminRights && !server.backdoorInstalled) {
            servers.push(serverName);
        }
    }, debug);
    return servers;
}

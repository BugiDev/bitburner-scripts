export async function walkNetwork(ns, startServer, targetServer, callback, debug = false) {
    const servers = ns.scan(targetServer, true).filter((server) => server !== startServer);
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
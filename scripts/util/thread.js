export function getServerMaxThreadCount(ns, serverName) {
    if (ns.hasRootAccess(serverName)) {
        const scriptRam = 1.75;
        const serverMaxRam = ns.getServerMaxRam(serverName);
        return Math.floor(serverMaxRam / scriptRam);
    }
    return 0
}

export function getServerFreeThreadCount(ns, serverName) {
    if (ns.hasRootAccess(serverName)) {
        const scriptRam = 1.75;
        const serverMaxRam = ns.getServerMaxRam(serverName);
        const serverUsedRam = ns.getServerUsedRam(serverName);
        const serverFreeRam = serverMaxRam - serverUsedRam;
        return Math.floor(serverFreeRam / scriptRam);
    }
    return 0;
}

function getNetworkThreadCount(ns, startServer, targetServer, callback) {
    const servers = ns.scan(targetServer, true).filter((server) => server !== startServer);
    if (servers.length > 0) {
        return servers.reduce((maxThreadsCount, serverName) => {
            const reducedValue = {
                ...maxThreadsCount,
                ...getNetworkThreadCount(ns, targetServer, serverName, callback),
            };
            reducedValue[serverName] = callback(ns, serverName);
            return reducedValue;
        }, {});
    }

    return {};
}

export function getNetworkFreeThreadCount(ns) {
    return getNetworkThreadCount(ns, 'home', 'home', getServerFreeThreadCount);
}

export function getNetworkMaxThreadCount(ns) {
    return getNetworkThreadCount(ns, 'home', 'home', getServerMaxThreadCount);
}

export function getNetworkFreeServers(ns, startServer, targetServer) {
    const servers = ns.scan(targetServer, true).filter((server) => server !== startServer);
    if (servers.length > 0) {
        return servers.reduce((freeServers, serverName) => {
            const reducedValue = [
                ...freeServers,
                ...getNetworkFreeServers(ns, targetServer, serverName),
            ];
            if (ns.hasRootAccess(serverName)) {
                const ps = ns.ps(serverName);
                if (ps.length === 0) {
                    reducedValue.push(serverName);
                }
            }
            return reducedValue;
        }, []);
    }

    return [];
}

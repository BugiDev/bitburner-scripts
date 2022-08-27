
export function getServerMaxThreadCount(ns, serverName) {
    if(ns.hasRootAccess(serverName)) {
        const scriptRam = 1.75;
        const serverMaxRam = ns.getServerMaxRam(serverName);
        return Math.floor(serverMaxRam / scriptRam);
    }
    return 0
}

export function getServerFreeThreadCount(ns, serverName) {
    if(ns.hasRootAccess(serverName)) {
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

export function getNetworkFreeThreadCount(ns, startServer, targetServer) {
    return getNetworkThreadCount(ns, startServer, targetServer, getServerFreeThreadCount);
}

export function getNetworkMaxThreadCount(ns, startServer, targetServer) {
    return getNetworkThreadCount(ns, startServer, targetServer, getServerMaxThreadCount);
}
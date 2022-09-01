export function getServerMaxThreadCount(ns, serverName) {
    if (ns.hasRootAccess(serverName)) {
        const scriptRam = 1.75;
        const serverMaxRam = ns.getServerMaxRam(serverName);
        return Math.floor(serverMaxRam / scriptRam);
    }
    return 0;
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
    const servers = ns.scan(targetServer).filter((server) => server !== startServer);
    if (servers.length > 0) {
        return servers.reduce((maxThreadsCount, serverName) => {
            const childThreadCount = callback(ns, serverName);
            const recursion = getNetworkThreadCount(ns, targetServer, serverName, callback);
            const reducedValue = {
                threads: {
                    ...maxThreadsCount.threads,
                    [serverName]: childThreadCount,
                    ...recursion.threads,
                },
                total: maxThreadsCount.total + childThreadCount + recursion.total,
            };
            return reducedValue;
        }, {
            threads: {},
            total: 0,
        });
    }
    return {
        threads: {},
        total: 0,
    };
}
export function getNetworkFreeThreadCount(ns) {
    return getNetworkThreadCount(ns, 'home', 'home', getServerFreeThreadCount);
}
export function getNetworkMaxThreadCount(ns) {
    return getNetworkThreadCount(ns, 'home', 'home', getServerMaxThreadCount);
}
export function getNetworkFreeServers(ns, startServer, targetServer) {
    const servers = ns.scan(targetServer).filter((server) => server !== startServer);
    if (servers.length > 0) {
        return servers.reduce((freeServers, serverName) => {
            const reducedValue = [...freeServers, ...getNetworkFreeServers(ns, targetServer, serverName)];
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

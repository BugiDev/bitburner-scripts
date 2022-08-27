/** @param {NS} ns */
export async function main(ns) {
    const serversWithContract = findContract(ns, 'home', 'home');
    if (serversWithContract.length > 0) {
        for (const serverName of serversWithContract) {
            ns.tprint(`Found contract on server: ${serverName}`);
        }
    } else {
        ns.tprint('No contracts found!');
    }
}

function findContract(ns, startServer, nextServer) {
    const hasContract = ns.ls(nextServer, 'contract').length > 0;
    const servers = ns.scan(nextServer, true).filter((server) => server !== startServer);
    if (servers.length > 0) {
        const results = servers.reduce((serversWithContract, serverName) => {
            return [
                ...serversWithContract,
                ...findContract(ns, nextServer, serverName),
            ]
        }, []);
        return hasContract ? [nextServer, ...results] : results;
    }

    return hasContract ? [nextServer] : [];
}
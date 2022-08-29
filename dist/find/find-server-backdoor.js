import { findServer } from '/find/find-server';
export async function main(ns) {
    const serverName = ns.args[0];
    const serverPaths = findServer(ns, 'home', 'home');
    const pathWithBackdoor = `${serverPaths[serverName]} backdoor;`;
    ns.tprint(pathWithBackdoor);
    ns.tprint('Copied path to clipboard!');
    await navigator.clipboard.writeText(pathWithBackdoor);
}

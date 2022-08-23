/** @param {NS} ns */
export async function main(ns) {
    const serverName = ns.args[0];
    const threadCount = ns.args[1] || 1;
    const opts = {thread: threadCount, stock: true};
    while(true) {
        await ns.grow(serverName, opts);
    }
}
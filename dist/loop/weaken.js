/** @param {NS} ns */
export async function main(ns) {
    const serverName = ns.args[0];
    const threadCount = (ns.args[1] || 1);
    const delay = ns.args[2];
    const opts = { thread: threadCount, stock: true };
    await ns.sleep(delay);
    await ns.weaken(serverName, opts);
}

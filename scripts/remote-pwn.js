import { pwnServer } from '/scripts/pwn';

export async function main(ns) {
    const hostServerName = ns.args[0];
    const targetServerName = ns.args[1];
    const silent = ns.args[2] || false;
    await pwnServer(ns, hostServerName, targetServerName, silent);
 }
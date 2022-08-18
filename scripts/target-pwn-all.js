import { printSeparator, printHeader, tPrint } from '/scripts/util';
import { pwnAllServers } from '/scripts/pwn';

export async function main(ns) {
    const malwareTarget = ns.args[0];
    const silent = ns.args[1] || false;
    printHeader(ns, `Pwning all servers for target ${malwareTarget}...`, silent);
    await pwnAllServers(ns, 'home', 'home', malwareTarget, silent);
}
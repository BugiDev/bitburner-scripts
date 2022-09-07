import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
  const serverName = ns.args[0] as string;
  const threadCount = (ns.args[1] || 1) as number;
  const delay = ns.args[2] as number;
  const opts = { thread: threadCount, stock: true };

  await ns.sleep(delay);
  await ns.hack(serverName, opts);
}

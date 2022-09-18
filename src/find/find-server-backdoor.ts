import { NS } from '@ns';
import { findServer } from '/find/find-server';
import { log } from '/util/log';

export async function main(ns: NS): Promise<void> {
  const serverName = ns.args[0] as string;
  const debug = (ns.args[1] || true) as boolean;
  const serverPaths = findServer(ns, 'home', 'home');
  const pathWithBackdoor = `${serverPaths[serverName]} backdoor;`;
  log(ns, pathWithBackdoor, debug);
  log(ns, 'Copied path to clipboard!', debug);
  await navigator.clipboard.writeText(pathWithBackdoor);
}

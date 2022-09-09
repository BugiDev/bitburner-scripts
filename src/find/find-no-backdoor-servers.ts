import { NS } from '@ns';
import { getHackedServersWithNoBackdoorInNetwork } from '/util/network';
import { log, logSeparator, bold } from '/util';

export async function main(ns: NS): Promise<void> {
  log(ns, bold('Hacked servers with no backdoor'), true);
  logSeparator(ns, true);
  const serversToBackdoor = await getHackedServersWithNoBackdoorInNetwork(ns, true);
  for (const server of serversToBackdoor) {
    log(ns, server, true);
  }
}

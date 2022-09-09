import { NS } from '@ns';
import { getHackedServersWithNoBackdoorInNetwork } from '/util/network';
import { log, logSeparator, bold } from '/util';

export async function main(ns: NS): Promise<void> {
  const serversToBackdoor = await getHackedServersWithNoBackdoorInNetwork(ns, true);
  if (serversToBackdoor.length === 0) {
    log(ns, bold('All  servers backdoored'), true);
    logSeparator(ns, true);
  } else {
    log(ns, bold('Hacked servers with no backdoor'), true);
    logSeparator(ns, true);

    for (const server of serversToBackdoor) {
      log(ns, server, true);
    }
  }
}

import { NS } from '@ns';
import { getNotHackedServersInNetwork } from '/util/network';
import { log, logSeparator, bold } from '/util';

export async function main(ns: NS): Promise<void> {
  const notHackedServers = await getNotHackedServersInNetwork(ns, true);
  if (notHackedServers.length === 0) {
    log(ns, bold('All servers hacked'), true);
    logSeparator(ns, true);
  } else {
    log(ns, bold('Not yet hacked servers'), true);
    logSeparator(ns, true);

    for (const server of notHackedServers) {
      log(ns, `Server Name: ${server.hostname}`, true);
      log(ns, `Server LVL: ${server.requiredHackingSkill}`, true);
      logSeparator(ns, true);
    }
  }
}

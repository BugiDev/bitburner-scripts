import { NS } from '@ns';
import { getNotHackedServersInNetwork } from '/util/network';
import { log, logSeparator, bold } from '/util';

export async function main(ns: NS): Promise<void> {
  log(ns, bold('Not yet hacked servers'), true);
  logSeparator(ns, true);
  const notHackedServers = await getNotHackedServersInNetwork(ns, true);
  for (const server of notHackedServers) {
    log(ns, `Server Name: ${server.hostname}`, true);
    log(ns, `Server LVL: ${server.requiredHackingSkill}`, true);
  }
}

import { NS } from '@ns';

import { log, logSeparator } from '/util/log';
import { hackAll } from '/hack/hack-all';
import { installMalwareAll } from '/malware/install-malware-all';

export async function main(ns: NS): Promise<void> {
  const debug = (ns.args[0] || false) as boolean;
  log(ns, 'Pwning all servers...', debug);
  logSeparator(ns, debug);
  await hackAll(ns, debug);
  await installMalwareAll(ns, debug);
}

import { log, logSeparator } from '/util/log';
import { hackAll } from '/hack/hack-all';
import { installMalwareAll } from '/malware/install-malware-all';
export async function main(ns) {
    const debug = (ns.args[0] || false);
    log(ns, 'Pwning all servers...', debug);
    logSeparator(ns, debug);
    await hackAll(ns, debug);
    await installMalwareAll(ns, debug);
}

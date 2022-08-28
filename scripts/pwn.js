import {log, logSeparator} from '/scripts/util';
import {hackAll} from "scripts/hack/hack-all";
import {installMalwareAll} from "scripts/malware/install-malware-all";

export async function main(ns) {
    const debug = ns.args[0] || false;
    log(ns, 'Pwning all servers...', debug);
    logSeparator(ns, debug);
    await hackAll(ns, debug);
    await installMalwareAll(ns, debug);
}

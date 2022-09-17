export const IMPORT_CONFIG = {
  baseUrl: 'https://raw.githubusercontent.com/BugiDev/bitburner-scripts/main/',
};

const IMPORT_FILES = [
  'util.js',
  'config.js',
  'pwn.js',
  'kill-whole-network.js',

  //FIND
  'find/find-server.js',
  'find/find-server-backdoor.js',
  'find/find-contracts.js',
  'find/find-no-backdoor-servers.js',
  'find/find-not-hacked-servers.js',

  //AUTO BUY
  'auto-buy/auto-buy-hacknet.js',
  'auto-buy/auto-buy-myserver.js',

  // UTIL
  'util/thread.js',
  'util/network.js',
  'util/server.js',
  'util/remote-exec.js',
  'util/home.js',
  'util/log.js',

  // HACK
  'hack/hack-all.js',
  'hack/hack.js',

  // MALWARE
  'malware/malware.js',
  'malware/install-malware.js',
  'malware/install-malware-all.js',
  'malware/run-malware-for-target.js',

  // ANALYZE
  'analyze/analyze-server.js',
  'analyze/analyze-threads.js',
  'analyze/monitor.js',

  // LOOP
  'loop/hack.js',
  'loop/grow.js',
  'loop/weaken.js',

  // BATCH
  'batch/batch.js',
];

function getRemoteFileURL(fileName) {
  return `${IMPORT_CONFIG.baseUrl}/dist/${fileName}`;
}

function getLocalFilePath(fileName) {
  return `${fileName.includes('/') ? '/' : ''}${fileName}`;
}

/** @param {NS} ns **/
export async function main(ns) {
  ns.tprint('='.repeat(50));
  ns.tprint('IMPORTING BITBURNER AUTOMATION SCRIPTS...');
  ns.tprint('='.repeat(50));

  for (let file of IMPORT_FILES) {
    await importFile(ns, file);
  }
  ns.tprint('='.repeat(50));
}

async function importFile(ns, fileName) {
  const result = await ns.wget(getRemoteFileURL(fileName), getLocalFilePath(fileName));
  ns.tprint(`File: ${fileName} download ${result ? 'SUCCESSFUL ✅' : 'FAILED ❌'}`);
}

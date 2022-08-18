
export const IMPORT_CONFIG = {
    baseUrl: 'https://raw.githubusercontent.com/BugiDev/bitburner-scripts/main/',
    localScriptsFolderName: 'scripts',
}

const IMPORT_FILES = [
    'util.js',
    'cracker.js',
    'hacker.js',
    'malware.js',
    'config.js',
    'pwn.js'
];

function getRemoteFileURL(fileName){
    return `${IMPORT_CONFIG.baseUrl}/scripts/${fileName}`;
}

function getLocalFilePath(fileName) {
    return `/${IMPORT_CONFIG.localScriptsFolderName}/${fileName}`;
}

/** @param {NS} ns **/
export async function main (ns) {
    ns.tprint('='.repeat(50));
    ns.tprint('IMPORTING BITBURNER AUTOMATION SCRIPTS...')
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
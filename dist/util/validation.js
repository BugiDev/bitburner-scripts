export function validateServerName(serverName) {
    if (!serverName) {
        throw new Error('No server name provided!');
    }
}

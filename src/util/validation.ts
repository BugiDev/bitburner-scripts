export function validateServerName(serverName: string) {
  if (!serverName) {
    throw new Error('No server name provided!');
  }
}

export function shortenAddress(address: string, padding = 4) {
  return `${address.slice(0, padding)}...${address.slice(-padding)}`;
}

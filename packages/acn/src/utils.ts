export function toHex(bytes: Uint8Array): string {
  let hex = '';
  bytes.forEach((byte) => {
    hex += byte.toString(16).padStart(2, '0');
  });
  return hex;
}

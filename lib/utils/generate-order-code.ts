import { randomBytes } from "node:crypto";

const ORDER_CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function generateOrderCode(): string {
  const bytes = randomBytes(5);
  let buffer = 0;
  let bits = 0;
  let code = "";
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      code += ORDER_CODE_ALPHABET[(buffer >> bits) & 31];
      buffer &= (1 << bits) - 1;
    }
  }
  return `LDR-${code.slice(0, 4)}-${code.slice(4)}`;
}

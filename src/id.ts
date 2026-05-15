export function ulid(): string {
  const ts = BigInt(Date.now());
  let timePart = "";
  let remaining = ts;
  for (let i = 0; i < 10; i++) {
    timePart = CROCKFORD[Number(remaining & 0x1fn)] + timePart;
    remaining >>= 5n;
  }

  const random = new Uint8Array(10);
  crypto.getRandomValues(random);
  let randomPart = "";
  for (let i = 0; i < 10; i++) {
    randomPart += CROCKFORD[random[i]! & 0x1f];
  }
  return timePart + randomPart;
}

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const URL_SAFE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
const URL_SAFE_LEN = 64;

export function nanoid(size = 21): string {
  const len = Math.max(1, size);
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let result = "";
  for (let i = 0; i < len; i++) {
    result += URL_SAFE[bytes[i]! % URL_SAFE_LEN];
  }
  return result;
}

export function shortid(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += bytes[i]!.toString(16).padStart(2, "0");
  }
  return result;
}

export function uuid(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

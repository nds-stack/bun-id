class ULIDGenerator {
  private lastTs = 0n;
  private lastRandomValue = 0n;

  ulid(): string {
    const ts = BigInt(Date.now());
    let randomValue: bigint;

    if (ts === this.lastTs) {
      randomValue = this.lastRandomValue + 1n;
    } else {
      const random = new Uint8Array(10);
      crypto.getRandomValues(random);
      randomValue = 0n;
      for (let i = 0; i < 10; i++) {
        randomValue = (randomValue << 8n) | BigInt(random[i] as number);
      }
    }

    this.lastTs = ts;
    this.lastRandomValue = randomValue;

    let remaining = ts;
    let timePart = "";
    for (let i = 0; i < 10; i++) {
      timePart = CROCKFORD[Number(remaining & 0x1fn)] + timePart;
      remaining >>= 5n;
    }

    let temp = randomValue;
    let randomPart = "";
    for (let i = 0; i < 16; i++) {
      randomPart = CROCKFORD[Number(temp & 0x1fn)] + randomPart;
      temp >>= 5n;
    }
    return timePart + randomPart;
  }
}

const ulidGen = new ULIDGenerator();

export function ulid(): string {
  return ulidGen.ulid();
}

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const URL_SAFE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
const URL_SAFE_LEN = 64;

export function nanoid(size = 21): string {
  if (typeof size !== "number" || !Number.isFinite(size)) {
    throw new RangeError("nanoid size must be a finite number");
  }
  if (!Number.isInteger(size) || Object.is(size, -0)) {
    throw new RangeError("nanoid size must be an integer");
  }
  if (size < 0) {
    throw new RangeError("nanoid size must be non-negative");
  }
  if (size === 0) return "";
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  let result = "";
  for (let i = 0; i < size; i++) {
    result += URL_SAFE[bytes[i] as number % URL_SAFE_LEN];
  }
  return result;
}

export function shortid(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += (bytes[i] as number).toString(16).padStart(2, "0");
  }
  return result;
}

export function uuid(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

# @nds-stack/bun-id

> URL-safe ID generation for Bun — ULID, NanoID, ShortID, zero dependencies.

[![npm version](https://img.shields.io/npm/v/%40nds-stack%2Fbun-id?color=blue&logo=npm)](https://www.npmjs.com/package/@nds-stack/bun-id)
[![Bun](https://img.shields.io/badge/Bun-%3E%3D1.3.0-black?logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## Why bun-id

Bun has `crypto.randomUUID()`, but it's verbose (36 chars with dashes) and not URL-safe. Popular alternatives like `nanoid` and `ulid` include Node.js polyfills that Bun doesn't need.

bun-id provides 4 ID generators, all Bun-native and zero dependencies.

```typescript
import { ulid, nanoid, shortid, uuid } from "@nds-stack/bun-id";

ulid();      // → "0DH9X7BV4BAJ5G7KVM2P01BX5D5B7K" (26 chars, sortable)
nanoid();    // → "V1StGXR8_Z5jdHi6B-myT"       (21 chars, URL-safe)
shortid();   // → "a3b8c9d1"                     (8 chars, compact)
uuid();      // → "550e8400e29b41d4a716446655440000" (32 chars, no dashes)
```

---

## API

| Function | Output | Length | Sortable | URL-safe | Use Case |
|----------|--------|--------|----------|----------|----------|
| `ulid()` | Crockford base32 | 26 | ✅ Timestamp-prefixed | ✅ | Primary keys, event IDs |
| `nanoid(size?)` | URL-safe base64 | 21 (default) | ❌ | ✅ | Short URLs, tokens |
| `shortid()` | Hex | 8 | ❌ | ✅ | Log correlation, display |
| `uuid()` | Hex (no dashes) | 32 | ❌ | ✅ | Legacy compatibility |

### `ulid()`

```typescript
ulid(): string
```

Generates a ULID (Universally Unique Lexicographically Sortable Identifier). 48-bit timestamp prefix + 80-bit random = 128 bits encoded in 26 Crockford base32 characters.

**Properties:**
- **Sortable**: IDs generated close together sort lexicographically (timestamp prefix)
- **Case-insensitive**: Crockford base32 avoids ambiguous characters (I, L, O, U)
- **Time-safe**: Timestamp uses `Date.now()` — about 1ms precision

### `nanoid(size?)`

```typescript
nanoid(size?: number): string  // default: 21
```

URL-safe ID using `A-Za-z0-9_-` alphabet. 64 symbols = 6 bits per character.

**Collision probability (21 chars):** ~126 bits of entropy — virtually zero.

### `shortid()`

```typescript
shortid(): string  // 8 hex chars = 32 bits
```

Compact 8-character hex ID using 4 random bytes. Suitable for log correlation or display IDs where ~4 billion unique values are sufficient.

### `uuid()`

```typescript
uuid(): string  // 32 hex chars
```

Wraps `crypto.randomUUID()` and strips dashes for a compact 32-char hex string.

---

## How It Works

All functions use `crypto.getRandomValues()` for cryptographically secure randomness — the same source as `crypto.randomUUID()`. No `Math.random()` is used.

**ULID encoding:**
1. Get current timestamp as BigInt
2. Encode 41-50 bits as 10 Crockford base32 characters (BigInt bit shifting, LSB → string → reversed to MSB-first)
3. Generate 10 random bytes → 16 base32 characters (80-bit BigInt, 5 bits per char)
4. Concatenate time + random = 26 chars

**NanoID encoding:**
1. Generate N random bytes
2. Map each byte to URL-safe alphabet by modulo 64

**ShortID:**
1. Generate 4 random bytes
2. Convert each to 2 hex chars

**UUID (v4):**
1. Delegates to `crypto.randomUUID()`
2. Removes dashes

---

## Benchmarks

```
Bun 1.3.13, 10000 iterations x 3 samples

Operation   | Throughput
------------|-------------
ulid()      | 1.0M ops/s
nanoid()    | 2.7M ops/s
shortid()   | 3.2M ops/s
uuid()      | 3.9M ops/s
```

`nanoid` and `shortid` are faster because they use fewer random bytes. `uuid()` is slowest because `crypto.randomUUID()` is a system call.

---

## Limitations

- **Not sequential** — Only `ulid()` is sortable (by timestamp). `nanoid`, `shortid`, and `uuid` are random.
- **No timestamp extraction** — bun-id doesn't expose ULID timestamp decoding. Use a dedicated ULID library if needed.
- **ULID monotonic** — IDs generated in the same millisecond are guaranteed to be strictly increasing via a counter.
- **ShortID collisions** — 32 bits (4 billion values) means collisions are possible at scale. Use `nanoid()` or `ulid()` for primary keys.

---

## Comparison Table

| Feature | `crypto.randomUUID()` | `nanoid` (npm) | `ulid` (npm) | bun-id |
|---------|----------------------|----------------|--------------|--------|
| ULID | ❌ | ❌ | ✅ | ✅ |
| NanoID | ❌ | ✅ | ❌ | ✅ |
| ShortID | ❌ | ❌ | ❌ | ✅ |
| Bun-native | ✅ | ❌ Polyfills | ❌ Polyfills | ✅ |
| Zero dependencies | ✅ | ❌ | ❌ | ✅ |
| Bundle size | 0KB | ~3KB + deps | ~2KB + deps | **~0.6KB** |

---

## Error Handling

All ID generation functions use cryptographically secure randomness and never throw under normal use:

```typescript
import { ulid, nanoid, shortid, uuid } from "@nds-stack/bun-id";

ulid();      // always succeeds
nanoid();    // always succeeds
shortid();   // always succeeds
uuid();      // always succeeds
```

### Edge Case: `size=0`

```typescript
nanoid(0);   // → "" (empty string)
```

For negative size, non-integer size, NaN, or infinite values, `nanoid()` throws a `RangeError` with a descriptive message.

---

## Multi-Instance

ID generation is **safe for concurrent use** — `nanoid()`, `shortid()`, and `uuid()` are stateless and have no shared mutation. `ulid()` maintains internal state for monotonicity (counter for same-millisecond calls) but is still safe across workers and serverless runtimes since each call is independent:

```typescript
import { ulid } from "@nds-stack/bun-id";
import { Worker } from "bun";

// Each call is independent — no shared mutation
const id1 = ulid();
const id2 = ulid();

// Safe to call from multiple workers concurrently
new Worker(new URL("./worker.ts", import.meta.url));

// worker.ts
import { ulid } from "@nds-stack/bun-id";
console.log(ulid()); // independent generation
```

> **Collision probability** depends entirely on the quality of `crypto.getRandomValues()` — the same CSPRNG source used by `crypto.randomUUID()`. For `nanoid(21)` (~126 bits entropy), collisions are virtually impossible at scale.

---

## Customization Guide

### Create Prefixed IDs

```typescript
import { ulid, nanoid } from "@nds-stack/bun-id";

function prefixedUlid(prefix: string): string {
  return `${prefix}_${ulid()}`;
}

function prefixedNanoid(prefix: string): string {
  return `${prefix}_${nanoid()}`;
}

console.log(prefixedUlid("usr")); // "usr_0DH9X7BV4BAJ5G7KVM2P01BX5D"
console.log(prefixedNanoid("sess")); // "sess_V1StGXR8_Z5jdHi6B-myT"
```

### Create Sortable IDs with Custom Prefix

Combine ULID with a custom prefix to get sortable, human-readable identifiers:

```typescript
import { ulid } from "@nds-stack/bun-id";

function sortableId(entity: string): string {
  return `${entity}_${ulid()}`;
}

// These will sort lexicographically by timestamp
const order1 = sortableId("order"); // "order_0DH9X7...";
const order2 = sortableId("order"); // "order_0DH9X8...";
// order1 < order2 (timestamp-based ordering)
```

### Create IDs with Embedded Timestamps

Use ULID's timestamp prefix to extract creation time:

```typescript
import { ulid } from "@nds-stack/bun-id";

function createTimestampedId(): string {
  return ulid(); // first 10 chars encode timestamp
}

// Decode timestamp from ULID (manual)
function getUlidTimestamp(ulidStr: string): number {
  const timeChars = ulidStr.slice(0, 10);
  return timeChars.split("").reduce((acc, c) => {
    const val = "0123456789ABCDEFGHJKMNPQRSTVWXYZ".indexOf(c);
    return acc * 32 + val;
  }, 0);
}

const id = createTimestampedId();
console.log("Created at:", new Date(getUlidTimestamp(id)).toISOString());
```

---

## Real-World Example

### Using ULID as Primary Key

Complete example: generating sortable primary keys for a user database table.

```typescript
import { ulid, nanoid } from "@nds-stack/bun-id";
// import { db } from "./db";  // bun:sqlite or Postgres client

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

async function createUser(email: string, name: string): Promise<User> {
  const user: User = {
    id: ulid(),          // sortable primary key
    email,
    name,
    createdAt: new Date(),
  };

  // await db.run(
  //   "INSERT INTO users (id, email, name, created_at) VALUES (?, ?, ?, ?)",
  //   [user.id, user.email, user.name, user.createdAt.toISOString()]
  // );

  return user;
}

async function createSession(userId: string): Promise<string> {
  const sessionId = `sess_${nanoid()}`;  // prefixed, non-sortable token

  // await db.run(
  //   "INSERT INTO sessions (id, user_id, created_at) VALUES (?, ?, ?)",
  //   [sessionId, userId, new Date().toISOString()]
  // );

  return sessionId;
}

// Usage: Users will be ordered by creation time when sorted by ID
// SELECT * FROM users ORDER BY id;  ← lexicographically sorted by creation time
```

**Benefits of ULID as primary key:**
- **Sortable** — `ORDER BY id` gives creation order without a separate timestamp column
- **Unique** — 128 bits of randomness with timestamp prefix
- **URL-safe** — no special characters
- **Index-friendly** — monotonic prefix improves B-tree insertion performance

---

## License

MIT

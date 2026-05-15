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

ulid();      // → "0DH9X7BV4BAJ5G7KVM2P"     (20 chars, sortable)
nanoid();    // → "V1StGXR8_Z5jdHi6B-myT"       (21 chars, URL-safe)
shortid();   // → "a3b8c9d1"                     (8 chars, compact)
uuid();      // → "550e8400e29b41d4a716446655440000" (32 chars, no dashes)
```

---

## API

| Function | Output | Length | Sortable | URL-safe | Use Case |
|----------|--------|--------|----------|----------|----------|
| `ulid()` | Crockford base32 | 20 | ✅ Timestamp-prefixed | ✅ | Primary keys, event IDs |
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
3. Generate 10 random bytes → 10 base32 characters
4. Concatenate time + random = 20 chars

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
- **No monotonicity** — ULID generation in the same millisecond may not be strictly monotonic (no counter).
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

## License

MIT

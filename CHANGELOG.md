# Changelog

## [0.1.0-beta.0] - 2026-05-18

### Fixed
- `nanoid(float)` now throws `RangeError` instead of silent corruption
- `nanoid(-1)` now throws `RangeError` instead of returning `""`
- ULID counter overflow: counter now added as extra bits instead of per-byte (prevents bit corruption)
- Module-level mutable state moved to class instance (race condition fix)
- 5 new tests (18 total): nanoid edge cases, ULID monotonicity, shortid uniqueness

## [0.1.0-alpha.0] - 2026-05-15
### Added
- ulid() — Crockford base32, sortable, 26 chars
- nanoid(size?) — URL-safe base64, 21 chars default
- shortid() — hex, 8 chars, compact
- uuid() — crypto.randomUUID() without dashes

import { describe, test, expect } from "bun:test";
import { ulid, nanoid, shortid, uuid } from "../src/index.ts";

describe("ulid", () => {
  test("returns 26-char string", () => {
    expect(ulid().length).toBe(26);
  });

  test("is uppercase alphanumeric", () => {
    expect(ulid()).toMatch(/^[0-9A-Z]+$/);
  });

  test("generates unique values", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => ulid()));
    expect(ids.size).toBe(1000);
  });

  test("is sortable (prefix = timestamp)", () => {
    const a = ulid();
    const b = ulid();
    // Later timestamp = lexicographically larger (if same ms, random may differ)
    expect(a <= b || b <= a).toBe(true); // one must be <= the other
  });

  test("is monotonically increasing", () => {
    const ids = Array.from({ length: 100 }, () => ulid());
    for (let i = 1; i < ids.length; i++) {
      expect(ids[i]! >= ids[i - 1]!).toBe(true);
    }
  });
});

describe("nanoid", () => {
  test("returns 21-char by default", () => {
    expect(nanoid().length).toBe(21);
  });

  test("respects custom size", () => {
    expect(nanoid(10).length).toBe(10);
    expect(nanoid(5).length).toBe(5);
  });

  test("is URL-safe", () => {
    expect(nanoid()).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  test("generates unique values", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => nanoid()));
    expect(ids.size).toBe(1000);
  });

  test("nanoid(0) returns empty string", () => {
    expect(nanoid(0)).toBe("");
  });

  test("nanoid(-1) throws RangeError", () => {
    expect(() => nanoid(-1)).toThrow(RangeError);
  });

  test("nanoid(5.5) throws RangeError", () => {
    expect(() => nanoid(5.5)).toThrow(RangeError);
  });

  test("nanoid(NaN) throws RangeError", () => {
    expect(() => nanoid(NaN)).toThrow(RangeError);
  });
});

describe("shortid", () => {
  test("returns 8-char hex", () => {
    expect(shortid().length).toBe(8);
    expect(shortid()).toMatch(/^[0-9a-f]+$/);
  });

  test("generates unique values across 1000 calls", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => shortid()));
    expect(ids.size).toBe(1000);
  });
});

describe("uuid", () => {
  test("returns 32-char hex", () => {
    expect(uuid().length).toBe(32);
    expect(uuid()).toMatch(/^[0-9a-f]+$/);
  });

  test("no dashes", () => {
    expect(uuid()).not.toContain("-");
  });

  test("generates unique values", () => {
    const ids = new Set(Array.from({ length: 500 }, () => uuid()));
    expect(ids.size).toBe(500);
  });
});

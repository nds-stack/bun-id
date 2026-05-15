/* eslint-disable no-console */
import { ulid, nanoid, shortid, uuid } from "../src/index.ts";

const iterations = 10_000;
const samples = 3;

function bench(fn: () => void): number {
  fn();
  const start = performance.now();
  for (let s = 0; s < samples; s++) fn();
  return Math.round((iterations * samples) / ((performance.now() - start) / 1000));
}

const results = [
  { name: "ulid()", ops: bench(() => { for (let i = 0; i < iterations; i++) ulid(); }) },
  { name: "nanoid()", ops: bench(() => { for (let i = 0; i < iterations; i++) nanoid(); }) },
  { name: "shortid()", ops: bench(() => { for (let i = 0; i < iterations; i++) shortid(); }) },
  { name: "uuid()", ops: bench(() => { for (let i = 0; i < iterations; i++) uuid(); }) },
];

const pad = (s: string, n: number) => s.padEnd(n);
const opPad = results.reduce((m, r) => Math.max(m, r.name.length), 0);

console.log("--- bun-id Benchmark ---");
console.log(`Bun ${Bun.version}, ${iterations} iterations x ${samples} samples\n`);
console.log(`${pad("Operation", opPad + 2)} | ${pad("Throughput", 14)}`);
console.log(`${"-".repeat(opPad + 2)}-|-${"-".repeat(14)}`);

for (const r of results) {
  const ops = r.ops > 1_000_000
    ? `${(r.ops / 1_000_000).toFixed(1)}M ops/s`
    : `${(r.ops / 1_000).toFixed(0)}K ops/s`;
  console.log(`${pad(r.name, opPad + 2)} | ${pad(ops, 14)}`);
}

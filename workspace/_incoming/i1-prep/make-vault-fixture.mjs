#!/usr/bin/env node
// SYNTHETIC VAULT for i1 proof 1 — the warm model at scale.
// Deterministic (seeded PRNG): the same arguments always produce the same
// vault, so a benchmark number is reproducible evidence, not weather.
// Usage: node make-vault-fixture.mjs <outDir> [count=30000] [seed=1851]
// Emits: <count> notes across nested folders, frontmatter with mixed types
// (numbers, strings, booleans, dates, lists, wikilinks), body wikilinks and
// tags, plus two .base files exercising filters the model must serve.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [outDir, countArg, seedArg] = process.argv.slice(2);
if (!outDir) { console.error("usage: make-vault-fixture.mjs <outDir> [count] [seed]"); process.exit(2); }
const COUNT = Number(countArg ?? 30000);
const SEED = Number(seedArg ?? 1851);

// mulberry32 — tiny, deterministic, good enough for shapes.
let s = SEED >>> 0;
const rnd = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const int = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));

const FOLDERS = ["notes", "people", "specs", "specs/deep", "logs", "logs/2026", "reading", "reading/required", "archive", "archive/old"];
const STATUSES = ["open", "reading", "done", "parked"];
const TAGS = ["#book", "#book/classic", "#spec", "#risk", "#risk/high", "#daily", "#idea"];
const WORDS = ["model", "table", "filter", "expression", "vault", "index", "lane", "walk", "gate", "evidence", "mirror", "canvas"];

for (const f of FOLDERS) mkdirSync(join(outDir, f), { recursive: true });
const names = [];
for (let i = 0; i < COUNT; i++) names.push(`${pick(WORDS)}-${pick(WORDS)}-${i}`);

const t0 = Date.now();
for (let i = 0; i < COUNT; i++) {
  const folder = pick(FOLDERS);
  const links = Array.from({ length: int(0, 4) }, () => `"[[${names[int(0, COUNT - 1)]}]]"`);
  const items = Array.from({ length: int(0, 3) }, () => int(1, 100));
  const date = `2026-${String(int(1, 12)).padStart(2, "0")}-${String(int(1, 28)).padStart(2, "0")}`;
  const fm = [
    "---",
    `price: ${(rnd() * 100).toFixed(2)}`,
    `age: ${int(1, 40)}`,
    `status: ${pick(STATUSES)}`,
    `done: ${rnd() < 0.3}`,
    `published: ${date}`,
    items.length ? `items: [${items.join(", ")}]` : `items: []`,
    links.length ? `authors:\n${links.map((l) => `  - ${l}`).join("\n")}` : `authors: []`,
    `tags: [${pick(TAGS).slice(1)}]`,
    "---",
  ].join("\n");
  const body = `# ${names[i]}\n\nBody links ${pick(TAGS)}: ${Array.from({ length: int(0, 3) }, () => `[[${names[int(0, COUNT - 1)]}]]`).join(" ")}\n`;
  writeFileSync(join(outDir, folder, `${names[i]}.md`), `${fm}\n${body}`);
}

writeFileSync(join(outDir, "hot-path.base"), `filters:
  and:
    - 'status != "done"'
    - "price > 90"
    - file.inFolder("specs")
views:
  - type: table
    name: "Hot path"
    order: [file.name, price, age, status]
`);
writeFileSync(join(outDir, "tags-and-links.base"), `filters:
  or:
    - file.hasTag("book")
    - and:
        - file.hasTag("risk")
        - "!done"
views:
  - type: table
    name: "Tagged"
    groupBy: { property: note.status, direction: DESC }
    order: [file.name, status, published]
`);
console.log(JSON.stringify({ notes: COUNT, seed: SEED, folders: FOLDERS.length, bases: 2, write_ms: Date.now() - t0 }));
// The benchmark the record demands, phrased as three numbers this vault can
// now produce: model BUILD time over these notes, model MEMORY, and the time
// to FILTER all notes down to hot-path.base's result set. Filtering is the
// hot path; rendering is not.

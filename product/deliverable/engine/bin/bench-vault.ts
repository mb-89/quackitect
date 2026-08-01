// WHAT THE WARM MODEL COSTS, MEASURED RATHER THAN ASSERTED.
//
// The owner's instruction was to show the thing is possible before anything is
// reworked, and the target is Obsidian's own working range: thousands to tens
// of thousands of notes. So this builds an index over the REAL vault, then
// over a synthetic one at 30,000 notes, and reports build time, memory and
// the number that actually matters — cutting the whole set down to a few
// dozen.
//
// Run it with: node engine/bin/bench-vault.ts
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Vault } from "../vault.ts";

const REPO = fileURLToPath(new URL("../../../..", import.meta.url));

const ms = (n: number): string => `${n.toFixed(1)} ms`;
const mb = (n: number): string => `${(n / 1024 / 1024).toFixed(1)} MB`;

function heap(): number {
  global.gc?.();
  return process.memoryUsage().heapUsed;
}

/** Median of several runs: one timing of a millisecond-scale sweep is noise. */
function timed(runs: number, fn: () => number): { ms: number; kept: number } {
  const taken: number[] = [];
  let kept = 0;
  for (let i = 0; i < runs; i++) {
    const t0 = performance.now();
    kept = fn();
    taken.push(performance.now() - t0);
  }
  taken.sort((a, b) => a - b);
  return { ms: taken[Math.floor(taken.length / 2)], kept };
}

const STATES = ["open", "closed", "blocked", "shipped"];
const KINDS = ["matrix-row", "adr", "note", "gloss", "req"];

function makeVault(dir: string, n: number): void {
  rmSync(dir, { recursive: true, force: true });
  for (let i = 0; i < n; i++) {
    const bucket = join(dir, `g${String(i % 50).padStart(2, "0")}`);
    if (i % 50 === 0 || i < 50) mkdirSync(bucket, { recursive: true });
    const body = [
      "---",
      `kind: ${KINDS[i % KINDS.length]}`,
      `status: ${STATES[i % STATES.length]}`,
      `weight: ${i % 100}`,
      `accessed: 2026-0${(i % 9) + 1}-1${i % 10}`,
      "tags:",
      `  - t${i % 7}`,
      `  - ${i % 3 === 0 ? "book" : "paper"}`,
      "depends_on:",
      `  - n${(i + 1) % n}`,
      `  - n${(i + 2) % n}`,
      "---",
      "",
      `# node ${i}`,
      "",
      `Body text for node ${i}, with a link to [[n${(i + 3) % n}]].`,
      "",
    ].join("\n");
    writeFileSync(join(bucket, `n${i}.md`), body);
  }
}

function report(label: string, v: Vault): void {
  const s = v.measured();
  console.log(`\n${label}`);
  console.log(`  notes            ${s.notes}`);
  console.log(`  unreadable       ${s.unreadable}`);
  console.log(`  build            ${ms(s.buildMs)}`);
  console.log(`  read             ${mb(s.bytes)}`);
  if (s.notes > 0) console.log(`  per note         ${(s.buildMs / s.notes).toFixed(4)} ms`);
}

// --- the real vault --------------------------------------------------------

const real = new Vault(REPO);
real.build();
report("REAL VAULT", real);

for (const expr of ['kind == "matrix-row"', "file.name", 'file.hasTag("guidance")']) {
  const r = timed(9, () => real.filter(expr).length);
  console.log(`  filter ${JSON.stringify(expr).padEnd(28)} ${ms(r.ms).padStart(10)}  kept ${r.kept}`);
}

// --- thirty thousand -------------------------------------------------------

const SIZES = process.argv[2] !== undefined ? [Number(process.argv[2])] : [1000, 10000, 30000];
const dir = join(tmpdir(), "se-bench-vault");

for (const n of SIZES) {
  makeVault(dir, n);
  const before = heap();
  const v = new Vault(dir, dir);
  v.build();
  const sync = v.measured().buildMs;
  const after = heap();
  const pooled = new Vault(dir, dir);
  await pooled.buildAsync();
  report(`SYNTHETIC — ${n} notes`, v);
  console.log(`  heap held        ${mb(after - before)}`);
  console.log(`  build sync       ${ms(sync)}`);
  console.log(`  build pooled     ${ms(pooled.measured().buildMs)}   ${(sync / pooled.measured().buildMs).toFixed(1)}x`);
  pooled.stop();

  const cases: [string, string][] = [
    ["equality on a scalar", 'status == "blocked" && kind == "adr"'],
    ["a numeric comparison", "weight > 95"],
    ["a tag test", 'file.hasTag("book") && weight > 90'],
    ["a list membership", 'depends_on.contains("n7")'],
    ["a date comparison", 'accessed > date("2026-08-01")'],
    ["computed, no index possible", "weight % 97 == 0 && status.startsWith(\"o\")"],
  ];
  for (const [label, expr] of cases) {
    const r = timed(7, () => v.filter(expr).length);
    console.log(`  ${label.padEnd(28)} ${ms(r.ms).padStart(10)}  kept ${String(r.kept).padStart(5)}   ${expr}`);
  }

  // The incremental half: a full rebuild is a startup cost, never a per-edit one.
  const one = v.all()[Math.floor(n / 2)];
  const path = String((one.file as Record<string, unknown>).path);
  const inc = timed(9, () => {
    v.refresh(path);
    return 1;
  });
  console.log(`  ${"change one note".padEnd(28)} ${ms(inc.ms).padStart(10)}   ${v.all().length} held`);

  const fresh = join(dir, "g00", "brand-new.md");
  writeFileSync(fresh, "---\nkind: adr\nstatus: open\n---\n\n# new\n");
  const added = timed(9, () => {
    v.forget("g00/brand-new.md");
    v.refresh("g00/brand-new.md");
    return v.all().length;
  });
  console.log(`  ${"add one note".padEnd(28)} ${ms(added.ms).padStart(10)}   ${added.kept} held`);

  // The saved index: only the FIRST start of a big vault pays the full read.
  const bar: number[] = [];
  const cold = new Vault(dir, dir);
  const coldMs = (await cold.buildAsync((p) => {
    if (p.phase === "read") bar.push(p.done);
  })).buildMs;
  cold.saveIndex();
  const warm = new Vault(dir, dir);
  const w = warm.warmStart();
  console.log(`  ${"build cold".padEnd(28)} ${ms(coldMs).padStart(10)}   ${bar.length} progress ticks`);
  console.log(`  ${"start warm (saved index)".padEnd(28)} ${ms(warm.measured().buildMs).padStart(10)}   reused ${w.reused}, re-read ${w.reread}`);
  console.log(`  ${"warm rows match cold".padEnd(28)} ${String(warm.all().length === cold.all().length).padStart(10)}`);
  const sample = 'status == "blocked" && kind == "adr"';
  console.log(`  ${"warm filter matches cold".padEnd(28)} ${String(warm.filter(sample).length === cold.filter(sample).length).padStart(10)}`);
  cold.stop();
  warm.stop();

  const removed = timed(9, () => {
    v.forget("g00/brand-new.md");
    v.refresh("g00/brand-new.md");
    return v.all().length;
  });
  console.log(`  ${"remove one note".padEnd(28)} ${ms(removed.ms).padStart(10)}`);
  v.forget("g00/brand-new.md");
  console.log(`  ${"after removal".padEnd(28)} ${String(v.all().length).padStart(10)} held`);
  v.stop();
}

rmSync(dir, { recursive: true, force: true });
console.log("");

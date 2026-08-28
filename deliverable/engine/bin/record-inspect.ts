// see dsp-quality-toolchain.md#the-record-inspection
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

// THE EDGE MAP LIVES IN ONE PLACE. The reading demand walks the same graph this
// check reads, and two copies of a graph's shape diverge silently.
import { UPWARD } from "../traceup.ts";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const root = argValue("--root") ?? process.cwd();
const findings: string[] = [];
const caveats: string[] = [];

/** ITEM 11 — a node's upward links are readable from the file alone. */
function upwardLinksLiveInTheFile(): void {
  for (const [type, keys] of Object.entries(UPWARD)) {
    const dir = join(root, "spec", "trace", type);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      if (!name.endsWith(".md")) continue;
      const abs = join(dir, name);
      const head = frontmatter(readFileSync(abs, "utf8"));
      if (head === undefined) {
        findings.push(`item 11 · ${relative(root, abs)} — no frontmatter, so nothing is readable from the file alone`);
        continue;
      }
      const carried = keys.filter((k) => new RegExp(`^${k}:`, "m").test(head));
      if (carried.length === 0) {
        findings.push(`item 11 · ${relative(root, abs)} — a ${type} carries none of ${keys.join(" or ")} in its own file`);
      }
    }
  }
}

/** ITEM 12 — every recorded test run carries its question and its scope.
 *
 *  THE WHOLE FILE IS READ, line by line, so nothing is paged away. */
function testRunsCarryTheirQuestion(): void {
  const log = join(root, ".se", "calls.jsonl");
  if (!existsSync(log)) {
    caveats.push("no call log on this machine, so item 12 saw nothing");
    return;
  }
  // see dsp-quality-toolchain.md#the-latest-run-is-the-live-behaviour
  let seen = 0;
  let stale = 0;
  let latest: { q: boolean; s: boolean } | undefined;
  for (const line of readFileSync(log, "utf8").split("\n")) {
    if (line.trim() === "") continue;
    let rec: { tool?: string; response?: unknown };
    try {
      rec = JSON.parse(line) as typeof rec;
    } catch {
      continue;
    }
    if (rec.tool !== "se_test_verdict") continue;
    seen += 1;
    const body = typeof rec.response === "string" ? rec.response : JSON.stringify(rec.response ?? {});
    const q = /"question"\s*:\s*"[^"]+"/.test(body);
    const s = /"scope"\s*:\s*"[^"]+"/.test(body);
    if (!q && !s) {
      // Neither key at all is the older shape, which cannot carry them.
      // Judging it would block boot over a record nobody can fix.
      stale += 1;
      continue;
    }
    latest = { q, s };
  }
  if (seen === 0) {
    caveats.push("no test verdicts in the log yet, so item 12 proved nothing");
    return;
  }
  if (latest === undefined) {
    caveats.push(`item 12 read ${String(seen)} test run(s), all predating the 2026-08-17 fix, so there was nothing it could judge`);
    return;
  }
  if (!latest.q) findings.push("item 12 · the most recent test run carries no question");
  if (!latest.s) findings.push("item 12 · the most recent test run carries no scope");
  caveats.push(
    `item 12 read ${String(seen)} test run(s) from the log file; ${String(stale)} predate the 2026-08-17 fix and cannot carry one`,
  );
}

/** WHERE A FIELD REPORT IS ALLOWED TO LIVE, and it is one folder. */
const REPORT_HOME = ".se";

/** Folders a tree walk never needs to enter. */
const SKIP = new Set([".git", ".worktrees", "node_modules", "dist", "scratchpad", REPORT_HOME]);

/** ITEM 13 — no field report is in version control.
 *
 *  THE FIELD REPORT IS PRIVATE DATA. It is written for one person, it is not a
 *  corpus document, and it is delivered as a file the person downloads rather
 *  than as something the repository keeps.
 *
 *  WHY IT IS A CHECK AND NOT A SENTENCE. The rule is stated in the contract
 *  and twice in the cloud-runner card, and two reports were committed anyway —
 *  3,584 lines across two records, which nothing ever cited. A prose rule
 *  broken more than once wants a guard.
 *
 *  IT NAMES THE HOME RATHER THAN ONLY THE FAULT. An agent that put the file in
 *  the wrong place needs to be told the right one. */
function noFieldReportIsInVersionControl(): void {
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIP.has(entry.name)) walk(join(dir, entry.name));
        continue;
      }
      // THE SPELLING ON DISK, not the one in the author's head: a pattern
      // demanding the hyphen misses every file that omits it.
      if (!/^field[-_ ]?report.*\.md$/i.test(entry.name)) continue;
      const where = relative(root, join(dir, entry.name));
      findings.push(
        `item 13 · ${where} — a field report is private data and never goes in version control. Move it to ${REPORT_HOME}/field-report.md, which is gitignored, and hand it to the person as a downloadable file.`,
      );
    }
  };
  walk(root);
}

function frontmatter(text: string): string | undefined {
  if (!text.startsWith("---")) return undefined;
  const end = text.indexOf("\n---", 3);
  return end === -1 ? undefined : text.slice(3, end);
}

upwardLinksLiveInTheFile();
testRunsCarryTheirQuestion();
noFieldReportIsInVersionControl();

process.stdout.write("record-inspect: items 11, 12 and 13 of tsp-record-inspection\n");
process.stdout.write("                the other nine need acts nobody has performed recently\n");
for (const c of caveats) process.stdout.write(`                NOTE: ${c}\n`);
process.stdout.write("\n");

if (findings.length === 0) {
  process.stdout.write("record-inspect green on the three mechanical items\n");
  process.exit(0);
}

process.stdout.write(`record-inspect RED — ${String(findings.length)} finding(s)\n\n`);
for (const f of findings) process.stdout.write(`- ${f}\n`);
process.exitCode = 1;

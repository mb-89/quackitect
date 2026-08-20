// see dsp-quality-toolchain.md#the-record-inspection
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

/** THE UPWARD KEY EACH NODE TYPE OWES, from the trace schema's own direction:
 *  the newer artifact points at what it derives from. A node type absent here
 *  is a root and owes nothing upward. */
const UPWARD: Record<string, string[]> = {
  story: ["refines"],
  "use-case": ["refines"],
  requirement: ["refines"],
  function: ["satisfies"],
  element: ["implements"],
  interface: ["carries"],
  "design-spec": ["realizes"],
  "test-spec": ["verifies", "demonstrates"],
};

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

function frontmatter(text: string): string | undefined {
  if (!text.startsWith("---")) return undefined;
  const end = text.indexOf("\n---", 3);
  return end === -1 ? undefined : text.slice(3, end);
}

upwardLinksLiveInTheFile();
testRunsCarryTheirQuestion();

process.stdout.write("record-inspect: items 11 and 12 of tsp-record-inspection\n");
process.stdout.write("                the other ten need acts nobody has performed recently\n");
for (const c of caveats) process.stdout.write(`                NOTE: ${c}\n`);
process.stdout.write("\n");

if (findings.length === 0) {
  process.stdout.write("record-inspect green on the two mechanical items\n");
  process.exit(0);
}

process.stdout.write(`record-inspect RED — ${String(findings.length)} finding(s)\n\n`);
for (const f of findings) process.stdout.write(`- ${f}\n`);
process.exitCode = 1;

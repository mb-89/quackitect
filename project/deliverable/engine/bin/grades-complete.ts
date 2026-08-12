// EVERY REGISTER ENTRY CARRIES ITS GRADES — the check behind rank-unknowns.
//
// The exposure ranking is damage times likelihood, computed off
// `breaks_how_badly` and `how_likely` on every open entry. An ungraded entry
// cannot rank, so it silently falls out of the chart the pick reads — a
// register row nobody weighs is a risk nobody sees (owner ruling 2026-08-11:
// the state may not pass while any entry stands ungraded, whoever wrote it).
//
//   node engine/bin/grades-complete.ts --root <project root>
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function field(text: string, key: string): string {
  const m = new RegExp(`^${key}:[ \\t]*(.*)$`, "m").exec(text);
  return m === null ? "" : m[1].trim().replace(/^["']|["']$/g, "");
}

const root = argValue("--root") ?? process.cwd();
const raidDir = join(root, "project", "spec", "trace", "raid");
const problems: string[] = [];
// A closed or superseded entry no longer weighs on the chart; everything
// else does, decisions included — meth-raid puts the grades on every entry.
const RESTING = new Set(["closed", "superseded", "done", "obsolete"]);

const entries = existsSync(raidDir) ? readdirSync(raidDir).filter((n) => n.endsWith(".md")) : [];
for (const n of entries) {
  const text = readFileSync(join(raidDir, n), "utf8");
  const id = field(text, "id") || n.replace(/\.md$/, "");
  if (RESTING.has(field(text, "status"))) continue;
  const missing = ["breaks_how_badly", "how_likely"].filter((k) => field(text, k) === "");
  if (missing.length > 0) problems.push(`${id}: ungraded — missing ${missing.join(" and ")}`);
}

if (problems.length === 0) {
  process.stdout.write(entries.length === 0 ? "grades: no register entries yet\n" : `grades green: every live entry carries both grades\n`);
} else {
  process.stdout.write(`grades RED — ${problems.length} ungraded entr${problems.length === 1 ? "y" : "ies"}\n\n`);
  for (const p of problems) process.stdout.write(`- ${p}\n`);
  process.exitCode = 1;
}

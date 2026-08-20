// see dsp-decision-mathematics.md#every-register-entry-carries-its-grades
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { catalogItems } from "../catalogs.ts";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function field(text: string, key: string): string {
  const m = new RegExp(`^${key}:[ \\t]*(.*)$`, "m").exec(text);
  return m === null ? "" : m[1].trim().replace(/^["']|["']$/g, "");
}

/** A MINT COMMENT IS NOT AN ANSWER. A node is minted with the key present and
 *  a comment sitting exactly where the answer will sit, so blank and
 *  still-commented mean the same thing: nobody has said anything. */
const stillAComment = (v: string): boolean => /^<!--[\s\S]*-->$/.test(v.trim());

const root = argValue("--root") ?? process.cwd();
const raidDir = join(root, "spec", "trace", "raid");
const problems: string[] = [];
// A closed or superseded entry no longer weighs on the chart; everything
// else does, decisions included — meth-raid puts the grades on every entry.
const RESTING = new Set(["closed", "superseded", "done", "obsolete"]);

const SCALES: { key: string; catalog: string }[] = [
  { key: "breaks_how_badly", catalog: "damage_levels" },
  { key: "how_likely", catalog: "likelihood_levels" },
];

// AN EMPTY CATALOGUE IS A RED, NEVER A PASS. If the card moved or its
// `catalog_sections` heading was renamed, accepting everything would be the
// same silent hole this check exists to close.
const levels = new Map<string, string[]>();
for (const s of SCALES) {
  const items = catalogItems(root, s.catalog).map((x) => x.toLowerCase());
  if (items.length === 0) {
    problems.push(
      `${s.catalog}: the catalogue read back EMPTY — the card that declares it moved, or its catalog_sections heading was renamed`,
    );
  }
  levels.set(s.key, items);
}

const entries = existsSync(raidDir) ? readdirSync(raidDir).filter((n) => n.endsWith(".md")) : [];
for (const n of entries) {
  const text = readFileSync(join(raidDir, n), "utf8");
  const id = field(text, "id") || n.replace(/\.md$/, "");
  if (RESTING.has(field(text, "status"))) continue;
  for (const s of SCALES) {
    const v = field(text, s.key);
    const scale = levels.get(s.key) ?? [];
    if (v === "") {
      problems.push(`${id}: ungraded — ${s.key} is missing`);
    } else if (stillAComment(v)) {
      problems.push(`${id}: ungraded — ${s.key} still carries its mint comment, which is not an answer`);
    } else if (scale.length > 0 && !scale.includes(v.toLowerCase())) {
      problems.push(`${id}: OFF THE SCALE — ${s.key} says "${v}", and the scale offers ${scale.join(", ")}`);
    }
  }
}

// THE EXIT CODE FOLLOWED NOTHING. It was set to 1 after the branch rather than
// inside it, so the green path printed "grades green" and failed anyway, and
// the condition behind rank-unknowns could never pass whatever the register
// said.
if (problems.length === 0) {
  process.stdout.write(
    entries.length === 0 ? "grades: no register entries yet\n" : `grades green: every live entry carries both grades, on the scale\n`,
  );
} else {
  process.stdout.write(`grades RED — ${problems.length} problem${problems.length === 1 ? "" : "s"}\n\n`);
  for (const p of problems) process.stdout.write(`- ${p}\n`);
  process.exitCode = 1;
}

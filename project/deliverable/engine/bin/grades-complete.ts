// EVERY REGISTER ENTRY CARRIES ITS GRADES, AND EVERY GRADE IS ON THE SCALE —
// the check behind rank-unknowns.
//
// The exposure ranking is damage times likelihood, computed off
// `breaks_how_badly` and `how_likely` on every open entry. An ungraded entry
// cannot rank, so it silently falls out of the chart the pick reads — a
// register row nobody weighs is a risk nobody sees (owner ruling 2026-08-11:
// the state may not pass while any entry stands ungraded, whoever wrote it).
//
// TWO CHECKS USED TO DISAGREE, AND THE WEAKER ONE GUARDED THE STATE.
// This script asked only that the key was NON-EMPTY, and a mint comment is
// non-empty. The exposure chart asked that the VALUE was on the scale, and
// gave anything else likelihood -1, which never places a dot.
//
// WHAT THAT COST, measured 2026-08-14 (note-3465043278d3): nine entries still
// carried the mint comment and twenty-two more carried words nobody put on the
// scale — certain, near-certain, likely, possible, unlikely, rare. Thirty-two
// entries invisible to the pick, with this script green.
//
// SO IT READS THE CATALOGUE NOW, and the catalogue is read from the card that
// declares it rather than repeated here. meth-damage-scale carries
// `catalog: damage_levels` and meth-likelihood-scale its sibling. Editing a
// card changes what this accepts, in the same breath.
//
//   node engine/bin/grades-complete.ts --root <project root>
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
const raidDir = join(root, "project", "spec", "trace", "raid");
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
      problems.push(id + ": ungraded — " + s.key + " still carries its mint comment, which is not an answer");
    } else if (scale.length > 0 && !scale.includes(v.toLowerCase())) {
      problems.push(id + ": OFF THE SCALE — " + s.key + ' says "' + v + '", and the scale offers ' + scale.join(", "));
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

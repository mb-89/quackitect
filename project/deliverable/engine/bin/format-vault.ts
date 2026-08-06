// FORMAT THE VAULT'S FRONTMATTER, in place.
//
// The formatter existed with no way to RUN it. Every note was authored by
// hand and drifted from what formatNote would print, until most of the vault
// disagreed with it. frontmatter.test.ts fails loudly at that point, and it
// is right to: the first real edit to any of them would land in a diff
// nobody could read.
//
// THE ROUND TRIP IS PROVEN, which is what makes this safe to run over the
// whole vault. Its sibling test asserts, on every note, that reprinting
// changes neither the parsed keys nor the body. This tool only reprints.
//
// Run it after minting notes in bulk. That is when the drift happens.
//
//   node --experimental-strip-types project/deliverable/engine/bin/format-vault.ts [--check]
//
// --check writes nothing and exits 1 if anything would change, so a hook or
// a preflight can use the same code path as the fix.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { formatNote, readKeys, splitNote } from "../frontmatter.ts";
import { parseStateNote } from "../notes.ts";
import { readVault } from "../tables.ts";

const REPO_ROOT = fileURLToPath(new URL("../../../..", import.meta.url));
const check = process.argv.includes("--check");

let checked = 0;
let changed = 0;
const touched: string[] = [];

for (const row of readVault(REPO_ROOT)) {
  const abs = `${REPO_ROOT}/project/${(row.file as { path: string }).path}`;
  const raw = readFileSync(abs, "utf8");
  if (!splitNote(raw).fenced) continue;
  checked++;
  const out = formatNote(raw, abs);
  if (out === raw) continue;

  // REFUSE TO WRITE A NOTE THAT WOULD MEAN SOMETHING ELSE. The round trip is
  // proven by test, and a proof that never runs at the moment of writing is
  // worth less than one that does.
  const sameKeys = JSON.stringify(readKeys(out, abs)) === JSON.stringify(readKeys(raw, abs));
  const sameBody = parseStateNote(out).body === parseStateNote(raw).body;
  if (!sameKeys || !sameBody) {
    console.error(`REFUSED ${abs} — reprinting would change what it means`);
    process.exit(2);
  }

  changed++;
  touched.push(abs);
  if (!check) writeFileSync(abs, out, "utf8");
}

const verb = check ? "would be reformatted" : "reformatted";
console.log(`${changed} of ${checked} notes ${verb}`);
if (check && changed > 0) {
  for (const t of touched) console.log(`  ${t}`);
  process.exit(1);
}

// TESTS MUST NOT OVER-SPECIFY THE GUIDANCE LAYOUT (owner ruling 2026-08-06:
// moving guidance broke 18 assertions and ZERO lines of engine — every red
// was a test pinning something no rule guarantees).
//
// The rule, made mechanical as the note demanded:
//
// - No test file names a REAL guidance path. helpers.ts is the one home:
//   it derives what the walk owes from the engine's own route (readDocs,
//   checkDocs), the craft list from its folder (craftDocs), and holds the
//   few named SUBJECT pages tests are genuinely about.
// - A synthetic path in a throwaway root cannot break on a move, so only
//   paths that exist in the repository count as offences.
import { strict as assert } from "node:assert";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

test("no test names a real guidance path — helpers.ts is the one home", () => {
  const offenders: string[] = [];
  for (const f of readdirSync(HERE).filter((e) => e.endsWith(".test.ts"))) {
    const text = readFileSync(join(HERE, f), "utf8");
    for (const m of text.matchAll(/project\/guidance\/[A-Za-z0-9_./-]*/g)) {
      const p = m[0].replace(/[./]+$/, "");
      if (!existsSync(join(REPO_ROOT, p))) continue;
      offenders.push(`${f}: ${p}`);
    }
  }
  assert.deepEqual(offenders, [], "a real guidance path in a test pins layout no rule guarantees — ask helpers for it");
});

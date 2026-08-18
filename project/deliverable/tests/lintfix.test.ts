// THE LANE FIXES WHAT IS MECHANICAL (owner ruling 2026-08-03): a write to a
// file the project's linter covers comes back formatted and safe-fixed, and
// the result SAYS SO. These cases run the real fixer binary against fixture
// roots, so they prove the wiring, not a mock.
//
// SEQUENTIAL ON PURPOSE: the file sets SE_BIOME_JS, and process.env is
// process-global. Quarantined here so every other file stays concurrent.
import { strict as assert } from "node:assert";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { fileWrite } from "../engine/files.ts";
import { filePatch } from "../engine/files-patch.ts";
import { contentHash } from "../engine/hash.ts";
import { freshRoot } from "./helpers.ts";

const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));
process.env.SE_BIOME_JS = join(REPO_ROOT, "project", "deliverable", "node_modules", "@biomejs", "biome", "bin", "biome");

/** A fixture root whose deliverable carries the linter's config — the same
 *  shape as the real biome.json, narrowed to a directory of the fixture's
 *  OWN. Never the borrowed engine/: that directory is a junction into the
 *  SHARED test template, and a write through it pollutes every later run
 *  (the standing battery red of 2026-08-04 was exactly this). */
function lintedRoot(): string {
  const root = freshRoot();
  const del = join(root, "project", "deliverable");
  mkdirSync(join(del, "src"), { recursive: true });
  writeFileSync(
    join(del, "biome.json"),
    JSON.stringify({
      files: { includes: ["src/**"] },
      formatter: { enabled: true, indentStyle: "space", indentWidth: 2, lineWidth: 140 },
      linter: { enabled: true, rules: { preset: "recommended" } },
    }),
    "utf8",
  );
  return root;
}

test("a write to a covered file comes back formatted, announced, hash refreshed", () => {
  const root = lintedRoot();
  const r = fileWrite(root, "project/deliverable/src/messy.ts", "export const  answer=41+ 1\n", null);
  const disk = readFileSync(join(root, "project", "deliverable", "src", "messy.ts"), "utf8");
  assert.equal(disk, "export const answer = 41 + 1;\n", "the fixer formatted the file in place");
  assert.ok(r.lint_fixed !== undefined, "the result announces the fix");
  assert.equal(r.hash, contentHash(disk), "the returned hash is the FIXED content, so the next CAS write holds");
});

test("a finding the safe fixes cannot reach rides the result", () => {
  const root = lintedRoot();
  const r = fileWrite(root, "project/deliverable/src/loose.ts", "export function f(x: any): any {\n  return x;\n}\n", null);
  assert.ok(r.lint_findings !== undefined, "unfixable findings are reported, not swallowed");
  assert.match(r.lint_findings, /noExplicitAny/, "the finding names its rule");
});

test("a patch announces the fixer's work in corrected and refreshes the hash", () => {
  const root = lintedRoot();
  const p = "project/deliverable/src/patchy.ts";
  fileWrite(root, p, "export const a = 1;\n", null);
  const r = filePatch(root, [{ path: p, old_string: "export const a = 1;", new_string: "export const  a=1 ;" }]);
  const disk = readFileSync(join(root, "project", "deliverable", "src", "patchy.ts"), "utf8");
  assert.ok(!disk.includes("  a=1"), "the fixer reformatted the patched text");
  assert.ok(
    (r.corrected ?? []).some((c) => c.includes("safe fixes")),
    "the correction is announced by name",
  );
  assert.equal(r.applied[0].hash, contentHash(disk), "the returned hash matches the fixed disk state");
});

test("an uncovered file is left exactly as written", () => {
  const root = lintedRoot();
  const raw = "const   x=1\n";
  const r = fileWrite(root, "project/tools/outside.ts", raw, null);
  assert.equal(readFileSync(join(root, "project", "tools", "outside.ts"), "utf8"), raw, "outside the config, the write stands verbatim");
  assert.equal(r.lint_fixed, undefined, "nothing is announced where nothing ran");
});

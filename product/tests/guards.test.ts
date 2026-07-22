// CI guards (design §17 B0): dependency direction kb -> se is forbidden,
// and no shared utils package exists between modules. Mechanical, LLM-free.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const repoRoot = join(import.meta.dirname, "..", "..");
const siblingKb = join(repoRoot, "..", "benjamin");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.(ts|js|mjs|cjs)$/.test(e.name)) out.push(p);
  }
  return out;
}

test("no shared utils package between modules", () => {
  for (const banned of ["shared", "utils", "common"]) {
    assert.ok(!existsSync(join(repoRoot, banned)), `banned top-level dir: ${banned}`);
    assert.ok(!existsSync(join(repoRoot, "product", "modules", banned)), `banned module: ${banned}`);
  }
});

test("se.structure holds at the root: ~5 visible entries, dotfolders exempt", () => {
  const visible = readdirSync(repoRoot, { withFileTypes: true })
    .map((e) => e.name)
    .filter((n) => !n.startsWith(".") && n !== "node_modules" && n !== "package-lock.json");
  assert.ok(visible.length <= 7, `root too noisy (${visible.length}): ${visible.join(", ")}`);
});

test("dependency direction: kb imports nothing of se (sibling scan, best effort)", (t) => {
  if (!existsSync(siblingKb)) {
    t.skip("sibling benjamin checkout not present");
    return;
  }
  const offenders: string[] = [];
  for (const f of walk(siblingKb)) {
    const src = readFileSync(f, "utf8");
    if (/from\s+["'](se|quackitect)[/"']|require\(\s*["'](se|quackitect)[/"']/.test(src)) {
      offenders.push(f);
    }
  }
  assert.deepEqual(offenders, [], `kb must not import se: ${offenders.join(", ")}`);
});

test("se module declaration exists and declares the kb dependency", () => {
  const mod = JSON.parse(readFileSync(join(repoRoot, "product", "modules", "se", "module.json"), "utf8"));
  assert.equal(mod.id, "se");
  assert.ok(mod.depends_on.includes("kb"));
});

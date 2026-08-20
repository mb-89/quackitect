import { strict as assert } from "node:assert";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { placeSkills, skillTargets } from "../engine/promptlayer.ts";

const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

test("deep research skill is projected identically for supported harness paths", () => {
  const opened = mkdtempSync(join(tmpdir(), "se-skills-"));
  try {
    const written = placeSkills(REPO_ROOT, opened);
    const targets = skillTargets(opened, "deep-research");
    assert.deepEqual(written, targets);
    const source = readFileSync(join(REPO_ROOT, "project", "guidance", "skills", "deep-research", "SKILL.md"), "utf8");
    for (const target of targets) assert.equal(readFileSync(target, "utf8"), source);
  } finally {
    rmSync(opened, { recursive: true, force: true });
  }
});

// The cage's live inventory (tsp-native-project-tools-stay-outside-the-cage).
//
// SMALL FILES ON PURPOSE. See guidance/craft/software.md.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { excludedTools, inventoryProblems, NATIVE_EXCEPTIONS, NATIVE_PROJECT_TOOLS } from "../engine/cage-inventory.ts";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const COPILOT_CAGE = join(REPO_ROOT, "deliverable", "cage", "copilot-cage.json");

function shippedExclusions(): string[] {
  const cage = JSON.parse(readFileSync(COPILOT_CAGE, "utf8")) as { exclude_args?: string[] };
  return excludedTools(cage.exclude_args ?? []);
}

describe("the caged inventory holds no project tool and keeps the exception", () => {
  test("the SHIPPED cage excludes every native tool that reaches the project", () => {
    const problems = inventoryProblems(shippedExclusions());
    const holes = problems.filter((p) => p.why.includes("reaches the project"));
    assert.deepEqual(holes, [], `uncaged project tools: ${holes.map((h) => h.tool).join(", ")}`);
  });

  test("the shipped cage keeps native web search, the one research exception", () => {
    const excluded = shippedExclusions();
    for (const t of NATIVE_EXCEPTIONS) assert.equal(excluded.includes(t), false, `${t} must survive the cage`);
  });

  test("bash and rg are named — an uncaged shell and search are the worst holes", () => {
    const excluded = shippedExclusions();
    assert.equal(excluded.includes("bash"), true, "an uncaged shell walks straight past the lane");
    assert.equal(excluded.includes("rg"), true, "an uncaged search reads the project unlogged");
  });

  test("a hole is reported with the tool that caused it, not as a bare count", () => {
    const missing = NATIVE_PROJECT_TOOLS.filter((t) => t !== "bash");
    const problems = inventoryProblems([...missing]);
    assert.equal(problems.length, 1);
    assert.equal(problems[0].tool, "bash");
    assert.match(problems[0].why, /reaches the project/);
  });

  test("excluding the exception is its own failure, pulling the opposite way", () => {
    const problems = inventoryProblems([...NATIVE_PROJECT_TOOLS, "web_search"]);
    assert.equal(problems.length, 1);
    assert.equal(problems[0].tool, "web_search");
    assert.match(problems[0].why, /research exception/);
  });

  test("the argument list is read as the host reads it, stopping at the next flag", () => {
    const parsed = excludedTools(["--excluded-tools", "bash", "rg", "--allow-tool", "se"]);
    assert.deepEqual(parsed, ["bash", "rg"], "names after the next flag belong to that flag");
    assert.deepEqual(excludedTools(["--allow-tool", "se"]), [], "no exclusion flag means nothing is excluded");
  });
});

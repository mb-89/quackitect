// ONE SATELLITE, ONE RECORD (dsp-core-and-satellite, el-satellite).
//
// The satellite is ROOTED IN ITS RECORD'S TREE, so a relative path cannot
// address another record by accident. That is structural, not checked.
//
// THE GIT ADAPTER MERGES, IT DOES NOT REBASE. SE-C-002 forbids a rebase and
// the git allowlist has no such verb. The interface used to be called `rebase`
// and promised exactly the operation the lane refuses; found and renamed while
// building this adapter on 2026-08-14.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, test } from "node:test";
import { type GitRun, gitLaneFor, Satellite } from "../engine/satellite.ts";
import { anyGuidanceDoc } from "./helpers.ts";

const RECORD = "project/spec/iterations/i27-x";
const GUIDE = anyGuidanceDoc();

/** A tree with a delta folder, as an agent editing the machine from inside
 *  their own record would leave it. */
function treeWithOverride(rel?: string): string {
  const tree = mkdtempSync(join(tmpdir(), "se-sat-"));
  if (rel !== undefined) {
    const abs = join(tree, RECORD, "delta", rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, "the record's own copy", "utf8");
  }
  return tree;
}

/** A git that answers however the case needs, and records what it was asked. */
function fakeGit(answers: Record<string, { ok: boolean; stdout?: string; stderr?: string }>): {
  run: GitRun;
  asked: string[][];
} {
  const asked: string[][] = [];
  const run: GitRun = (args) => {
    asked.push(args);
    const a = answers[args[0]] ?? { ok: true };
    return { ok: a.ok, stdout: a.stdout ?? "", stderr: a.stderr ?? "" };
  };
  return { run, asked };
}

describe("the satellite", { concurrency: true }, () => {
  test("a record with no override starts serving, with nothing to reconcile", () => {
    const sat = new Satellite("i27-x", treeWithOverride(), RECORD);
    const { run } = fakeGit({});
    const state = sat.start(gitLaneFor(sat.tree, "v3", run));

    assert.equal(state.serving, true);
    assert.deepEqual(state.overrides, [], "most records hold no override at all");
    assert.equal(sat.serving(), true);
  });

  test("it serves its record's own copy first and trunk second, never both", () => {
    const sat = new Satellite("i27-x", treeWithOverride("project/deliverable/engine/session.ts"), RECORD);
    const { run } = fakeGit({});
    sat.start(gitLaneFor(sat.tree, "v3", run));

    const own = sat.serve("project/deliverable/engine/session.ts");
    assert.equal(own.from, "record", "the record's copy wins, and nothing is merged");

    const shared = sat.serve("project/deliverable/engine/paths.ts");
    assert.equal(shared.from, "trunk", "everything it did not change comes from trunk");
  });

  test("a stale override STOPS the satellite, and the conflict carries git's own words", () => {
    const sat = new Satellite("i27-x", treeWithOverride("project/deliverable/engine/session.ts"), RECORD);
    const { run } = fakeGit({
      merge: {
        ok: false,
        stdout:
          "Auto-merging project/deliverable/engine/session.ts\nCONFLICT (content): Merge conflict in project/deliverable/engine/session.ts",
      },
      commit: { ok: false },
    });
    const state = sat.start(gitLaneFor(sat.tree, "v3", run));

    assert.equal(state.serving, false, "a partial levelling never serves");
    assert.match(String(state.conflict), /session\.ts/, "the file name is the only part anybody can act on");
    assert.throws(() => sat.serve("project/deliverable/engine/session.ts"), /not serving/, "a stopped satellite answers nothing");
  });

  test("it MERGES rather than rebasing, because SE-C-002 forbids the rewrite", () => {
    const sat = new Satellite("i27-x", treeWithOverride(GUIDE), RECORD);
    const { run, asked } = fakeGit({});
    sat.start(gitLaneFor(sat.tree, "v3", run));

    const verbs = asked.map((a) => a[0]);
    assert.equal(verbs.includes("merge"), true, "reconciling is a merge");
    assert.equal(verbs.includes("rebase"), false, "and never a rebase — the lane has no such verb");
  });

  test("a levelling that brought no change still counts as levelled", () => {
    const sat = new Satellite("i27-x", treeWithOverride(GUIDE), RECORD);
    const { run } = fakeGit({ commit: { ok: false, stdout: "nothing to commit, working tree clean" } });
    const state = sat.start(gitLaneFor(sat.tree, "v3", run));

    assert.equal(state.serving, true, "git says nothing-to-commit with exit 1, and that is not a failure");
  });

  test("only method and engine may be overridden, because evidence is not a delta", () => {
    const sat = new Satellite("i27-x", treeWithOverride(), RECORD);
    assert.equal(sat.mayOverride("project/deliverable/engine/session.ts"), true);
    assert.equal(sat.mayOverride(GUIDE), true);
    assert.equal(sat.mayOverride("project/spec/iterations/i27-y/evidence/a.md"), false);
  });

  test("the override list says what this record has done to the machine", () => {
    const sat = new Satellite("i27-x", treeWithOverride("project/deliverable/engine/session.ts"), RECORD);
    assert.deepEqual(sat.overrides(), ["project/deliverable/engine/session.ts"]);
  });
});

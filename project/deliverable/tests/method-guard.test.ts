// WHERE A METHOD WRITE LANDS, AND WHERE A RECORD'S OWN WORK LANDS.
//
// WHY THIS FILE EXISTS. Nothing tested either mechanism. A search of the whole
// test folder for METHOD_WRITE_BOUND, SE-C-134 and fansOut returned nothing
// (2026-08-14). The only thing proving the old guard worked was that it fired
// at whoever was driving.
//
// SE-C-134 IS NOW RETIRED, and these tests pin what replaced it: shared method
// RESOLVES to the machine root instead of being REFUSED from a record. The
// danger is the same one either way — a record's copy of the engine fanning
// out over trunk at a merge, which really happened on 2026-08-07.
//
// A TEST ROOT IS NEVER SELF-HOSTING, so a bound record here really does get a
// worktree. Without that, none of these assertions would mean anything.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { CLAUSES } from "../engine/errors.ts";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { anyGuidanceDoc, call, freshRoot } from "./helpers.ts";

/** A fresh root that is a real git repo, the way worktree.test.ts does it. */
function gitRoot(): string {
  const root = freshRoot();
  const g = (...a: string[]): void => {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8" });
    assert.equal(r.status, 0, `git ${a.join(" ")}: ${r.stderr}`);
  };
  g("init", "-q", "-b", "v3");
  g("add", "-A");
  g("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "seed");
  g("config", "user.name", "t");
  g("config", "user.email", "t@t");
  return root;
}

describe("the method guard", { concurrency: true }, () => {
  test("shared method resolves to the MACHINE ROOT from inside a bound record", () => {
    const root = gitRoot();
    const s = new Session(root);
    const minted = s.expeditionNew("spike", "Guard The Method") as { created: string };
    s.expeditionOpen(minted.created);
    assert.ok(s.workRoot().includes(".worktrees"), "the record must actually be bound for this to mean anything");

    // THE CLAIM THAT RETIRED SE-C-134. A method path resolves to the machine
    // root whatever tree is bound, so the write cannot land in a tree that
    // does not own it. Refusing it was the old answer to the same danger.
    for (const rel of [
      anyGuidanceDoc(),
      "project/deliverable/machines/items/element.md",
      "project/deliverable/engine/session.ts",
      "project/deliverable/tests/pull.test.ts",
    ]) {
      assert.equal(s.laneRoot(rel), root, `${rel} is shared method and belongs to the machine`);
    }

    // AND THE TWO WERE NOT COLLAPSED INTO ONE ANSWER. A record's own content
    // still rides its own tree, which is what a bound walk is for.
    const own = `project/spec/expeditions/${minted.created}/evidence/scratch.md`;
    assert.notEqual(s.laneRoot(own), root, "the record's own work stays in the record's tree");
  });

  test("the retired clause is gone from the registry and its number is not reused", () => {
    assert.equal(
      Object.values(CLAUSES).includes("SE-C-134" as never),
      false,
      "SE-C-134 is retired — resolution replaced it, so nothing may issue it again",
    );
  });

  test("a record's OWN evidence is never refused while bound", async () => {
    const root = gitRoot();
    const s = new Session(root);
    const minted = s.expeditionNew("spike", "Own Work Is Fine") as { created: string };
    s.expeditionOpen(minted.created);

    const server = buildServer(root, s);
    const ok = await call(server, "se_file_write", {
      path: `project/spec/expeditions/${minted.created}/evidence/scratch.md`,
      content: "the record's own work",
      base_hash: null,
    });

    // THE CLAIM IS ABOUT THE METHOD GUARD, not about every other gate. A walk
    // parked at start refuses writes for its own reason (SE-C-110), and that
    // is not what this test is about. What must never happen is SE-C-134
    // firing on a record's own evidence.
    const body = ok.body as { clause?: string };
    assert.notEqual(body.clause, "SE-C-134", "a bound walk exists to write the record's own content");
  });

  test("a method write reaches every tree", () => {
    const root = gitRoot();
    const binder = new Session(root);
    const minted = binder.expeditionNew("spike", "Fan It Out") as { created: string };
    binder.expeditionOpen(minted.created);
    const worktree = binder.workRoot();
    assert.ok(worktree.includes(".worktrees"), "there must be a second tree for a fan-out to mean anything");

    // THE FAN-OUT IS session.fanOutMethod, and this exercises it where it
    // lives. Driving it through the lane would test the walk's legal-tool
    // gate instead, which is a different claim and already has its own tests.
    const rel = "project/guidance/fanned.md";
    mkdirSync(join(root, "project", "guidance"), { recursive: true });
    writeFileSync(join(root, rel), "shared method", "utf8");
    const reached = binder.fanOutMethod(rel, root);

    assert.ok(reached.includes(worktree), `the fan-out must name the tree it reached: ${JSON.stringify(reached)}`);
    assert.ok(existsSync(join(root, rel)), "the main tree has it");
    assert.equal(readFileSync(join(root, rel), "utf8"), "shared method");

    // THE CLAIM UNDER TEST, from paths.ts: a METHOD write must reach every
    // tree, so a change takes effect wherever the reader is standing.
    const inWorktree = join(worktree, rel);
    assert.ok(
      existsSync(inWorktree),
      "a method file written unbound must reach the record's tree too — otherwise a record keeps an old machine and nothing says so",
    );
    assert.equal(readFileSync(inWorktree, "utf8"), "shared method");
  });
});

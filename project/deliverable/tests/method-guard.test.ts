// THE METHOD GUARD AND THE FAN-OUT — the two mechanisms nothing tested.
//
// WHY THIS FILE EXISTS. Before it, the only thing proving SE-C-134 works was
// that it fired at whoever was driving. A search of the whole test folder for
// METHOD_WRITE_BOUND, SE-C-134 and fansOut returned nothing (2026-08-14).
//
// That was survivable only while this product used worktrees on itself. It is
// about to stop, on the self-hosting flag, so the live exercise goes away and
// these take its place.
//
// A TEST ROOT IS NEVER SELF-HOSTING, so the guard still fires here after this
// product stops tripping it. That is the whole point of writing them first.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, freshRoot } from "./helpers.ts";

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
  test("a method write from inside a bound record is refused, and the refusal carries its remedy", async () => {
    const root = gitRoot();
    const s = new Session(root);
    const minted = s.expeditionNew("spike", "Guard The Method") as { created: string };
    s.expeditionOpen(minted.created);
    assert.ok(s.workRoot().includes(".worktrees"), "the record must actually be bound for this to mean anything");

    const server = buildServer(root, s);
    const refused = await call(server, "se_file_write", {
      path: "project/guidance/contract.md",
      content: "a method file, written from inside a record",
      base_hash: null,
    });
    const body = refused.body as { clause?: string; remedy?: { tool?: string; args?: Record<string, unknown> } };

    assert.equal(refused.isError, true, "a method write while bound must refuse");
    assert.equal(body.clause, "SE-C-134");
    assert.equal(body.remedy?.tool, "se_pull", "a refusal carries an executable remedy");
    assert.equal(typeof body.remedy?.args?.escape, "string", "and the remedy is the escape, not a sentence");
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

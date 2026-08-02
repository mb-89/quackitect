// expedition worktrees, escape and pause — the git-heavy cases
//
// SMALL FILES ON PURPOSE (owner ruling, 2026-07-30). A test file is the
// only unit that reaches a second core, so themes get their own file and
// the suite uses the machine it runs on. See guidance/software.md.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, freshRoot, pullBoot, pullTo } from "./helpers.ts";

// Concurrent: every case builds its own root and touches no global.
describe("worktree", { concurrency: true }, () => {
test("expeditions: worktree lifecycle — new, bind, work lands in the worktree, close merges", async () => {
  const { Session } = await import("../engine/session.ts");
  const { spawnSync } = await import("node:child_process");
  const { readFileSync, existsSync } = await import("node:fs");
  const { join } = await import("node:path");
  const root = freshRoot();
  const g = (...a: string[]) => {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8" });
    assert.equal(r.status, 0, `git ${a.join(" ")}: ${r.stderr}`);
  };
  g("init", "-q", "-b", "v3");
  g("add", "-A");
  g("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "seed");
  g("config", "user.name", "t"); g("config", "user.email", "t@t");

  const s = new Session(root);
  const minted = s.expeditionNew("spike", "Try The Thing!") as { created: string };
  assert.match(minted.created, /^e1-spike-try-the-thing/);
  // The RECORD is minted with the expedition, on its branch — the list
  // serves its frontmatter.
  const open1 = (s.expeditionList() as { open: { id: string; goal?: string; status?: string }[] }).open;
  assert.equal(open1.length, 1);
  assert.equal(open1[0].id, minted.created);
  assert.equal(open1[0].goal, "Try The Thing!");
  assert.equal(open1[0].status, "open");

  // bind: the lane's working root switches to the worktree
  s.expeditionOpen(minted.created);
  assert.ok(s.workRoot().includes(".worktrees"), "bound root is the worktree");
  const { fileWrite } = await import("../engine/files.ts");
  fileWrite(s.workRoot(), "scratch.md", "expedition work", null);
  assert.ok(existsSync(join(s.workRoot(), "scratch.md")));
  assert.ok(!existsSync(join(root, "scratch.md")), "main tree untouched while bound");

  // While bound, decision ops land in the RECORD too (parts per visit).
  s.decisions.apply("continue_expedition/work@0", { op: "update", brief: "working in the record" });
  const recDir = join(s.workRoot(), "product", "spec", "expeditions", minted.created);
  assert.ok(readFileSync(join(recDir, "decisions.jsonl"), "utf8").includes("working in the record"));

  // Closing without a REPORT is refused — an expedition ends with one.
  assert.throws(() => s.expeditionClose(true), (e) => (e as { clause?: string }).clause === "SE-C-112");

  // THE LEAVE GATE: entry_evidence_form on leave — unmet until the record's
  // page passes the lint; filling it through the form machinery creates
  // report.md, which also satisfies the close guard.
  const { generateContinueExpedition, shortId } = await import("../engine/expmachine.ts");
  const gen = generateContinueExpedition(root);
  const leave = gen.decl.states.find((st) => st.id === `${shortId(minted.created)}-leave`)!;
  assert.deepEqual(leave.entry?.evidence_form, ["expedition-leave"]);
  assert.equal(s.conditionKeyMet(gen.decl, leave, "evidence_form", "enter"), false, "no page yet");
  // Agent PREFILL stays inert: the human confirms it, then the page passes.
  s.formSave("expedition-leave", {
    "What was the goal": "<!-- try the thing -->",
    "What was done": "did it",
    "What settled it": "the test run",
    "What was not done": "nothing",
  });
  s.formDone("expedition-leave", "agent");
  assert.equal(s.conditionKeyMet(gen.decl, leave, "evidence_form", "enter"), false, "unconfirmed prefill blocks the page");
  s.formConfirm("expedition-leave", "What was the goal", 0);
  s.formDone("expedition-leave", "human");
  assert.equal(s.conditionKeyMet(gen.decl, leave, "evidence_form", "enter"), true, "confirmed + done passes the lint");

  // close: leftovers committed, merged back, worktree gone, lane unbound
  const closed = s.expeditionClose(true) as { merged: boolean };
  assert.equal(closed.merged, true);
  assert.equal(s.workRoot(), root);
  assert.equal(readFileSync(join(root, "scratch.md"), "utf8"), "expedition work");
  // CLOSED RECORDS LIVE IN GIT (owner ruling 2026-07-28): the close
  // retires the record dir from the tree; the branch serves it, stamped
  // closed + applied — the close IS the ruling (owner 2026-07-27).
  assert.equal(existsSync(join(root, "product", "spec", "expeditions", minted.created)), false, "the record dir left the tree");
  const rec = spawnSync("git", ["show", `exp/${minted.created}:product/spec/expeditions/${minted.created}/record.md`], { cwd: root, encoding: "utf8" }).stdout;
  assert.match(rec, /^status: closed$/m);
  assert.match(rec, /^ruling: applied$/m);
  assert.equal((s.expeditionList() as { open: unknown[] }).open.length, 0);
  const arch = (s.expeditionList() as { archive: { id: string; status?: string; ruling?: string }[] }).archive;
  assert.equal(arch[0].id, minted.created);
  assert.equal(arch[0].status, "closed");
  assert.equal(arch[0].ruling, "applied");
});

test("escape goes to idle and only to idle: the walk is left standing, the reason is recorded, boot is exempt", async () => {
  const { Session } = await import("../engine/session.ts");
  const { buildServer } = await import("../engine/tools.ts");
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  // Into boot: escape is refused — boot must complete. (The human walks
  // the hop; the agent's escape rides the pull.)
  await session.tickAdvance();
  const noBoot = await call(server, "se_pull", { escape: "stuck" });
  assert.equal(noBoot.isError, true);
  assert.equal(noBoot.body.clause, "SE-C-110");
  // Boot to idle, then enter a sub-machine and escape from inside it.
  await pullBoot(server);
  session.setAutonomy(1);
  await pullTo(server, "expeditions");
  assert.deepEqual(session.active(), ["expeditions/start"]);
  const esc = await call(server, "se_pull", { escape: "cannot continue: test blockage" });
  assert.equal(esc.isError, false, JSON.stringify(esc.body));
  assert.equal(esc.body.pull, "wait", "stepping out ends in waiting for the person");
  assert.deepEqual(session.active(), ["idle"], "escape lands at idle");
  assert.equal(session.instance.escapes.length, 1);
  assert.match(session.instance.escapes[0].exhausted_guard, /test blockage/);
  assert.ok(session.instance.history.some((h) => h.outcome === "escaped"), "the escape is a recorded failure");
  // The machine was LEFT STANDING — re-entering starts it over, gray.
  assert.deepEqual(session.viewRun("expeditions").done, []);
  // An empty reason is refused; at the main machine there is nothing to escape.
  const empty = await call(server, "se_pull", { escape: "  " });
  assert.equal(empty.isError, true);
  assert.equal(empty.body.clause, "SE-C-046");
  const atMain = await call(server, "se_pull", { escape: "nope" });
  assert.equal(atMain.isError, true);
  assert.equal(atMain.body.clause, "SE-C-110");
});

// PAUSE IS NOT ESCAPE (owner ruling 2026-07-29). An expedition is a day's
// bucket and is MEANT to stay open, so stepping out of one is ordinary work.
// Escape's MOVE was already right; its RECORD was wrong. It files an
// exhausted_guard, and the retro mines those for genuine blockages — so
// routine stepping-out would have drowned the signal it depends on.
test("pause leaves the machine standing like escape, but records no failure", async () => {
  const { Session } = await import("../engine/session.ts");
  const { buildServer } = await import("../engine/tools.ts");
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  await pullBoot(server);
  session.setAutonomy(1);
  await pullTo(server, "expeditions");
  assert.deepEqual(session.active(), ["expeditions/start"]);

  const p = await call(server, "se_pull", { pause: "stepping out to reload the engine, picking this up later" });
  assert.equal(p.isError, false, JSON.stringify(p.body));
  assert.deepEqual(session.active(), ["idle"], "pause lands at idle, exactly like escape");
  // The MOVE is identical — the machine is left standing, nothing filled.
  assert.deepEqual(session.viewRun("expeditions").done, []);
  // The RECORD is not. This is the entire point of the op.
  assert.equal(session.instance.escapes.length, 0, "a pause is not an exhausted guard");
  assert.ok(session.instance.history.some((h) => h.outcome === "paused"));
  assert.equal(session.instance.history.some((h) => h.outcome === "escaped"), false);

  // Same discipline as escape: never a silent exit.
  const empty = await call(server, "se_pull", { pause: "   " });
  assert.equal(empty.isError, true);
  assert.equal(empty.body.clause, "SE-C-046");
});
});

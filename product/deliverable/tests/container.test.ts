// The generated expeditions container (owner design 2026-07-27):
// its states ARE the open expeditions; entering one binds its worktree;
// one coming home completes the machine; empty runs start → end.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { generateContinueExpedition, generateExpeditionArchive, shortId } from "../engine/expmachine.ts";
import { Session } from "../engine/session.ts";
import { checkDocs, freshRoot, readEverything } from "./helpers.ts";

async function bootHuman(s: Session): Promise<void> {
  checkDocs(s);
  for (let i = 0; i < 10; i++) {
    if (s.active()[0] === "idle") return;
    await s.advance();
  }
  throw new Error("boot did not reach idle");
}

function gitSeed(root: string): void {
  const g = (...a: string[]): void => {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8" });
    assert.equal(r.status, 0, `git ${a.join(" ")}: ${r.stderr}`);
  };
  g("init", "-q", "-b", "v3");
  g("add", "-A");
  g("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "seed");
  g("config", "user.name", "t");
  g("config", "user.email", "t@t");
}

// ROOTS ARE SESSION STATE (found live 2026-07-30): the declaration lives in
// the project root's .se/roots.json, and a bound worktree carries no .se —
// resolving @refs against the worktree made every declared root read as
// undeclared the moment an expedition was entered.
test("a declared root survives a bound worktree", async () => {
  const root = freshRoot();
  gitSeed(root);
  const outside = mkdtempSync(join(tmpdir(), "se-root-"));
  writeFileSync(join(outside, "a.md"), "# from beyond the fence\n");
  mkdirSync(join(root, ".se"), { recursive: true });
  writeFileSync(join(root, ".se", "roots.json"), JSON.stringify({ out: outside }));
  const s = new Session(root);
  await bootHuman(s);
  const e = s.expeditionNew("spike", "roots survive binding") as { created: string };
  s.expeditionOpen(e.created);
  assert.equal(s.laneRoot("@out/a.md"), root, "a @ref resolves against the project root, never the worktree");
  const { fileRead } = await import("../engine/files.ts");
  assert.ok(fileRead(s.laneRoot("@out/a.md"), "@out/a.md").content.includes("from beyond the fence"));
  rmSync(outside, { recursive: true, force: true });
});

// THE OFFER MUST NAME A DOOR THE ROUTER CAN RESOLVE (found live 2026-08-02,
// on the ordinary path into a freshly seeded expedition).
//
// Every container test below drives the walk with advance(bare id) — the
// MIRROR's path, where the person clicks a drawn node. An agent never has
// that: it answers the pull's own offer. Those two spoke different
// languages. The offer named "e31" while the route graph only ever holds
// "expeditions/e31", so the choice validator accepted exactly the string the
// router then refused as unreachable, and no answer could move the walk.
test("a container's offered door is answerable — the agent's own path in", async () => {
  const root = freshRoot();
  gitSeed(root);
  const s = new Session(root);
  await bootHuman(s);
  const e = s.expeditionNew("fix", "Answerable Thing") as { created: string };
  const sid = shortId(e.created);
  s.setAutonomy(1);
  await s.advance("expeditions");
  s.setTarget("");
  const offer = (await s.pull()) as { pull: string; options: { to: string }[] };
  assert.equal(offer.pull, "choose");
  const doors = offer.options.map((o) => o.to);
  const door = doors.find((to) => to === `expeditions/${sid}`);
  assert.ok(door !== undefined, `the offer names ${JSON.stringify(doors)} — a door has to be said the way the router reads it`);
  // EVERY door, not only the seeded one. An offer holding a single
  // unanswerable option is the whole defect, whatever the option is.
  for (const to of doors) assert.doesNotThrow(() => s.setTarget(to), `offered ${to}, then refused it`);
  s.setTarget("");
  await s.pull({ form: { choice: door } });
  for (let i = 0; i < 3 && s.active()[0] !== `expeditions/${sid}`; i++) {
    await readEverything(s);
    await s.pull();
  }
  assert.deepEqual(s.active(), [`expeditions/${sid}`], "answering the offer walks in");
  assert.ok(s.workRoot().includes(e.created), "and binds the worktree, exactly as the click does");
});

test("empty container: nothing open → start runs straight to end", async () => {
  const root = freshRoot();
  gitSeed(root);
  const gen = generateContinueExpedition(root);
  assert.deepEqual(gen.decl.states.map((s) => s.id), ["start", "end"]);
  assert.deepEqual(gen.decl.states[0].edges.map((e) => e.to), ["end"]);
  const s = new Session(root);
  await bootHuman(s);
  await s.advance("expeditions");
  assert.deepEqual(s.active(), ["expeditions/start"]);
  await s.advance();
  assert.deepEqual(s.active(), ["expeditions/end"]);
});

test("seeded container: expeditions are the states, entering BINDS, one ending completes, re-entry regenerates", async () => {
  const root = freshRoot();
  gitSeed(root);
  const s = new Session(root);
  await bootHuman(s);
  const a = s.expeditionNew("spike", "First Thing") as { created: string };
  const b = s.expeditionNew("fix", "Second Thing") as { created: string };
  const sidA = shortId(a.created);
  const sidB = shortId(b.created);
  const gen = generateContinueExpedition(root);
  assert.deepEqual(gen.decl.states.map((x) => x.id), ["start", sidA, `${sidA}-leave`, sidB, `${sidB}-leave`, "end"]);
  assert.equal(gen.decl.states.find((x) => x.id === sidA)?.statement, "First Thing", "the record's goal is the statement");
  assert.deepEqual(gen.decl.states[0].edges.map((e) => e.to), [sidA, sidB]);
  // The leave gate rides the AUTHORED note into every instance.
  assert.deepEqual(gen.decl.states.find((x) => x.id === `${sidB}-leave`)?.entry?.evidence_form, ["expedition-leave"]);
  // The drawing carries one group per expedition, labeled with its id.
  assert.ok(gen.canvas.nodes!.some((n) => n.type === "group" && n.label === b.created));

  // Walk: enter the container, choose B — the click IS the pick, the
  // worktree binds on entry.
  await s.advance("expeditions");
  await s.advance(sidB);
  assert.deepEqual(s.active(), [`expeditions/${sidB}`]);
  assert.ok(s.workRoot().includes(b.created), "entering bound the worktree");
  // ONE LANE, TWO TREES (owner ruling 2026-07-28). Project content follows the
  // walk into the worktree; `.se/` is SESSION state and stays at the project
  // root. The handover used to resolve into the worktree, which has no .se —
  // so it was written where the next session never looks, and failed silently.
  assert.equal(s.laneRoot("product/guidance/voice.md"), s.workRoot(), "project content rides the branch");
  assert.equal(s.laneRoot(".se/HANDOVER.md"), root, "the handover belongs to the root, whatever branch we stand on");
  assert.equal(s.laneRoot(), s.workRoot(), "no path named — the work root, as before");
  // The leave gate holds until the page passes; then close, end, return.
  await assert.rejects(() => s.advance(`${sidB}-leave`), (e) => (e as { clause?: string }).clause === "SE-C-112");
  s.formSave("expedition-leave", { "What was the goal": "second thing", "What was done": "it", "What settled it": "the container test", "What was not done": "nothing" });
  // A PERSON confirms the report; the close then needs no override. The guard
  // itself is tested in editsafety.test.ts — this one is about the archive.
  s.formDone("expedition-leave", "human");
  await s.advance(`${sidB}-leave`);
  s.expeditionClose(true);
  await s.advance();
  assert.deepEqual(s.active(), ["expeditions/end"]);
  await s.advance();
  assert.deepEqual(s.active(), ["idle"], "one expedition coming home completes the container");

  // Re-entry REGENERATES: only A remains, the drawing starts gray.
  await s.advance("expeditions");
  assert.deepEqual(s.viewRun("expeditions").done, []);
  const again = s.generatedView("expeditions")!;
  assert.deepEqual(again.decl.states.map((x) => x.id), ["start", sidA, `${sidA}-leave`, "end"]);
});

test("the archive: start reaches every closed expedition, each runs to end, browsing is human-only", async () => {
  const root = freshRoot();
  gitSeed(root);
  const s = new Session(root);
  await bootHuman(s);
  const a = s.expeditionNew("spike", "Archived Thing") as { created: string };
  const sid = shortId(a.created);
  const rep = join(root, ".worktrees", a.created, "product", "spec", "expeditions", a.created, "report.md");
  mkdirSync(dirname(rep), { recursive: true });
  writeFileSync(rep, "---\nform: expedition-leave\nstatus: done\nby: human\n---\n\ngoal · shipped · threads\n", "utf8");
  s.expeditionOpen(a.created);
  s.expeditionClose(true);
  const gen = generateExpeditionArchive(root);
  assert.deepEqual(gen.decl.states.map((x) => x.id), ["start", sid, "end"]);
  assert.deepEqual(gen.decl.states[0].edges.map((e) => e.to), [sid], "start reaches the archived expedition");
  const st = gen.decl.states.find((x) => x.id === sid)!;
  assert.deepEqual(st.edges, [{ to: "end", role: "alternative" }], "the archived state runs to end");
  assert.equal(st.priority, 1.5, "archive browsing sits above the whole slider — human-only");
  assert.equal(st.statement, "Archived Thing", "the record's goal is the statement");
  assert.ok(gen.canvas.edges!.some((e) => e.fromNode === "n-start" && e.toNode === `n-${sid}`), "the drawing carries start → expedition");
  const empty = generateExpeditionArchive(join(root, ".no-such"));
  assert.deepEqual(empty.decl.states[0].edges.map((e) => e.to), ["end"], "nothing closed: start runs straight to end");
  // CLOSED RECORDS LIVE IN GIT (owner ruling 2026-07-28): the close
  // retires the record dir from the tree; the branch keeps serving it.
  assert.ok(!existsSync(join(root, "product", "spec", "expeditions", a.created)), "no closed record on the tree");
  assert.equal(generateExpeditionArchive(root).decl.states.find((x) => x.id === sid)?.statement, "Archived Thing", "the branch serves the archive");
  // The close stamped the ruling on the branch — the list serves it.
  const listed = s.expeditionList() as { archive: { id: string; ruling?: string }[] };
  assert.equal(listed.archive.find((x) => x.id === a.created)?.ruling, "applied", "the close IS the ruling");
});

test("forms are viewable unbound: formGet returns the template preview", () => {
  const root = freshRoot();
  const s = new Session(root);
  const f = s.formGet("expedition-leave") as { preview?: boolean; status: string; met: boolean; fields: { name: string }[] };
  assert.equal(f.preview, true);
  assert.equal(f.status, "template");
  assert.equal(f.met, false);
  assert.ok(f.fields.length >= 4, "the template's fields ride the preview");
});

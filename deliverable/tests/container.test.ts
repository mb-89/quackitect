// The generated expeditions container: its states ARE the open
// expeditions; entering one binds it;
// one coming home completes the machine; empty runs start → end.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { generateContinueExpedition, generateExpeditionArchive, shortId } from "../engine/expmachine.ts";
import { Session } from "../engine/session.ts";
import { anyGuidanceDoc, checkDocs, freshRoot, readEverything } from "./helpers.ts";

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

// ROOTS ARE SESSION STATE: the declaration lives in the project root's
// .se/roots.json, so a @ref resolved against anything else reads as
// undeclared the moment an expedition is entered.
test("a declared root survives a bound record", async () => {
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
  assert.equal(s.laneRoot("@out/a.md"), root, "a @ref resolves against the project root, never the record");
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
test("a container state is reachable by explicit target - the agent's own path in", async () => {
  const root = freshRoot();
  gitSeed(root);
  const s = new Session(root);
  await bootHuman(s);
  const e = s.expeditionNew("fix", "Answerable Thing") as { created: string };
  const sid = shortId(e.created);
  s.setAutonomy(1);
  await s.advance("expeditions");
  const door = `expeditions/${sid}`;
  assert.doesNotThrow(() => s.setTarget(door));
  for (let i = 0; i < 3 && s.active()[0] !== `expeditions/${sid}`; i++) {
    await readEverything(s);
    await s.pull();
  }
  assert.deepEqual(s.active(), [`expeditions/${sid}`], "the explicit target walks in");
  // ENTERING BINDS THE RECORD, and since i34 that no longer shows in the work
  // root: there is one tree, so `workRoot()` is the same string bound or not.
  // The session says which record is bound, and that is what the click did.
  assert.equal(s.boundRecordId(), e.created, "and binds the record, exactly as the click does");
});

test("empty container: nothing open → start runs straight to end", async () => {
  const root = freshRoot();
  gitSeed(root);
  const gen = generateContinueExpedition(root);
  assert.deepEqual(
    gen.decl.states.map((s) => s.id),
    ["start", "end"],
  );
  assert.deepEqual(
    gen.decl.states[0].edges.map((e) => e.to),
    ["end"],
  );
  const s = new Session(root);
  await bootHuman(s);
  await s.advance("expeditions");
  assert.deepEqual(s.active(), ["expeditions/start"]);
  await s.advance();
  assert.deepEqual(s.active(), ["expeditions/end"]);
});

// THE SAME DEMAND AS THE ITERATIONS CONTAINER'S, DRIVEN THE SAME WAY.
//
// req-a-pull-carrying-no-choice-enters-no-iteration says ITERATION, so this
// container sits outside its letter. The harm is identical: entering BINDS the
// record, so a choiceless advance took up work nobody picked.
//
// IT WAS WORSE HERE THAN THERE. The iterations container at least had an exit
// edge; this one pushed `start → end` only when NOTHING stood open, so with any
// expedition open there was no way out that did not pass through one.
//
// The shape assertion below pins the edges. This drives the walk, because a
// shape that looks right is not a walk that stands still.
test("a choiceless advance at the expeditions container enters no expedition", async () => {
  const root = freshRoot();
  gitSeed(root);
  const s = new Session(root);
  await bootHuman(s);

  // ONE EXPEDITION, AND THE COUNT IS THE WHOLE POINT.
  //
  // With TWO or more open, `assertEdge` already refused an unnamed advance —
  // `start` had several edges and it says so. That branch was never the hole.
  //
  // WITH ONE OPEN, `start` carried exactly ONE edge, because the exit was
  // pushed only when nothing stood open. One edge is not "several", so the
  // unnamed advance took it, entered the expedition and BOUND it.
  const only = s.expeditionNew("spike", "First Thing") as { created: string };

  await s.advance("expeditions");
  assert.deepEqual(s.active(), ["expeditions/start"], "the choice lands on the container");
  const gen = generateContinueExpedition(root);
  assert.equal(gen.decl.states[0].edges.length, 2, "one open expedition still leaves two doors: leave, or take it");

  // NO ARGUMENT. This is what a dropped connection produces.
  await assert.rejects(
    () => s.advance(),
    (e) => (e as { clause?: string }).clause === "SE-C-110",
    "a choiceless advance is refused where doors stand, rather than taking one",
  );

  // AND NOTHING WAS BOUND. Entering is what binds, so its absence is the
  // mechanical proof that no expedition was taken up.
  assert.notEqual(s.boundRecordId(), only.created, "a choiceless advance bound the only open expedition");
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
  assert.deepEqual(
    gen.decl.states.map((x) => x.id),
    ["start", sidA, `${sidA}-leave`, sidB, `${sidB}-leave`, "end"],
  );
  assert.equal(gen.decl.states.find((x) => x.id === sidA)?.statement, "First Thing", "the record's goal is the statement");
  // THE EXIT DOOR IS ON THE LIST AT ALL ONLY SINCE i34, AND IT COMES FIRST.
  //
  // Before that, `start → end` was pushed ONLY when nothing stood open. With
  // any expedition open there was no way out of the container that did not
  // pass through one — and passing through BINDS it. The iterations container
  // carried the same defect and took the same fix; iterations.ts has the full
  // reasoning.
  //
  // ORDER IS NOT COSMETIC. `tryMove` takes the first authored edge, so first in
  // the list IS the default when nothing chose. The default must be to leave,
  // never to take up work nobody picked.
  assert.deepEqual(
    gen.decl.states[0].edges.map((e) => e.to),
    ["end", sidA, sidB],
  );
  // BOTH DOORS CARRY `alternative`, because the choice guard holds the walk
  // still only ABOVE one alternative. The exit has to count toward the choice,
  // or a single open expedition offers nothing and the walk leaves instead.
  assert.deepEqual(
    [...new Set(gen.decl.states[0].edges.map((e) => e.role))],
    ["alternative"],
    "every door out of the container is a choice, the exit included",
  );
  // The leave gate rides the AUTHORED note into every instance.
  assert.deepEqual(gen.decl.states.find((x) => x.id === `${sidB}-leave`)?.entry?.evidence_form, ["expedition-leave"]);
  // The drawing carries one group per expedition, labeled with its id.
  assert.ok(gen.canvas.nodes?.some((n) => n.type === "group" && n.label === b.created));

  // Walk: enter the container, choose B — the click IS the pick, and the
  // record binds on entry.
  await s.advance("expeditions");
  await s.advance(sidB);
  assert.deepEqual(s.active(), [`expeditions/${sidB}`]);
  assert.equal(s.boundRecordId(), b.created, "entering bound the record");
  // ONE LANE, THREE KINDS (owner ruling 2026-07-28, refined 2026-08-14 when
  // SE-C-134 was retired). Each kind gets its own answer, and mixing any two
  // of them is a bug this line exists to catch.
  //
  //   SHARED METHOD belongs to the MACHINE. Guidance resolves to the root
  //   whatever tree is bound, so a method change made from inside a record
  //   cannot land in a tree that does not own it and fan out at the merge.
  //   That danger is real: on 2026-08-07 it deleted two lane verbs.
  //
  //   SESSION state stays at the project root. Resolved anywhere else the
  //   handover is written where the next session never looks, and fails
  //   silently.
  //
  //   THE RECORD'S OWN CONTENT rides the branch. That is what binding is for.
  assert.equal(s.laneRoot(anyGuidanceDoc()), root, "shared method belongs to the machine, never to a branch");
  assert.equal(s.laneRoot(".se/HANDOVER.md"), root, "the handover belongs to the root, whatever branch we stand on");
  assert.equal(
    s.laneRoot(`spec/expeditions/${b.created}/evidence/scratch.md`),
    s.workRoot(),
    "the record's own content rides the branch",
  );
  assert.equal(s.laneRoot(), s.workRoot(), "no path named — the work root, as before");
  // The leave gate holds until the page passes; then close, end, return.
  await assert.rejects(
    () => s.advance(`${sidB}-leave`),
    (e) => (e as { clause?: string }).clause === "SE-C-112",
  );
  s.formSave("expedition-leave", {
    "What was the goal": "second thing",
    "What was done": "it",
    "What settled it": "the container test",
    "What was not done": "nothing",
  });
  // A PERSON confirms the report; the close then needs no override. The guard
  // itself is tested in editsafety.test.ts — this one is about the archive.
  s.formDone("expedition-leave", "human");
  await s.advance(`${sidB}-leave`);
  // THE CLOSE MOVES THE WALK ITSELF. Archiving takes the record's states out
  // of the drawing, so whoever removes the ground says where the walk goes.
  const closed = s.expeditionClose(true);
  assert.equal(closed.moved_to, "expeditions/end", "the close says where it put the walk");
  assert.deepEqual(s.active(), ["expeditions/end"]);
  await s.advance();
  assert.deepEqual(s.active(), ["idle"], "one expedition coming home completes the container");

  // Re-entry REGENERATES: only A remains, the drawing starts gray.
  await s.advance("expeditions");
  assert.deepEqual(s.viewRun("expeditions").done, []);
  const again = s.generatedView("expeditions")!;
  assert.deepEqual(
    again.decl.states.map((x) => x.id),
    ["start", sidA, `${sidA}-leave`, "end"],
  );
});

// THE OFFER AND THE CHECK READ ONE GRAPH. The pull built its doors from the
// drawing the walk entered with, while the router re-derives it live. Closing
// a record made the two disagree: the pull kept offering a door, and every
// answer to it came back refused as undrawn, with the escape hatch the only
// way out (found live 2026-08-02, closing e31).
test("a closed record leaves no phantom door: what the pull offers, the walk can take", async () => {
  const root = freshRoot();
  gitSeed(root);
  const s = new Session(root);
  await bootHuman(s);
  const e = s.expeditionNew("fix", "Only Thing") as { created: string };
  const sid = shortId(e.created);
  await s.advance("expeditions");
  await s.advance(sid);
  s.formSave("expedition-leave", {
    "What was the goal": "one thing",
    "What was done": "it",
    "What settled it": "this test",
    "What was not done": "nothing",
  });
  s.formDone("expedition-leave", "human");
  await s.advance(`${sid}-leave`);
  s.expeditionClose(true);

  s.setAutonomy(1);
  s.setTarget("");
  const routed = await readEverything(s);
  assert.equal(routed.pull, "do", "with no target, a finished container comes home to the desk first");
  assert.deepEqual(s.active(), ["front_desk"]);
  const r = (await s.pull()) as Record<string, unknown>;
  assert.equal(r.pull, "wait");
  const options = r.options as Record<string, unknown>[];
  assert.ok(options.length > 0, "the desk surfaces the live doors after the return");
  assert.equal(
    options.some((o) => String(o.to).includes(sid)),
    false,
    "the archived record is gone from the offer",
  );
});

test("the archive: start reaches every closed expedition, each runs to end, browsing is human-only", async () => {
  const root = freshRoot();
  gitSeed(root);
  const s = new Session(root);
  await bootHuman(s);
  const a = s.expeditionNew("spike", "Archived Thing") as { created: string };
  const sid = shortId(a.created);
  // ONE TREE SINCE i34: an expedition's record stands under the root.
  const rep = join(root, "spec", "expeditions", a.created, "report.md");
  mkdirSync(dirname(rep), { recursive: true });
  writeFileSync(rep, "---\nform: expedition-leave\nstatus: done\nby: human\n---\n\ngoal · shipped · threads\n", "utf8");
  s.expeditionOpen(a.created);
  s.expeditionClose(true);
  const gen = generateExpeditionArchive(root);
  assert.deepEqual(
    gen.decl.states.map((x) => x.id),
    ["start", sid, "end"],
  );
  assert.deepEqual(
    gen.decl.states[0].edges.map((e) => e.to),
    [sid],
    "start reaches the archived expedition",
  );
  const st = gen.decl.states.find((x) => x.id === sid)!;
  assert.deepEqual(st.edges, [{ to: "end", role: "alternative" }], "the archived state runs to end");
  assert.equal(st.priority, 1.5, "archive browsing sits above the whole slider — human-only");
  assert.equal(st.statement, "Archived Thing", "the record's goal is the statement");
  assert.ok(
    gen.canvas.edges?.some((e) => e.fromNode === "n-start" && e.toNode === `n-${sid}`),
    "the drawing carries start → expedition",
  );
  const empty = generateExpeditionArchive(join(root, ".no-such"));
  assert.deepEqual(
    empty.decl.states[0].edges.map((e) => e.to),
    ["end"],
    "nothing closed: start runs straight to end",
  );
  // CLOSED RECORDS LIVE ON DISK (owner ruling 2026-08-16, reversing the one of
  // 2026-07-28). The close used to retire the record dir from the tree and let
  // the branch serve it; the folder stays now, and that is what removes the
  // git retrieval path from the archive entirely.
  assert.ok(existsSync(join(root, "spec", "expeditions", a.created)), "the closed record's folder stands");
  assert.equal(
    generateExpeditionArchive(root).decl.states.find((x) => x.id === sid)?.statement,
    "Archived Thing",
    "the tree serves the archive",
  );
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

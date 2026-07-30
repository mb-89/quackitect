// Seeding is a FUNCTION (owner design 2026-07-27): a seed mints the
// record and its worktree, and the iteration stands VISIBLE in the
// iterations container as its KICKOFF from that moment. The needs-retro
// gate holds only the FIRST start of a never-walked iteration.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { generateIterations, itPinRel, itSeed, pinIteration } from "../engine/iterations.ts";
import { validateMachine, type MachineDecl } from "../engine/machine.ts";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, freshRoot, readHashesFor } from "./helpers.ts";

function gitInit(root: string): void {
  for (const a of [["init"], ["config", "user.email", "se@test.local"], ["config", "user.name", "se test"], ["add", "-A"], ["commit", "-q", "-m", "seed"]]) {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8", windowsHide: true });
    if (r.status !== 0) throw new Error(`git ${a.join(" ")} failed: ${r.stderr}`);
  }
}

test("a seed stands in the container at once — kickoff only, gate armed", () => {
  const root = freshRoot();
  gitInit(root);
  const it = itSeed(root, "first visible iteration", "the container shows it as a kickoff", ["e13"]);
  assert.match(it.id, /^i1-/);
  const rec = readFileSync(join(it.path, "product", "spec", "iterations", it.id, "record.md"), "utf8");
  assert.match(rec, /^status: seeded$/m);
  assert.match(rec, /^vision: /m);
  assert.match(rec, /- "e13"/);
  const gen = generateIterations(root);
  const kick = gen.decl.states.find((s) => s.id === "i1")!;
  assert.equal(kick.statement, "first visible iteration");
  assert.deepEqual(kick.entry, { no_pending_note: ["needs retro"] });
  assert.equal(gen.expByState["i1"], it.id);
  // Not a git repo → an empty container that runs start to end.
  const empty = generateIterations(freshRoot());
  assert.deepEqual(empty.decl.states.find((s) => s.id === "start")!.edges, [{ to: "end", role: "normal" }]);
});

test("the graph is evidence: an open decision point blocks the leave form", () => {
  const root = freshRoot();
  gitInit(root);
  const s = new Session(root);
  const minted = s.expeditionNew("spike", "graph evidence") as { created: string };
  s.expeditionOpen(minted.created);
  const sid = minted.created.match(/^(e\d+)-/)![1];
  // A filled, done form — but the graph still holds an open point.
  const rel = join(root, ".worktrees", minted.created, "product", "spec", "expeditions", minted.created, "report.md");
  const filled = [
    "---", "form: expedition-leave", "status: done", "by: agent", "files:", "---", "",
    "# t", "",
    "## What was the goal", "", "x", "",
    "## What was done", "", "x", "",
    "## What settled it", "", "x", "",
    "## What was not done", "", "nothing", "",
  ].join("\n");
  writeFileSync(rel, filled, "utf8");
  s.decisions.apply(`${sid}@0`, { op: "plan", items: ["one open point"] });
  let lint = s.formGet("expedition-leave") as { met: boolean; problems: string[] };
  assert.equal(lint.met, false, "open point → the evidence does not stand");
  assert.match(lint.problems.join(" | "), /open point/);
  const node = s.decisions.graph(`${sid}@0`).nodes.find((n) => n.status === "open")!;
  s.decisions.apply(`${sid}@0`, { op: "done", node: node.id, brief: "resolved" });
  lint = s.formGet("expedition-leave") as { met: boolean; problems: string[] };
  assert.equal(lint.met, true, JSON.stringify(lint.problems));
});

test("the pin: the bless compiles the change size live; escalation only grows it", () => {
  const root = freshRoot();
  gitInit(root);
  const it = itSeed(root, "pin the machine", "the kickoff compiles and pins");
  const res = pinIteration(root, it, "patch") as { pinned: string; matrix_hash: string };
  assert.equal(res.pinned, "patch");
  assert.match(res.matrix_hash, /^[0-9a-f]{12}$/);
  const pin = JSON.parse(readFileSync(join(it.path, itPinRel(it.id)), "utf8")) as {
    change_size: string;
    matrix_hash: string;
    machine: MachineDecl;
  };
  assert.equal(pin.change_size, "patch");
  validateMachine(pin.machine);
  // ESCALATION re-pins larger — monotonicity: every patch state survives.
  const patchIds = pin.machine.states.map((s) => s.id);
  pinIteration(root, it, "minor");
  const pin2 = JSON.parse(readFileSync(join(it.path, itPinRel(it.id)), "utf8")) as { machine: MachineDecl };
  for (const id of patchIds) {
    assert.ok(pin2.machine.states.some((s) => s.id === id), `${id} was filled at patch and must survive the escalation`);
  }
  // DE-ESCALATION (and a same-size re-pin) refused — drift never reaches a running walk.
  assert.throws(() => pinIteration(root, it, "patch"), /ESCALATION/);
  assert.throws(() => pinIteration(root, it, "minor"), /ESCALATION/);
  // An unknown size refuses with the vocabulary.
  assert.throws(() => pinIteration(root, it, "product"), /patch \| minor \| major/);
});

test("the bless pins the machine and the container expands to the pinned walk", async () => {
  const root = freshRoot();
  gitInit(root);
  const session = new Session(root);
  const server = buildServer(root, session);
  const hashes = readHashesFor(root);
  for (let i = 0; i < 8; i++) {
    const step = await call(server, "se_tick", { advance: true, read_hashes: hashes });
    if (step.body.booted === true) break;
  }
  session.setAutonomy(1);
  const seeded = session.iterationSeed("walk the pinned machine", "the bless compiles and pins");
  const id = String(seeded.seeded);
  const sid = id.match(/^(i\d+)-/)![1];
  // While BOUND, the lane serves the WORKTREE — the agent's proof must hash
  // that copy (on Windows the two differ by line endings after checkout).
  const wtHashes = readHashesFor(join(root, ".worktrees", id));
  await call(server, "se_tick", { to: "iterations", read_hashes: hashes });
  await call(server, "se_tick", { to: sid, read_hashes: hashes });
  // No change_size in the record: the bless refuses, mechanically.
  const refused = await call(server, "se_tick", { advance: true, read_hashes: wtHashes });
  assert.equal(refused.isError, true, JSON.stringify(refused.body));
  assert.match(JSON.stringify(refused.body), /change_size/);
  // The prefill lands in the record; the tick is the bless.
  const rec = join(root, ".worktrees", id, "product", "spec", "iterations", id, "record.md");
  writeFileSync(rec, readFileSync(rec, "utf8").replace(/^status: /m, "change_size: patch\nstatus: "), "utf8");
  const blessed = await call(server, "se_tick", { advance: true, read_hashes: wtHashes });
  assert.equal(blessed.isError, false, JSON.stringify(blessed.body));
  assert.ok(existsSync(join(root, ".worktrees", id, itPinRel(id))), "the pin exists");
  // Re-entering the container serves the walk: kickoff → the pinned machine.
  await call(server, "se_tick", { advance: true, read_hashes: wtHashes });
  await call(server, "se_tick", { to: "iterations", read_hashes: hashes });
  await call(server, "se_tick", { to: sid, read_hashes: hashes });
  const walk = await call(server, "se_tick", { advance: true, read_hashes: wtHashes });
  assert.equal(walk.isError, false, JSON.stringify(walk.body));
  assert.deepEqual(walk.body.breadcrumb, ["main", "iterations", `${sid}-walk`], "the walk descended into the pinned machine");
});

test("the kickoff serves the matrix's live evidence form", () => {
  const root = freshRoot();
  gitInit(root);
  itSeed(root, "the form rides", "the kickoff carries the gate fields");
  const gen = generateIterations(root);
  const kick = gen.decl.states.find((s) => s.id === "i1")!;
  assert.ok(kick.evidence_form.some((f) => f.name === "change_size" && f.required));
  assert.ok(kick.evidence_form.some((f) => f.name === "retro_drained" && f.killer === true));
});

test("the seed refuses a missing vision — the seed is a small form", () => {
  const root = freshRoot();
  gitInit(root);
  assert.throws(() => itSeed(root, "goal only", "  "), (e) => (e as { clause?: string }).clause === "SE-C-046");
});

test("needs-retro holds the FIRST start; draining opens it; a started iteration never blocks", async () => {
  const root = freshRoot();
  gitInit(root);
  const session = new Session(root);
  const server = buildServer(root, session);
  const hashes = readHashesFor(root);
  for (let i = 0; i < 8; i++) {
    const step = await call(server, "se_tick", { advance: true, read_hashes: hashes });
    if (step.body.booted === true) break;
  }
  session.setAutonomy(1); // the kickoff weighs 0.6 — lift the slider clear
  const seeded = session.iterationSeed("prove the gate", "the first start waits on the retro");
  const sid = String(seeded.seeded).match(/^(i\d+)-/)![1];
  await call(server, "se_note", { text: "needs retro — iteration wrapped" });
  await call(server, "se_tick", { to: "iterations", read_hashes: hashes });
  const refused = await call(server, "se_tick", { to: sid, read_hashes: hashes });
  assert.equal(refused.isError, true);
  assert.equal(refused.body.clause, "SE-C-112");
  assert.match(JSON.stringify(refused.body), /needs retro/);
  // Escape out, drain at the retro, come back — the first start opens.
  await call(server, "se_tick", { escape: "gated by needs-retro", read_hashes: hashes });
  const { contentHash } = await import("../engine/hash.ts");
  const method = "product/guidance/method/retro.md";
  const withMethod = { ...hashes, [method]: contentHash(readFileSync(join(root, ...method.split("/")))) };
  await call(server, "se_tick", { to: "retro", read_hashes: withMethod });
  const pending = (await call(server, "se_tick", {})).body; // position read; the note ref rides the notes file
  void pending;
  const notesRaw = readFileSync(join(root, ".se", "notes.jsonl"), "utf8");
  const ref = JSON.parse(notesRaw.trim().split("\n").filter((l) => l.includes("needs retro"))[0]).ref as string;
  await call(server, "se_note_drain", { ref, disposition: "done", where: "retro ran" });
  await call(server, "se_tick", { to: "end", read_hashes: withMethod });
  await call(server, "se_tick", { advance: true, read_hashes: hashes });
  await call(server, "se_tick", { to: "iterations", read_hashes: hashes });
  const open = await call(server, "se_tick", { to: sid, read_hashes: hashes });
  assert.equal(open.isError, false, JSON.stringify(open.body));
  // Entering bound the worktree and stamped `started:` — from now on a
  // fresh needs-retro note gates only NEW iterations, never this one.
  const rec = readFileSync(join(root, ".worktrees", String(seeded.seeded), "product", "spec", "iterations", String(seeded.seeded), "record.md"), "utf8");
  assert.match(rec, /^started: /m);
  assert.match(rec, /^status: open$/m);
});

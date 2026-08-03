// Seeding is a FUNCTION (owner design 2026-07-27): a seed mints the
// record and its worktree, and the iteration stands VISIBLE in the
// iterations container as its KICKOFF from that moment. The needs-retro
// gate holds only the FIRST start of a never-walked iteration.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { generateIterations, generateSeeded, itPinRel, itSeed, itSeededRel, pinIteration } from "../engine/iterations.ts";
import { type MachineDecl, validateMachine } from "../engine/machine.ts";
import { readRigorMatrix } from "../engine/rigor-matrix.ts";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, checkDocs, freshRoot } from "./helpers.ts";

function gitInit(root: string): void {
  for (const a of [
    ["init"],
    ["config", "user.email", "se@test.local"],
    ["config", "user.name", "se test"],
    ["add", "-A"],
    ["commit", "-q", "-m", "seed"],
  ]) {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8", windowsHide: true });
    if (r.status !== 0) throw new Error(`git ${a.join(" ")} failed: ${r.stderr}`);
  }
}

test("a seed stands in the container at once — kickoff only, gate armed", () => {
  const root = freshRoot();
  gitInit(root);
  const it = itSeed(root, "first visible iteration", "the container shows it as a kickoff", ["e13"]);
  assert.match(it.id, /^i1-/);
  const rec = readFileSync(join(it.path, "project", "spec", "iterations", it.id, "record.md"), "utf8");
  assert.match(rec, /^status: seeded$/m);
  assert.match(rec, /^vision: /m);
  assert.match(rec, /- "e13"/);
  const gen = generateIterations(root);
  const kick = gen.decl.states.find((s) => s.id === "i1")!;
  assert.equal(kick.statement, "first visible iteration");
  assert.deepEqual(kick.entry, { no_pending_note: ["needs retro"] });
  assert.equal(gen.expByState.i1, it.id);
  // Not a git repo → an empty container that runs start to end.
  const empty = generateIterations(freshRoot());
  assert.deepEqual(empty.decl.states.find((s) => s.id === "start")?.edges, [{ to: "end", role: "normal" }]);
});

test("the graph is evidence: an open decision point blocks the leave form", () => {
  const root = freshRoot();
  gitInit(root);
  const s = new Session(root);
  const minted = s.expeditionNew("spike", "graph evidence") as { created: string };
  s.expeditionOpen(minted.created);
  const sid = minted.created.match(/^(e\d+)-/)?.[1];
  // A filled, done form — but the graph still holds an open point.
  const rel = join(root, ".worktrees", minted.created, "project", "spec", "expeditions", minted.created, "report.md");
  const filled = [
    "---",
    "form: expedition-leave",
    "status: done",
    "by: agent",
    "files:",
    "---",
    "",
    "# t",
    "",
    "## What was the goal",
    "",
    "x",
    "",
    "## What was done",
    "",
    "x",
    "",
    "## What settled it",
    "",
    "x",
    "",
    "## What was not done",
    "",
    "nothing",
    "",
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
  const res = pinIteration(root, it, "patch") as { pinned: string; rigor_matrix_hash: string };
  assert.equal(res.pinned, "patch");
  assert.match(res.rigor_matrix_hash, /^[0-9a-f]{12}$/);
  const pin = JSON.parse(readFileSync(join(it.path, itPinRel(it.id)), "utf8")) as {
    change_size: string;
    rigor_matrix_hash: string;
    machine: MachineDecl;
  };
  assert.equal(pin.change_size, "patch");
  validateMachine(pin.machine);
  // ESCALATION re-pins larger — monotonicity: every patch state survives.
  const patchIds = pin.machine.states.map((s) => s.id);
  pinIteration(root, it, "minor");
  const pin2 = JSON.parse(readFileSync(join(it.path, itPinRel(it.id)), "utf8")) as { machine: MachineDecl };
  for (const id of patchIds) {
    assert.ok(
      pin2.machine.states.some((s) => s.id === id),
      `${id} was filled at patch and must survive the escalation`,
    );
  }
  // DE-ESCALATION (and a same-size re-pin) refused — drift never reaches a running walk.
  assert.throws(() => pinIteration(root, it, "patch"), /ESCALATION/);
  assert.throws(() => pinIteration(root, it, "minor"), /ESCALATION/);
  // product SITS ABOVE major: the first iteration of a product authors the
  // vision, the stakeholders and the actual state every later one inherits.
  pinIteration(root, it, "product");
  const pin3 = JSON.parse(readFileSync(join(it.path, itPinRel(it.id)), "utf8")) as { change_size: string; machine: MachineDecl };
  assert.equal(pin3.change_size, "product");
  validateMachine(pin3.machine);
  // specification is read and validated as a column, never pinned as a walk.
  assert.throws(() => pinIteration(root, it, "specification"), /patch \| minor \| major \| product/);
});

test("the chunk machine: refused when unseeded, compiled with realization tags and the join", () => {
  const root = freshRoot();
  gitInit(root);
  const it = itSeed(root, "chunks compile", "the drawing becomes the machine");
  // Unseeded: the typed refusal, never a plain serve.
  assert.throws(() => generateSeeded(root, it, "build-steps", "build-chunks"), /without visible steps/);
  const abs = join(it.path, itSeededRel(it.id, "build-chunks"));
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(
    abs,
    [
      "---",
      "chunks:",
      "  - id: core",
      '    statement: "the spine"',
      "    depends_on: []",
      "    realization: software",
      "  - id: docs",
      '    statement: "the chapter"',
      "    depends_on:",
      "      - core",
      "    realization: document",
      "  - id: probe",
      '    statement: "the rig"',
      "    depends_on:",
      "      - core",
      "    realization: electrical",
      "---",
      "",
    ].join("\n"),
    "utf8",
  );
  const g = generateSeeded(root, it, "build-steps", "build-chunks");
  validateMachine(g.decl);
  const core = g.decl.states.find((s) => s.id === "core")!;
  assert.deepEqual(core.tags, ["realization-software"], "the realization kind is the tag the pull serves");
  assert.deepEqual(core.edges.map((e) => e.to).sort(), ["docs", "probe"], "independent chunks fan out");
  const docs = g.decl.states.find((s) => s.id === "docs")!;
  assert.deepEqual(docs.tags, ["realization-document"]);
  assert.deepEqual(docs.edges, [{ to: "all-built", role: "normal" }]);
  assert.equal(g.decl.states.find((s) => s.id === "all-built")?.kind, "join", "one finished chunk is not a finished build");
});

test("an explicit none in the drawing passes the run state without ceremony", () => {
  const root = freshRoot();
  gitInit(root);
  const it = itSeed(root, "no unknowns", "zero spikes is a normal outcome");
  const abs = join(it.path, itSeededRel(it.id, "spikes"));
  mkdirSync(dirname(abs), { recursive: true });
  // Empty WITHOUT a reason: refused — absence must say why.
  writeFileSync(abs, "---\nsteps: []\n---\n", "utf8");
  assert.throws(() => generateSeeded(root, it, "run-spikes", "spikes"), /absence must say why|at least one step/);
  // Empty WITH the reason: a trivial pass-through carrying it.
  writeFileSync(abs, '---\nsteps: []\nnone: "no unknowns worth a spike"\n---\n', "utf8");
  const g = generateSeeded(root, it, "run-spikes", "spikes");
  assert.deepEqual(
    g.decl.states.map((s) => s.id),
    ["start", "end"],
  );
  assert.match(g.decl.states[0].guidance, /no unknowns worth a spike/);
});

test("escalation reopens exactly the grown steps", () => {
  const root = freshRoot();
  gitInit(root);
  const it = itSeed(root, "reopen the grown steps", "escalation re-earns thin evidence");
  pinIteration(root, it, "patch");
  // The expectation comes from the rigor matrix itself: steps applied at both
  // sizes whose applies rank grew (tailored is always tailored DOWN).
  const m = readRigorMatrix(root);
  const rank: Record<string, number> = { none: 0, tailored: 1, inherit: 2, full: 2 };
  const expected = m.rows
    .filter((r) => {
      const p = m.cells.get(r.name)?.get("patch")?.applies;
      const mi = m.cells.get(r.name)?.get("minor")?.applies;
      return p !== "none" && mi !== "none" && (rank[mi ?? ""] ?? 0) > (rank[p ?? ""] ?? 0);
    })
    .map((r) => r.name)
    .sort();
  assert.ok(expected.includes("gate-kickoff"), "the real rigor matrix grows gate-kickoff from patch to minor");
  const res = pinIteration(root, it, "minor") as { reopened?: string[] };
  assert.deepEqual(res.reopened ?? [], expected);
  const pin = JSON.parse(readFileSync(join(it.path, itPinRel(it.id)), "utf8")) as { reopened?: string[] };
  assert.deepEqual(pin.reopened ?? [], expected, "the reopen list rides the pin itself");
});

test("the bless pins the machine and the container expands to the pinned walk", async () => {
  // The WALK here is the human's hand (session-level, hash-free) — the
  // agent's read proofs are the reading buffer now, covered in
  // reads.test.ts, so this test drives the mechanics it is actually
  // about: the bless, the pin, and the gate report.
  const root = freshRoot();
  gitInit(root);
  const session = new Session(root);
  await session.advance();
  await session.advance();
  checkDocs(session);
  await session.advance();
  await session.advance();
  await session.advance();
  session.setAutonomy(1);
  const seeded = session.iterationSeed("walk the pinned machine", "the bless compiles and pins");
  const id = String(seeded.seeded);
  const sid = id.match(/^(i\d+)-/)?.[1];
  await session.advance("iterations");
  await session.advance(sid);
  // No change_size in the record: the bless refuses, mechanically.
  await assert.rejects(
    () => session.advance(),
    (e) => /change_size/.test(JSON.stringify(e)),
  );
  // The prefill lands in the record; the advance is the bless.
  const rec = join(root, ".worktrees", id, "project", "spec", "iterations", id, "record.md");
  writeFileSync(rec, readFileSync(rec, "utf8").replace(/^status: /m, "change_size: patch\nstatus: "), "utf8");
  await session.advance();
  assert.ok(existsSync(join(root, ".worktrees", id, itPinRel(id))), "the pin exists");
  // Re-entering the container serves the walk: kickoff → the pinned machine.
  await session.advance();
  await session.advance("iterations");
  await session.advance(sid);
  await session.advance();
  assert.deepEqual(session.breadcrumb(), ["main", "iterations", `${sid}-walk`], "the walk descended into the pinned machine");
  // NO GATE PASSES WITHOUT A REVIEW REPORT (owner ruling): walk to the
  // first gate and try to leave — held until the report stands, then quick.
  const pin2 = JSON.parse(readFileSync(join(root, ".worktrees", id, itPinRel(id)), "utf8")) as { machine: MachineDecl };
  const gate = pin2.machine.states.find((s) => s.id === "gate-kickoff")!;
  await session.advance("gate-kickoff");
  await assert.rejects(
    () => session.advance(gate.edges[0].to),
    (e) => /review report/.test(String((e as { expected?: string }).expected)),
  );
  const review = join(root, ".worktrees", id, "project", "spec", "iterations", id, "reviews", "gate-kickoff.md");
  mkdirSync(dirname(review), { recursive: true });
  const sections = [
    ...gate.evidence_form.map((f) => `## ${f.name}\n\nfilled for the test\n`),
    "## verify\n\neach input checked against its referent\n",
    "## validate\n\nthe milestone fits the frame\n",
    "## red_team\n\nthe opposing case was argued\n",
  ].join("\n");
  writeFileSync(
    review,
    `---\nform: milestone-review\ngate: gate-kickoff\nstatus: done\nby: test\nverdict: PASS\n---\n\n# gate-kickoff — milestone review\n\n${sections}`,
    "utf8",
  );
  await session.advance(gate.edges[0].to);
  // THE BLESS IS SEPARATE AND DURABLE: the passing step stamped the
  // sidecar with the report's version and whose hand it was.
  const bless = JSON.parse(readFileSync(review.replace(/\.md$/, ".bless.json"), "utf8")) as { hash: string; by: string };
  assert.equal(bless.by, "human");
  assert.match(bless.hash, /^[0-9a-f]+$/);
});

test("the kickoff serves the rigor matrix's live evidence form", () => {
  const root = freshRoot();
  gitInit(root);
  itSeed(root, "the form rides", "the kickoff carries the gate fields");
  const gen = generateIterations(root);
  const kick = gen.decl.states.find((s) => s.id === "i1")!;
  assert.ok(kick.evidence_form.some((f) => f.name === "change_size" && f.required));
  assert.ok(kick.evidence_form.some((f) => f.name === "retro_drained" && f.required !== false));
});

test("the seed refuses a missing vision — the seed is a small form", () => {
  const root = freshRoot();
  gitInit(root);
  assert.throws(
    () => itSeed(root, "goal only", "  "),
    (e) => (e as { clause?: string }).clause === "SE-C-046",
  );
});

test("needs-retro holds the FIRST start; draining opens it; a started iteration never blocks", async () => {
  const root = freshRoot();
  gitInit(root);
  const session = new Session(root);
  const server = buildServer(root, session);
  await session.advance();
  await session.advance();
  checkDocs(session);
  await session.advance();
  await session.advance();
  await session.advance();
  session.setAutonomy(1); // the kickoff weighs 0.6 — lift the slider clear
  const seeded = session.iterationSeed("prove the gate", "the first start waits on the retro");
  const sid = String(seeded.seeded).match(/^(i\d+)-/)?.[1];
  await call(server, "se_note", { text: "needs retro — iteration wrapped" });
  await session.advance("iterations");
  await assert.rejects(
    () => session.advance(sid),
    (e) => (e as { clause?: string }).clause === "SE-C-112" && /needs retro/.test(JSON.stringify(e)),
  );
  // Escape out — to the DESK now — then to the retro via idle; drain
  // there, come back, and the first start opens.
  session.escape("gated by needs-retro", "human");
  await session.advance(); // the desk's one edge returns to idle
  session.humanCheck("project/guidance/method/retro.md");
  await session.advance("retro");
  const notesRaw = readFileSync(join(root, ".se", "notes.jsonl"), "utf8");
  const ref = JSON.parse(
    notesRaw
      .trim()
      .split("\n")
      .filter((l) => l.includes("needs retro"))[0],
  ).ref as string;
  await call(server, "se_note_drain", { ref, disposition: "done", where: "retro ran" });
  await session.advance(); // the retro's one edge returns to idle
  await session.advance("iterations");
  await session.advance(sid);
  // Entering bound the worktree and stamped `started:` — from now on a
  // fresh needs-retro note gates only NEW iterations, never this one.
  const rec = readFileSync(
    join(root, ".worktrees", String(seeded.seeded), "project", "spec", "iterations", String(seeded.seeded), "record.md"),
    "utf8",
  );
  assert.match(rec, /^started: /m);
  assert.match(rec, /^status: open$/m);
});

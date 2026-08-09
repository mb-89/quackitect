// Seeding is a FUNCTION (owner design 2026-07-27; reshaped 2026-08-04):
// a seed mints the record and its worktree, and the iteration stands
// VISIBLE in the iterations container from that moment — as its OWN
// machine, standing in M0. The kickoff's bless pins the column and the
// machine grows in place; no gate holds the first start.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { generateIterations, generateSeeded, itPinRel, itSeed, itSeededRel, pinIteration } from "../engine/iterations.ts";
import { type MachineDecl, validateMachine } from "../engine/machine.ts";
import { type ChangeColumn, compileColumn, readRigorMatrix } from "../engine/rigor-matrix.ts";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, checkDocs, freshRoot, GUIDANCE } from "./helpers.ts";

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

test("a seed stands in the container at once — its machine is M0", () => {
  const root = freshRoot();
  gitInit(root);
  const it = itSeed(root, "first visible iteration", "the container shows it standing in M0", ["e13"]);
  assert.match(it.id, /^i1-/);
  const rec = readFileSync(join(it.path, "project", "spec", "iterations", it.id, "record.md"), "utf8");
  assert.match(rec, /^status: seeded$/m);
  assert.match(rec, /^vision: /m);
  assert.match(rec, /- "e13"/);
  const gen = generateIterations(root);
  const node = gen.decl.states.find((s) => s.id === "i1")!;
  assert.equal(node.statement, "first visible iteration");
  assert.equal(node.entry, undefined, "no gate holds the first start — the retro rides inside M0");
  assert.equal(node.submachine, "generated");
  assert.equal(gen.expByState.i1, it.id);
  const walk = gen.subGen!.i1();
  assert.deepEqual(
    walk.decl.states.map((s) => s.id),
    ["start", "onboard-retro", "gate-kickoff", "end"],
    "the seed machine is M0 alone",
  );
  const kick = walk.decl.states.find((s) => s.id === "gate-kickoff")!;
  assert.equal(kick.group, "M0", "milestones are groups on the states");
  assert.deepEqual(kick.tags, ["iteration-kickoff"]);
  // Not a git repo → an empty container that runs start to end.
  const empty = generateIterations(freshRoot());
  assert.deepEqual(empty.decl.states.find((s) => s.id === "start")?.edges, [{ to: "end", role: "normal" }]);
});

test("any state's form is fetchable by its machine — the walk elsewhere", () => {
  const root = freshRoot();
  gitInit(root);
  const it = itSeed(root, "browse the form", "the reader fetches it from the desk");
  const s = new Session(root);
  // The walk stands at main; the view names the iteration's machine.
  const f = s.formGet("onboard-retro", "i1") as { state_form?: boolean; header?: Record<string, string> };
  assert.equal(f.state_form, true, "the viewed machine resolves the state");
  assert.equal(f.header?.state, "i1/onboard-retro");
  assert.ok(f.header?.level !== undefined && f.header.level !== "", "the priority wears its rung name");
  // A save from the browse lands in the RECORD's evidence, on its branch.
  s.formSave("onboard-retro", { current_situation: "seen from the desk" }, "human", "i1");
  const inst = join(it.path, "project", "spec", "iterations", it.id, "evidence", "onboard-retro.md");
  assert.ok(existsSync(inst), "the instance lives in the record's worktree");
  assert.match(readFileSync(inst, "utf8"), /seen from the desk/);
  // A browse-save is never stamped and a browse-submit refuses — questions
  // are answered in order, in the state (owner ruling 2026-08-04).
  assert.ok(!/^signed_off:/m.test(readFileSync(inst, "utf8")), "a save never stamps; submit does, and only in the state");
  assert.throws(
    () => s.formDone("onboard-retro", "human", "i1"),
    (e) => /standing in/.test(JSON.stringify(e)),
  );
  // The checks are inputs' state: stored in the instance, alive in the
  // fetch, travelling in the portable copy's island.
  s.formSave("onboard-retro", { inputs_checked: "Do the survey\nRead retro" }, "human", "i1");
  const withChecks = s.formGet("onboard-retro", "i1") as { checked?: string[] };
  assert.deepEqual(withChecks.checked, ["Do the survey", "Read retro"], "ticked inputs round-trip");
  assert.match(readFileSync(inst, "utf8"), /^checked: Do the survey, Read retro$/m);
  // The portable export travels the same road, checks included.
  const page = s.stateFormExport("onboard-retro", "i1");
  assert.match(page, /Evidence form/);
  assert.match(page, /"checked": \[/);
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
  const readPin = (): { change_size: string; rigor_matrix_hash: string; machine?: unknown } =>
    JSON.parse(readFileSync(join(it.path, itPinRel(it.id)), "utf8")) as { change_size: string; rigor_matrix_hash: string };
  const pin = readPin();
  assert.equal(pin.change_size, "patch");
  // THE MACHINE IS NOT STORED. The pin records which COLUMN is walked; the
  // machine derives from it, so a matrix edit reaches the walk and the screen
  // without anybody re-pinning. A frozen copy could only go stale.
  assert.equal(pin.machine, undefined);
  const column = (size: ChangeColumn): MachineDecl => compileColumn(readRigorMatrix(root), size);
  validateMachine(column("patch"));
  // ESCALATION re-pins larger — monotonicity: every patch state survives.
  const patchIds = column("patch").states.map((s) => s.id);
  pinIteration(root, it, "minor");
  assert.equal(readPin().change_size, "minor");
  const minorIds = column("minor").states.map((s) => s.id);
  for (const id of patchIds) {
    assert.ok(minorIds.includes(id), `${id} was filled at patch and must survive the escalation`);
  }
  // DE-ESCALATION (and a same-size re-pin) refused — drift never reaches a running walk.
  assert.throws(() => pinIteration(root, it, "patch"), /ESCALATION/);
  assert.throws(() => pinIteration(root, it, "minor"), /ESCALATION/);
  // product SITS ABOVE major: the first iteration of a product authors the
  // vision, the stakeholders and the actual state every later one inherits.
  pinIteration(root, it, "product");
  assert.equal(readPin().change_size, "product");
  validateMachine(column("product"));
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
  assert.deepEqual(docs.edges, [{ to: "end", role: "normal" }], "a leaf step runs straight into the end");
  assert.equal(
    g.decl.states.find((s) => s.id === "all-built"),
    undefined,
    "the join pill is gone — it merged and did nothing else",
  );
  const fin = g.decl.states.find((s) => s.id === "end")!;
  assert.equal(fin.busbar, true, "one finished step is not a finished build, so the bar sits on the end");
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

test("the bless pins the machine and it grows in place — no wrapper, fills carried", async () => {
  // The WALK here is the human's hand (session-level, hash-free). This
  // test drives the kickoff seam: M0 at seed, the refusal without a
  // change_size, the pin, and the in-place growth.
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
  // Entering the node descends into the iteration's OWN machine — M0.
  assert.deepEqual(session.breadcrumb(), ["main", "iterations", sid]);
  // The METHOD guards the door (owner 2026-08-04) — the person proves by
  // checkbox, and only then does the retro open.
  session.humanCheck(GUIDANCE.retroMethod);
  await session.advance(); // start → onboard-retro
  // THE EXIT IS THE HARD GATE (owner 2026-08-04): the retro's stored form
  // must stand complete before the walk moves.
  await assert.rejects(
    () => session.advance(),
    (e) => /evidence form complete/.test(JSON.stringify(e)),
  );
  // Multi-pass fills land in the record on the branch; completeness signs.
  session.formSave("onboard-retro", { current_situation: "fresh root, empty inbox", field_feedback: "nothing yet" }, "human");
  session.formSave(
    "onboard-retro",
    {
      notes_drained: "- none: inbox empty",
      call_log_mined: "- 0 calls, fresh root",
      // PROMOTIONS IS REQUIRED, and this fixture stopped filling it the day
      // the retro's standing question became a field. The form then never
      // completed, so the walk could not leave onboard-retro and the test
      // read as a machine defect rather than a stale fixture.
      promotions: "- none: a fresh root has no instance changes to promote",
      process_stale: "checked — nothing stale",
      follow_up: "none",
    },
    "human",
  );
  // Complete but unsubmitted still blocks — SUBMIT is the stamping act.
  await assert.rejects(
    () => session.advance(),
    (e) => /SUBMITTED/.test(JSON.stringify(e)),
  );
  session.formDone("onboard-retro", "human");
  const retroForm = readFileSync(join(root, ".worktrees", id, "project", "spec", "iterations", id, "evidence", "onboard-retro.md"), "utf8");
  assert.match(retroForm, /^signed_off: /m, "the submit stamps the claim");
  assert.match(retroForm, /^authors: human$/m);
  await session.advance(); // onboard-retro → gate-kickoff — the exit is open now
  // No change_size anywhere: the bless refuses, mechanically.
  await assert.rejects(
    () => session.advance(),
    (e) => /change_size/.test(JSON.stringify(e)),
  );
  // A FAIL verdict is mechanical: the form never counts as met while it
  // stands, and the problems name it.
  session.formSave("gate-kickoff", { verdict: "fail — not yet" }, "human");
  const failing = session.formGet("gate-kickoff") as { met?: boolean; problems?: string[] };
  assert.equal(failing.met, false);
  assert.ok(
    (failing.problems ?? []).some((p) => /does not stand/.test(p)),
    "the fail is named in the problems",
  );
  // The kickoff's OWN form carries the size — fill it whole, rounds
  // included, each field in its template's shape.
  const kickFields: Record<string, string> = {
    current_situation: "M0 walked, inbox empty",
    retro_drained: "- none: nothing pended",
    goal: "walk the pinned machine",
    pulled_in: "- none",
    left_out: "- everything else",
    change_size: "patch — the smallest walk proves the seam",
    round_0_verify: "- evidence vs claims: read\n- types: green\n- lint: green\n- tests: green",
    round_1_validate:
      "- exercised against the goal: walked\n- missing: none\n- wrong: none\n- out of scope: none\n- prior art: none in this seam",
    round_2_red_team: "- none => the attack found nothing",
    raid_additions: "- none",
    verdict: "pass — the claims held",
    follow_up: "none",
  };
  session.formSave("gate-kickoff", kickFields, "human");
  session.formDone("gate-kickoff", "human");
  // THE THUMBS: the gate's claim is stamped but unblessed — an agent below
  // the gate's weight is refused the bless; the human's thumb opens it.
  assert.match(JSON.stringify(session.formGet("gate-kickoff")), /"gate":true/);
  session.setAutonomy(0.2);
  assert.throws(
    () => session.formBless("gate-kickoff", true, "agent"),
    (e) => /above/.test(JSON.stringify(e)),
  );
  session.formBless("gate-kickoff", true, "human");
  // The advance is the bless — the pin fires from the form and the machine
  // GROWS IN PLACE during that very call. Several ways forward stand in
  // the grown machine, so the UNNAMED advance refuses typed — and the
  // growth has already happened when it does.
  const rec = join(root, ".worktrees", id, "project", "spec", "iterations", id, "record.md");
  await assert.rejects(
    () => session.advance(),
    (e) => /named way forward/.test(JSON.stringify(e)),
  );
  assert.ok(existsSync(join(root, ".worktrees", id, itPinRel(id))), "the pin exists");
  assert.deepEqual(session.breadcrumb(), ["main", "iterations", sid], "the walk stands in the SAME machine");
  const grown = session.currentMachine();
  assert.equal(grown.id, sid, "the machine id is stable across the pin");
  const pin = JSON.parse(readFileSync(join(root, ".worktrees", id, itPinRel(id)), "utf8")) as { change_size: ChangeColumn };
  assert.equal(
    grown.states.length,
    compileColumn(readRigorMatrix(root), pin.change_size).states.length,
    "the machine is the pinned column, compiled live from it",
  );
  // Leaving the blessed kickoff by a NAMED edge completes it — and the
  // M0 fills carried across the swap.
  //
  // log-risks demands meth-raid first: the register became NODES on
  // 2026-08-06 and a state entered without that card writes the table it
  // used to write.
  session.humanCheck("project/deliverable/machines/methods/meth-raid.md");
  await session.advance(grown.states.find((s) => s.id === "gate-kickoff")!.edges[0].to);
  const hist = (session.describe() as { history: { state: string; outcome: string }[] }).history.map((h) => h.state);
  assert.ok(hist.includes(`iterations/${sid}/onboard-retro`), "the retro's fill survived the swap");
  assert.ok(hist.includes(`iterations/${sid}/gate-kickoff`), "the kickoff's fill survived the swap");
  // Entering stamped `started:` — the bind is the container's.
  assert.match(readFileSync(rec, "utf8"), /^started: /m);
});

test("the kickoff serves the rigor matrix's live evidence form, rounds included", () => {
  const root = freshRoot();
  gitInit(root);
  itSeed(root, "the form rides", "the kickoff carries the gate fields");
  const kick = generateIterations(root)
    .subGen!.i1()
    .decl.states.find((s) => s.id === "gate-kickoff")!;
  assert.ok(kick.evidence_form.some((f) => f.name === "change_size" && f.required));
  assert.ok(kick.evidence_form.some((f) => f.name === "retro_drained" && f.required !== false));
  assert.ok(
    kick.evidence_form.some((f) => f.name === "verdict"),
    "the compiler adds the four rounds to every gate",
  );
});

test("the seed refuses a missing vision — the seed is a small form", () => {
  const root = freshRoot();
  gitInit(root);
  assert.throws(
    () => itSeed(root, "goal only", "  "),
    (e) => (e as { clause?: string }).clause === "SE-C-046",
  );
});

test("the agent's pull SERVES the reading a sub state demands — no wedge", async () => {
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
  const seeded = session.iterationSeed("serve the reading", "the pull carries the method in");
  const sid = String(seeded.seeded).match(/^(i\d+)-/)?.[1];
  await session.advance("iterations");
  await session.advance(sid);
  // Aim inside and pull as the AGENT: the answer must SERVE (read) or
  // proceed (fill) — never repeat the entry refusal (note-a8d711a4f6f1).
  session.setTarget(`iterations/${sid}/onboard-retro`);
  const r = (await session.pull({}, "agent")) as { pull: string; document?: { path: string }; refusal?: unknown };
  assert.ok(
    r.pull === "read" || r.pull === "fill",
    `the pull serves or proceeds, never wedges — got ${r.pull}: ${JSON.stringify(r.refusal ?? "")}`,
  );
});

test("no gate holds the first start — entering binds, stamps started, and M0 stands", async () => {
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
  session.setAutonomy(1); // the kickoff gate weighs 0.6 — lift the slider clear
  const seeded = session.iterationSeed("first start unblocked", "the retro rides inside M0");
  const sid = String(seeded.seeded).match(/^(i\d+)-/)?.[1];
  // A pending "needs retro" note no longer gates the start (owner
  // 2026-08-04): the iteration's own onboard-retro is the anchor.
  await call(server, "se_note", { text: "needs retro — iteration wrapped" });
  await session.advance("iterations");
  await session.advance(sid);
  assert.deepEqual(session.breadcrumb(), ["main", "iterations", sid]);
  session.humanCheck(GUIDANCE.retroMethod);
  // The target CLEARS on the descent — when it did not, the pull answered
  // wait forever with the walk wedged at the sub's start.
  session.setTarget(`iterations/${sid}`);
  assert.equal(session.target, "", "arrival at a descending node clears the target");
  // And a BROWSE resolves the iteration's machine with the walk elsewhere —
  // the reader's click, which used to fall back to the main drawing.
  assert.ok(new Session(root).viewFor(sid!) !== undefined, "browsing resolves the iteration's machine without a walk");
  await session.advance(); // start → onboard-retro: the retro stands FIRST
  const active = (session.describe() as { submachine?: { active: string[] } }).submachine?.active;
  assert.deepEqual(active, ["onboard-retro"]);
  // Entering bound the worktree and stamped `started:`.
  const rec = readFileSync(
    join(root, ".worktrees", String(seeded.seeded), "project", "spec", "iterations", String(seeded.seeded), "record.md"),
    "utf8",
  );
  assert.match(rec, /^started: /m);
  assert.match(rec, /^status: open$/m);
});

// A CHOICE WHILE A FORM IS OWED IS A MOVE, NOT A FILL (found live
// 2026-08-06: a backward choice was saved as a FIELD named "choice" on the
// owed form — accepted, swallowed, and the walk stood still). It now
// refuses, and the remedy names the reopen as the sanctioned way back.
test("a choice while a form is owed refuses and names the reopen", async () => {
  const root = freshRoot();
  gitInit(root);
  const session = new Session(root);
  for (let i = 0; i < 2; i++) await session.advance();
  checkDocs(session);
  for (let i = 0; i < 3; i++) await session.advance();
  session.setAutonomy(1);
  const seeded = session.iterationSeed("refuse the swallowed choice", "a backward choice names its remedy");
  const sid = String(seeded.seeded).match(/^(i\d+)-/)?.[1];
  await session.advance("iterations");
  await session.advance(sid);
  session.setTarget(`iterations/${sid}/onboard-retro`);
  // Serve the reading until the walk owes a FILL.
  // The probes sit at fixed fractions of the served document; the answers
  // are the four words after each anchor — computed here exactly as the
  // engine computes them, which is what an honest reader would quote.
  const answers = (body: string): string => {
    const w = body.split(/\s+/).filter((x) => x !== "");
    if (w.length < 16) return w.join(" ");
    return [0.3, 0.6, 0.92]
      .map((at) => {
        const i = Math.min(Math.floor(w.length * at), w.length - 8);
        return w.slice(i + 4, i + 8).join(" ");
      })
      .join(" · ");
  };
  let r = (await session.pull({}, "agent")) as { pull: string; document?: { content?: string } };
  for (let hops = 0; (r.pull === "read" || r.pull === "do") && hops < 40; hops++) {
    const payload = r.pull === "read" ? { form: { read: answers(r.document?.content ?? "") } } : {};
    r = (await session.pull(payload, "agent")) as { pull: string; document?: { content?: string } };
  }
  assert.equal(r.pull, "fill", `the fixture reaches an owed form — stuck at ${r.pull} with keys ${JSON.stringify(Object.keys(r))}`);
  const out = (await session.pull({ form: { choice: "front_desk" } }, "agent").catch((e: unknown) => e)) as {
    clause?: string;
    remedy?: { tool?: string };
  };
  assert.equal(out.clause, "SE-C-110", "the swallowed choice refuses with its clause");
  assert.equal(out.remedy?.tool, "se_reopen", "and the remedy names the way back");
});

// A CLAIMFUL STATE COMPLETES ON ITS CLAIM (owner rule 2026-08-09). The walk
// once passed build_chart unsigned and reached the candidates gate — a
// sub-machine skipped whole. The route-side fix stopped the observed case;
// this guard closes the class at the one gate every completion passes.
test("completing a claimful state without its claim refuses, and the walk stands", async () => {
  const root = freshRoot();
  gitInit(root);
  const session = new Session(root);
  for (let i = 0; i < 2; i++) await session.advance();
  checkDocs(session);
  for (let i = 0; i < 3; i++) await session.advance();
  session.setAutonomy(1);
  const seeded = session.iterationSeed("guard the skip", "a claimless completion refuses");
  const sid = String(seeded.seeded).match(/^(i\d+)-/)?.[1];
  await session.advance("iterations");
  await session.advance(sid);
  // Walk to the first owed FILL, so a claimful state is the active one.
  session.setTarget(`iterations/${sid}/onboard-retro`);
  const answers = (body: string): string => {
    const w = body.split(/\s+/).filter((x) => x !== "");
    if (w.length < 16) return w.join(" ");
    return [0.3, 0.6, 0.92]
      .map((at) => {
        const i = Math.min(Math.floor(w.length * at), w.length - 8);
        return w.slice(i + 4, i + 8).join(" ");
      })
      .join(" · ");
  };
  let r = (await session.pull({}, "agent")) as { pull: string; document?: { content?: string } };
  for (let hops = 0; (r.pull === "read" || r.pull === "do") && hops < 40; hops++) {
    const payload = r.pull === "read" ? { form: { read: answers(r.document?.content ?? "") } } : {};
    r = (await session.pull(payload, "agent")) as { pull: string; document?: { content?: string } };
  }
  assert.equal(r.pull, "fill", `the walk stands at an owed form — got ${r.pull}`);
  const s = session as unknown as {
    subs: { decl: { states: { id: string; evidence_form: unknown[] }[] }; instance: { active?: string[]; current?: string } }[];
    completeGuarded(m: unknown, i: unknown, id: string, o: string, now: string): void;
  };
  const sub = s.subs[s.subs.length - 1];
  const active =
    (sub.instance.active ?? []).length > 0
      ? (sub.instance.active as string[])
      : sub.instance.current !== undefined
        ? [sub.instance.current]
        : [];
  const claimful = active.find((id) => (sub.decl.states.find((x) => x.id === id)?.evidence_form.length ?? 0) > 0);
  assert.ok(claimful !== undefined, `an active claimful state exists — active: ${JSON.stringify(active)}`);
  assert.throws(
    () => s.completeGuarded(sub.decl, sub.instance, claimful, "filled", new Date().toISOString()),
    (e: unknown) => (e as { clause?: string }).clause === "SE-C-112",
    "the claimless completion refuses with the condition clause",
  );
  const after =
    (sub.instance.active ?? []).length > 0
      ? (sub.instance.active as string[])
      : sub.instance.current !== undefined
        ? [sub.instance.current]
        : [];
  assert.ok(after.includes(claimful), "and the walk has not moved");
});

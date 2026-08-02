// EDIT SAFETY — the machines-are-drawn law (owner ruling 2026-07-28): the
// engine accepts what a person naturally draws in Obsidian, and (owner
// ruling 2026-07-29) reads it LIVE — a drawing edited on disk binds the
// running lane on its next call, with no reload. Regression
// suite for the live 2026-07-28 strand: the owner re-drew two return edges
// as plain lines (no styleAttributes role) and drew one of them twice; the
// compiled graph made idle an AND-join and completing boot dropped the only
// token into nowhere.
import { strict as assert } from "node:assert";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { activeStates, completeState, type EdgeDecl, type MachineDecl, type MachineInstance, type StateDecl } from "../engine/machine.ts";
import { expClose, expNew, readRecord } from "../engine/worktree.ts";
import { generateContinueExpedition } from "../engine/expmachine.ts";
import { compileMachine } from "../engine/machines/compile.ts";
import { parseStateNote } from "../engine/notes.ts";
import { Session, mainMachinePath } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, checkDocs, freshRoot, pullBoot } from "./helpers.ts";

interface RawEdge { id: string; styleAttributes?: Record<string, unknown>; fromNode: string; fromSide?: string; toNode: string; toSide?: string }
interface RawCanvas { nodes: { type: string; file?: string }[]; edges: RawEdge[] }

test("the drawing is data: a state note edited on disk binds the next call, no reload", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  await pullBoot(server, session);
  const notePath = join(root, "product", "deliverable", "machines", "states", "idle.md");
  const before = readFileSync(notePath, "utf8");
  assert.match(before, /^priority: 0\.01$/m, "idle costs nothing to enter");
  // SAME BYTE COUNT ON PURPOSE — a cache stamped by size and mtime would
  // sail straight past this edit. The content hash is what catches it.
  const after = before.replace(/^priority: 0\.01$/m, "priority: 0.75");
  assert.equal(after.length, before.length, "the edit changes no byte count");
  writeFileSync(notePath, after);
  const idle = (session.packet() as { states: { id: string; priority: number }[] }).states.find((s) => s.id === "idle");
  assert.equal(idle?.priority, 0.75, "the running lane reads the edited note");
});

test("a drawing that will not compile leaves the last good one standing", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  await pullBoot(server, session);
  writeFileSync(mainMachinePath(root), "{ this is not a canvas");
  const survived = await call(server, "se_pull", {});
  assert.equal(survived.isError, false, "a broken drawing never stops the walk");
  assert.deepEqual(survived.body.where, ["idle"], "and the walk stands where it stood");
});

test("an edit that deletes the state the walk stands in waits until it has moved on", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  await pullBoot(server, session);
  // Drop idle out of the drawing while the walk is standing in it.
  const canvasPath = mainMachinePath(root);
  const raw = JSON.parse(readFileSync(canvasPath, "utf8")) as RawCanvas;
  raw.nodes = raw.nodes.filter((n) => n.file === undefined || !n.file.endsWith("idle.md"));
  writeFileSync(canvasPath, JSON.stringify(raw, null, "\t"));
  const stood = await call(server, "se_pull", {});
  assert.equal(stood.isError, false, "the walk is not stranded");
  assert.deepEqual(stood.body.where, ["idle"], "idle still holds it, because it still holds the walk");
});

/** Redraw main.canvas the way the owner's Obsidian hand did on 2026-07-28:
 *  strip the roles from the ideation and front_desk returns, and draw the
 *  ideation return twice. */
function redrawLikeObsidian(root: string): string {
  const p = mainMachinePath(root);
  const canvas = JSON.parse(readFileSync(p, "utf8")) as RawCanvas;
  for (const e of canvas.edges) {
    if (e.id === "e-ideation-idle" || e.id === "e-front_desk-idle") e.styleAttributes = {};
  }
  canvas.edges.push({ id: "dup-ideation-idle", styleAttributes: {}, fromNode: "n-ideation", fromSide: "left", toNode: "n-idle", toSide: "right" });
  writeFileSync(p, JSON.stringify(canvas));
  return p;
}

test("a plain reverse edge compiles as a return, and a duplicate collapses", () => {
  const root = freshRoot();
  const p = redrawLikeObsidian(root);
  const m = compileMachine(root, p);
  const ideation = m.states.find((s) => s.id === "ideation")!;
  const toIdle = ideation.edges.filter((e) => e.to === "idle");
  assert.equal(toIdle.length, 1, "the duplicate collapsed to one edge");
  assert.equal(toIdle[0].role, "alternative", "the plain return infers alternative");
  const desk = m.states.find((s) => s.id === "front_desk")!;
  assert.equal(desk.edges.find((e) => e.to === "idle")!.role, "alternative");
  // The authored returns stay what they are.
  const exp = m.states.find((s) => s.id === "expeditions")!;
  assert.equal(exp.edges.find((e) => e.to === "idle")!.role, "alternative");
});

test("the owner's redraw no longer strands the walk: boot completes into idle", async () => {
  const root = freshRoot();
  redrawLikeObsidian(root);
  const server = buildServer(root);
  await pullBoot(server); // throws if the walk strands anywhere short of idle
});

test("a drawn JOIN synchronizes: a starving join refuses the tick, the walk stands", async () => {
  const root = freshRoot();
  const p = mainMachinePath(root);
  const canvas = JSON.parse(readFileSync(p, "utf8")) as RawCanvas;
  // The drawn machine now carries ONE double-headed arrow per pair, so the
  // ideation return is derived rather than authored. Draw it explicitly as a
  // NORMAL edge instead: the same pair drawn twice collapses to one, and an
  // authored role wins, so idle gains a second inbound edge.
  canvas.edges.push({
    id: "e-ideation-idle",
    fromNode: "n-ideation",
    fromSide: "bottom",
    toNode: "n-idle",
    toSide: "top",
    styleAttributes: { role: "normal" },
  } as (typeof canvas.edges)[number]);
  writeFileSync(p, JSON.stringify(canvas));
  // idle becomes a drawn JOIN — it now waits for boot AND ideation.
  const idleNote = join(root, "product", "deliverable", "machines", "states", "idle.md");
  writeFileSync(idleNote, readFileSync(idleNote, "utf8").replace("state_kind: work", "state_kind: join"));
  const session = new Session(root);
  await session.advance();
  await session.advance();
  checkDocs(session);
  await session.advance();
  await session.advance();
  assert.deepEqual(session.active(), ["boot/end"]);
  await assert.rejects(
    () => session.advance(),
    (e) => (e as { clause?: string }).clause === "SE-C-123" && /idle/.test(String((e as { got?: string }).got)),
  );
  assert.deepEqual(session.active(), ["boot/end"], "the wedge guard leaves the walk standing");
});

test("plain fan-in is an OR; only a drawn join is the AND", () => {
  const st = (id: string, kind: StateDecl["kind"], edges: EdgeDecl[]): StateDecl => ({ id, kind, statement: "", guidance: "g", evidence_form: [], priority: 0.01, edges });
  const mk = (mergeKind: StateDecl["kind"]): MachineDecl => ({
    id: "t",
    reentry: "restart",
    initial: "s",
    states: [
      st("s", "start", [{ to: "a", role: "normal" }, { to: "b", role: "normal" }]),
      st("a", "work", [{ to: "m", role: "normal" }]),
      st("b", "work", [{ to: "m", role: "normal" }]),
      st("m", mergeKind, [{ to: "end", role: "normal" }]),
      st("end", "end", []),
    ],
  });
  const fresh = (): MachineInstance => ({ machine: "t", iteration: "x", current: "a", active: ["a", "b"], counters: {}, history: [], escapes: [], status: "open" });
  const or = mk("work");
  const oi = fresh();
  completeState(or, oi, "a", "filled", "t0");
  assert.ok(activeStates(oi).includes("m"), "any fired inbound activates a plain state");
  completeState(or, oi, "b", "filled", "t1");
  assert.deepEqual(activeStates(oi).sort(), ["m"], "the second arrival is absorbed, never re-queued");
  const andM = mk("join");
  const ai = fresh();
  completeState(andM, ai, "a", "filled", "t0");
  assert.ok(!activeStates(ai).includes("m"), "the join waits for the second branch");
  completeState(andM, ai, "b", "filled", "t1");
  assert.ok(activeStates(ai).includes("m"), "all inbound fired — the join opens");
});

test("the hatch always works: a booted walk escapes to the DESK, ungated, from anywhere", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  await session.advance();
  await session.advance();
  checkDocs(session);
  await session.advance();
  await session.advance();
  await session.advance();
  assert.deepEqual(session.active(), ["idle"]);
  // A legacy strand (empty token set) escapes home — to the desk, with no
  // gate on the way: no slider weighing, no read demand. The reading the
  // desk wants arrives on the NEXT pull, as an instruction.
  session.instance.active = [];
  const out = await call(server, "se_pull", { escape: "stranded by an old engine" });
  assert.equal(out.isError, false, JSON.stringify(out.body));
  assert.equal(out.body.pull, "wait");
  assert.deepEqual(session.active(), ["front_desk"]);
  assert.equal(session.instance.escapes.length, 1);
  // At the desk itself there is nowhere further out.
  const atDesk = await call(server, "se_pull", { escape: "nothing is broken" });
  assert.equal(atDesk.isError, true);
  assert.equal(atDesk.body.clause, "SE-C-110");
});

test("escape before boot completes still refuses", async () => {
  const root = freshRoot();
  const server = buildServer(root);
  const r = await call(server, "se_pull", { escape: "too early" });
  assert.equal(r.isError, true);
  assert.equal(r.body.clause, "SE-C-110");
  assert.match(String(r.body.got), /before boot/);
});

test("the close is atomic: a conflicting merge aborts and refuses typed, the root stands clean", () => {
  const root = freshRoot();
  const g = (...a: string[]): void => {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8", windowsHide: true });
    if (r.status !== 0) throw new Error(`git ${a.join(" ")} failed: ${r.stderr}`);
  };
  g("init");
  g("config", "user.email", "se@test.local");
  g("config", "user.name", "se test");
  g("add", "-A");
  g("commit", "-q", "-m", "base");
  const e = expNew(root, "fix", "conflict probe");
  // Trunk and branch add the same file with different content — a
  // guaranteed conflict at close-merge.
  writeFileSync(join(root, "clash.md"), "trunk side\n");
  g("add", "-A");
  g("commit", "-q", "-m", "trunk edit");
  writeFileSync(join(e.path, "clash.md"), "branch side\n");
  mkdirSync(join(e.path, "product", "spec", "expeditions", e.id), { recursive: true });
  writeFileSync(join(e.path, "product", "spec", "expeditions", e.id, "report.md"), "---\nform: expedition-leave\nstatus: done\nby: human\n---\n\nprobe report\n");
  assert.throws(
    () => expClose(root, e, true),
    (err) => (err as { clause?: string }).clause === "SE-C-112" && /clash\.md/.test(String((err as { got?: string }).got)),
  );
  const st = spawnSync("git", ["status"], { cwd: root, encoding: "utf8", windowsHide: true }).stdout;
  assert.ok(!/Unmerged|MERGING|both added/.test(st), "the root tree stands clean after the refusal: " + st);
});

// A DIRTY TRUNK IS SETTLED, NOT REFUSED (owner ruling 2026-07-28). git will
// not overwrite uncommitted local changes, so e18's close-merge failed - and
// the abort after it failed too, because no merge had started. Refusing was
// the first fix; the owner ruled it too blunt. The close already commits the
// WORKTREE's leftovers on the principle that a walk's work never silently
// AN OVERRIDE IS LOUDER THAN COMPLIANCE (owner ruling 2026-07-29, option 1).
// The report stamps whose hand finished it, and for two expeditions nothing
// read that stamp: e20 and e21 were closed on reports the agent wrote and
// finished itself, on the owner's word in chat, and the archive kept no trace
// of the difference. The only evidence was a line the agent CHOSE to write,
// so an agent that stayed quiet left a cleaner-looking record than one that
// owned up. That is the wrong way round.
test("closing on an unconfirmed report is refused, and the override is recorded", () => {
  const root = freshRoot();
  const g = (...a: string[]) => spawnSync("git", a, { cwd: root, encoding: "utf8", windowsHide: true });
  g("init");
  g("config", "user.email", "se@test.local");
  g("config", "user.name", "se test");
  writeFileSync(join(root, ".gitignore"), ".worktrees/\n.se/\n");
  g("add", "-A");
  g("commit", "-q", "-m", "base");
  const report = (e: { path: string; id: string }, by: string): void => {
    mkdirSync(join(e.path, "product", "spec", "expeditions", e.id), { recursive: true });
    writeFileSync(join(e.path, "product", "spec", "expeditions", e.id, "report.md"), `---\nform: expedition-leave\nstatus: done\nby: ${by}\n---\n\nprobe report\n`);
  };

  // The agent finished its own report. No person ever confirmed it.
  const a = expNew(root, "fix", "unconfirmed probe");
  report(a, "agent");
  assert.throws(() => expClose(root, a, true), (err: unknown) => {
    const r = err as { clause?: string; got?: string };
    assert.equal(typeof r.clause, "string", "a typed refusal, not a bare crash");
    assert.match(String(r.got), /finished by the agent/);
    return true;
  }, "an agent-finished report cannot close silently");

  // The same close goes through WITH the override, and the record says so.
  // THE OVERRIDE IS FREE PROSE, so it carries colons and quotes. Unquoted,
  // "in chat, 2026-07-29: after reading" is a nested mapping and the whole
  // record stops parsing — which is what happened to e22. The old test
  // regex-matched the raw text and never parsed it, so it never noticed.
  const authority = 'the owner, in chat, 2026-07-29: "run the whole expedition without me"';
  const out = expClose(root, a, true, authority);
  assert.equal(out.merged, true, "the override lets the legitimate close through");
  assert.match(String(out.override), /run the whole expedition without me/);
  const rec = spawnSync("git", ["show", `${a.branch}:product/spec/expeditions/${a.id}/record.md`], { cwd: root, encoding: "utf8", windowsHide: true }).stdout;
  const fm = parseStateNote(rec).frontmatter;
  assert.equal(fm.report_override, authority, "the record PARSES, and gives the authority back verbatim");
  assert.equal(fm.status, "closed", "and the fields after it survived too");

  // A report a PERSON confirmed needs no override at all.
  const b = expNew(root, "fix", "confirmed probe");
  report(b, "human");
  assert.equal(expClose(root, b, true).merged, true, "a confirmed report closes plainly");
});

// ONE BAD RECORD MUST NOT TAKE THE CONTAINER DOWN. An override written
// unquoted made e22's record invalid YAML, and every surface that LISTS
// what stands broke with it - the expeditions machine, the archive, the
// survey, the route. A malformed record is shown as malformed instead.
test("a record that will not parse is marked, and the container still stands", () => {
  const root = freshRoot();
  const g = (...a: string[]) => spawnSync("git", a, { cwd: root, encoding: "utf8", windowsHide: true });
  g("init");
  g("config", "user.email", "se@test.local");
  g("config", "user.name", "se test");
  writeFileSync(join(root, ".gitignore"), ".worktrees/\n.se/\n");
  g("add", "-A");
  g("commit", "-q", "-m", "base");
  const good = expNew(root, "fix", "a readable one");
  const bad = expNew(root, "fix", "the broken one");
  const rec = join(bad.path, "product", "spec", "expeditions", bad.id, "record.md");
  // Exactly the shape that broke it: free prose carrying a colon and a space.
  writeFileSync(rec, readFileSync(rec, "utf8").replace(/^status: open$/m, "status: open\nnote_from_a_person: the owner, in chat, 2026-07-29: run it without me"), "utf8");
  const fm = readRecord(root, bad);
  assert.equal(typeof fm?.unreadable, "string", "it comes back MARKED, not thrown and not empty");
  assert.match(String(fm?.unreadable), /does not parse/);
  // The generator still produces the machine, and both expeditions are in it.
  const gen = generateContinueExpedition(root);
  const short = (id: string): string => id.split("-")[0];
  const ids = gen.decl.states.map((s) => s.id);
  assert.ok(ids.includes(short(good.id)), `the readable expedition is there - got ${ids.join(",")}`);
  assert.ok(ids.includes(short(bad.id)), "and so is the broken one - a hole would be worse");
  const broken = gen.decl.states.find((s) => s.id === short(bad.id))!;
  assert.match(broken.statement, /does not parse/, "and it says what is wrong with it");
});

// vanishes, so the root gets the same treatment. Not a stash: a stash pop can
// conflict after the merge has started, stranding the work mid-close.
test("the close COMMITS the trunk's strays rather than refusing, and says which", () => {
  const root = freshRoot();
  const g = (...a: string[]) => spawnSync("git", a, { cwd: root, encoding: "utf8", windowsHide: true });
  g("init");
  g("config", "user.email", "se@test.local");
  g("config", "user.name", "se test");
  g("add", "-A");
  g("commit", "-q", "-m", "base");
  // The real repo ignores .worktrees/ and .se/. The fixture must too, or the
  // worktree itself reads as tracked content and its removal shows up as a
  // change - which is a property of the fixture, never of the close.
  writeFileSync(join(root, ".gitignore"), ".worktrees/\n.se/\n");
  g("add", "-A");
  g("commit", "-q", "-m", "ignore machine-local paths");
  const e = expNew(root, "fix", "dirty trunk probe");
  mkdirSync(join(e.path, "product", "spec", "expeditions", e.id), { recursive: true });
  writeFileSync(join(e.path, "product", "spec", "expeditions", e.id, "report.md"), "---\nform: expedition-leave\nstatus: done\nby: human\n---\n\nprobe report\n");
  // A TRACKED file, modified and left uncommitted on trunk.
  writeFileSync(join(root, "README.md"), "# tracked\n");
  g("add", "-A");
  g("commit", "-q", "-m", "add readme");
  writeFileSync(join(root, "README.md"), "# tracked, and now edited\n");
  const out = expClose(root, e, true);
  assert.equal(out.merged, true, "the close went through instead of refusing");
  assert.deepEqual(out.trunk_committed, ["README.md"], "and it names the strays it took — never silent");
  // Trunk stands CLEAN afterwards. That is not tidiness: a worktree branches
  // from the last commit, so a dirty trunk is exactly when the tree the lane
  // serves and the tree the read-proof hashes drift apart.
  const left = spawnSync("git", ["status", "--porcelain", "--untracked-files=no"], { cwd: root, encoding: "utf8", windowsHide: true }).stdout;
  assert.equal(left.trim(), "", "nothing tracked is left uncommitted");
  // The work landed in HISTORY, where it is findable - not in a stash.
  const log = spawnSync("git", ["log", "--oneline", "-6"], { cwd: root, encoding: "utf8", windowsHide: true }).stdout;
  assert.match(log, /strays committed by the close/, "the commit says why it exists");
});

test("a broken sub-canvas refuses typed at entry; fixing it heals on the next tick", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  await pullBoot(server, session);
  session.setAutonomy(1);
  // Aim while the drawing is sound — then it breaks under the walk.
  session.setTarget("ideation");
  const p = join(root, "product", "deliverable", "machines", "ideation.canvas");
  const original = readFileSync(p, "utf8");
  const canvas = JSON.parse(original) as RawCanvas;
  const node = canvas.nodes.find((n) => n.type === "file" && String(n.file).endsWith(".md"))!;
  node.file = "deliverable/machines/states/does-not-exist.md";
  writeFileSync(p, JSON.stringify(canvas));
  // The pull cannot DRAW a way into a broken sub-machine, and says so as
  // an instruction: the fix is the person's, so the answer is wait.
  const broken = await call(server, "se_pull", {});
  assert.equal(broken.isError, false, JSON.stringify(broken.body));
  assert.equal(broken.body.pull, "wait", JSON.stringify(broken.body));
  assert.match(String(broken.body.why), /no drawn path/);
  // The ENTRY itself still refuses typed — the mirror's hand meets the
  // exact canvas error, with the offending element named. (The human's
  // read gate stands before it, so the boxes are checked first.)
  checkDocs(session);
  await assert.rejects(() => session.advance("ideation"), (e) => (e as { clause?: string }).clause === "SE-C-124");
  // Fix the drawing; the next pull draws the way again and walks in.
  writeFileSync(p, original);
  const healed = await call(server, "se_pull", {});
  assert.equal(healed.isError, false, JSON.stringify(healed.body));
  assert.deepEqual(session.active(), ["ideation/start"], "the healed entry is the pull's one step");
});

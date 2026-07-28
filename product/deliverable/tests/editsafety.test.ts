// EDIT SAFETY — the machines-are-drawn law (owner ruling 2026-07-28): the
// engine accepts what a person naturally draws in Obsidian. Regression
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
import { expClose, expNew } from "../engine/worktree.ts";
import { compileMachine } from "../engine/machines/compile.ts";
import { Session, mainMachinePath } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, checkDocs, freshRoot, readHashesFor } from "./helpers.ts";

interface RawEdge { id: string; styleAttributes?: Record<string, unknown>; fromNode: string; fromSide?: string; toNode: string; toSide?: string }
interface RawCanvas { nodes: { type: string; file?: string }[]; edges: RawEdge[] }

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
  const read_hashes = readHashesFor(root);
  let landed: Record<string, unknown> = {};
  for (let i = 0; i < 8; i++) {
    const step = await call(server, "se_tick", { advance: true, read_hashes });
    assert.equal(step.isError, false, JSON.stringify(step.body));
    landed = step.body;
    if (step.body.booted === true) break;
  }
  assert.deepEqual(landed.active, ["idle"], "the walk stands at idle, not on no state");
});

test("a drawn JOIN synchronizes: a starving join refuses the tick, the walk stands", async () => {
  const root = freshRoot();
  const p = mainMachinePath(root);
  const canvas = JSON.parse(readFileSync(p, "utf8")) as RawCanvas;
  for (const e of canvas.edges) {
    if (e.id === "e-ideation-idle") e.styleAttributes = { role: "normal" };
  }
  writeFileSync(p, JSON.stringify(canvas));
  // idle becomes a drawn JOIN — it now waits for boot AND ideation.
  const idleNote = join(root, "product", "deliverable", "machines", "states", "idle.md");
  writeFileSync(idleNote, readFileSync(idleNote, "utf8").replace("state_kind: work", "state_kind: join"));
  const session = new Session(root);
  await session.tickAdvance();
  await session.tickAdvance();
  checkDocs(session);
  await session.tickAdvance();
  await session.tickAdvance();
  assert.deepEqual(session.active(), ["boot/end"]);
  await assert.rejects(
    () => session.tickAdvance(),
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

test("the hatch always works: a booted main-machine walk escapes to idle", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  const hashes = readHashesFor(root);
  await session.tickAdvance();
  await session.tickAdvance();
  checkDocs(session);
  await session.tickAdvance();
  await session.tickAdvance();
  await session.tickAdvance();
  assert.deepEqual(session.active(), ["idle"]);
  // At idle the hatch has nowhere to go.
  const atIdle = await call(server, "se_tick", { escape: "nothing is broken" });
  assert.equal(atIdle.isError, true);
  assert.equal(atIdle.body.clause, "SE-C-110");
  // A legacy strand (empty token set) escapes home.
  session.instance.active = [];
  const out = await call(server, "se_tick", { escape: "stranded by an old engine", read_hashes: hashes });
  assert.equal(out.isError, false, JSON.stringify(out.body));
  assert.deepEqual(out.body.active, ["idle"]);
  assert.equal(session.instance.escapes.length, 1);
});

test("escape before boot completes still refuses", async () => {
  const root = freshRoot();
  const server = buildServer(root);
  const r = await call(server, "se_tick", { escape: "too early" });
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
  writeFileSync(join(e.path, "product", "spec", "expeditions", e.id, "report.md"), "---\nform: expedition-leave\nstatus: done\n---\n\nprobe report\n");
  assert.throws(
    () => expClose(root, e, true),
    (err) => (err as { clause?: string }).clause === "SE-C-112" && /clash\.md/.test(String((err as { got?: string }).got)),
  );
  const st = spawnSync("git", ["status"], { cwd: root, encoding: "utf8", windowsHide: true }).stdout;
  assert.ok(!/Unmerged|MERGING|both added/.test(st), "the root tree stands clean after the refusal: " + st);
});

test("a broken sub-canvas refuses typed at entry; fixing it heals on the next tick", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  const hashes = readHashesFor(root);
  await session.tickAdvance();
  await session.tickAdvance();
  checkDocs(session);
  await session.tickAdvance();
  await session.tickAdvance();
  await session.tickAdvance();
  session.setAutonomy(1);
  // Break the ideation canvas: a dangling state reference.
  const p = join(root, "product", "deliverable", "machines", "ideation.canvas");
  const original = readFileSync(p, "utf8");
  const canvas = JSON.parse(original) as RawCanvas;
  const node = canvas.nodes.find((n) => n.type === "file" && String(n.file).endsWith(".md"))!;
  node.file = "deliverable/machines/states/does-not-exist.md";
  writeFileSync(p, JSON.stringify(canvas));
  const broken = await call(server, "se_tick", { to: "ideation", read_hashes: hashes });
  assert.equal(broken.isError, true);
  assert.equal(broken.body.clause, "SE-C-124");
  // Fix the drawing; the next tick retries the entry as its one step.
  writeFileSync(p, original);
  const healed = await call(server, "se_tick", { advance: true, read_hashes: hashes });
  assert.equal(healed.isError, false, JSON.stringify(healed.body));
  assert.deepEqual(healed.body.active, ["ideation/start"], "the healed entry is the tick's one step");
});

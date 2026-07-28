// e14 — the pre-iteration bundle: arbitrary-depth nesting (the walk is a
// stack), archive decades as real sub-machines, the open-map "…and N
// more", state to-do lists, and the se_test tool.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { Decisions, parseUpdate } from "../engine/decisions.ts";
import { buildArchive, type ArchiveEntry } from "../engine/expmachine.ts";
import { compileMachine } from "../engine/machines/compile.ts";
import { renderMirror } from "../engine/render.ts";
import { mainMachinePath, Session } from "../engine/session.ts";
import { bootedServer, call, checkDocs, freshRoot } from "./helpers.ts";

function entries(n: number): ArchiveEntry[] {
  return Array.from({ length: n }, (_, i) => ({ sid: `e${i + 1}`, full: `e${i + 1}-x`, goal: "" }));
}

test("buildArchive: ten or fewer stay flat, more grows decade sub-machines", () => {
  const flat = buildArchive("expedition_archive", entries(9), "expedition");
  assert.equal(flat.decl.states.length, 11, "start + 9 records + end");
  assert.equal(flat.subGen, undefined);
  const dec = buildArchive("expedition_archive", entries(13), "expedition");
  assert.deepEqual(dec.decl.states.map((s) => s.id), ["start", "e1-e10", "e11-e13", "end"]);
  assert.equal(dec.decl.states[1].submachine, "generated", "a decade is a sub-machine state");
  assert.equal(dec.decl.states[1].priority, 1.5, "archive browsing stays human-only");
  const inner = dec.subGen!["e1-e10"]();
  assert.equal(inner.decl.id, "e1-e10");
  assert.equal(inner.decl.states.length, 12, "start + the ten records + end");
  assert.equal(inner.decl.states.find((s) => s.id === "e5")?.tags?.includes("archive-record"), true);
  const n1 = dec.canvas.nodes!.find((n) => n.id === "n-e1-e10")!;
  const n2 = dec.canvas.nodes!.find((n) => n.id === "n-e11-e13")!;
  assert.equal(n1.x, n2.x, "decades share one column");
  assert.ok(n2.y! > n1.y!, "a new decade lands at the bottom");
});

test("the open map says …and N more past eight open points", () => {
  const d = new Decisions(mkdtempSync(join(tmpdir(), "se-dec-")));
  d.apply("s@0", parseUpdate({ op: "plan", items: Array.from({ length: 9 }, (_, i) => `point ${i}`) }));
  assert.throws(
    () => d.apply("s@0", parseUpdate({ op: "done", node: "d99" })),
    (e) => String((e as { expected?: string }).expected).includes("…and 1 more"),
  );
});

test("stateTodos: origins ride the nodes and parked defers show without materializing", () => {
  const d = new Decisions(mkdtempSync(join(tmpdir(), "se-dec-")));
  d.apply("a@0", parseUpdate({ op: "plan", items: ["one", "two"] }));
  d.apply("a@0", parseUpdate({ op: "defer", node: "d1", to: "b" }));
  const before = d.stateTodos("b");
  assert.equal(before.parked.length, 1);
  assert.equal(before.parked[0].brief, "one");
  assert.equal(d.stateTodos("b").parked.length, 1, "looking never materializes");
  const a = d.stateTodos("a");
  assert.equal(a.visits.length, 1);
  assert.equal(a.visits[0].nodes.find((n) => n.id === "d2")?.origin, "planned");
  d.apply("b@0", parseUpdate({ op: "update", brief: "arrived" }));
  const after = d.stateTodos("b");
  assert.equal(after.parked.length, 0);
  assert.ok(after.visits.some((v) => v.nodes.some((n) => n.origin === "deferred")), "the arrived point knows it was deferred");
});

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

async function bootHuman(s: Session): Promise<void> {
  checkDocs(s);
  for (let i = 0; i < 10; i++) {
    if (s.active()[0] === "idle") return;
    await s.tickAdvance();
  }
  throw new Error("boot did not reach idle");
}

test("nesting: the walk descends into an archive decade and climbs back out", async () => {
  const root = freshRoot();
  gitSeed(root);
  // Twelve CLOSED expeditions, cheaply: a branch without a worktree is
  // closed by definition — no worktree churn needed for the shape.
  for (let i = 1; i <= 12; i++) {
    const r = spawnSync("git", ["branch", `exp/e${i}-t`], { cwd: root, encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
  }
  const s = new Session(root);
  await bootHuman(s);
  await s.tickAdvance("expedition_archive");
  assert.deepEqual(s.active(), ["expedition_archive/start"]);
  await s.tickAdvance("e1-e10");
  assert.deepEqual(s.active(), ["expedition_archive/e1-e10/start"], "entering the decade pushes a second level");
  assert.deepEqual(s.breadcrumb(), ["main", "expedition_archive", "e1-e10"]);
  await s.tickAdvance("e5");
  assert.deepEqual(s.active(), ["expedition_archive/e1-e10/e5"]);
  await s.tickAdvance();
  assert.deepEqual(s.active(), ["expedition_archive/e1-e10/end"], "one record visited completes the decade");
  await s.tickAdvance();
  assert.deepEqual(s.active(), ["expedition_archive/end"], "leaving the decade returns to the archive container");
  await s.tickAdvance();
  assert.deepEqual(s.active(), ["idle"], "leaving the archive returns to main");
  // The nested machines stay viewable from idle — decl and drawing.
  const dec = s.viewFor("e11-e12");
  assert.ok(dec !== undefined);
  assert.equal(dec!.decl.states.length, 4, "start + two records + end");
  assert.ok(s.viewFor("expedition_archive") !== undefined);
  // Breadcrumbs walk the PARENT CHAIN — a decade stands under its archive.
  assert.deepEqual(s.viewChain("e11-e12"), ["main", "expedition_archive", "e11-e12"]);
  const html = renderMirror({ session: s, root, lastPacket: undefined, mode: "manual", log: undefined }, undefined, "e11-e12");
  assert.ok(html.includes('<b class="here">e11-e12</b>'), "the decade is the here-crumb");
  assert.ok(html.includes('href="/?view=expedition_archive"'), "its parent archive is a crumb link");
  assert.ok(html.includes('id="cur-state"'), "the header names the walk's current state");
});

test("the front desk and ideation stand as idle doors with their drawn shapes", () => {
  const root = freshRoot();
  const m = compileMachine(root, mainMachinePath(root));
  const idle = m.states.find((s) => s.id === "idle")!;
  assert.ok(idle.edges.some((e) => e.to === "front_desk"), "idle reaches the front desk");
  assert.ok(idle.edges.some((e) => e.to === "ideation"), "idle reaches ideation");
  const fd = m.states.find((s) => s.id === "front_desk")!;
  assert.equal(fd.priority, 0.2);
  assert.match(fd.statement, /in doubt, go here/i, "the door carries its subtitle");
  const idea = m.states.find((s) => s.id === "ideation")!;
  assert.equal(idea.priority, 1, "the ideation door sits at the slider's top notch");
  const fdM = compileMachine(root, join(root, "product", "deliverable", "machines", "front_desk.canvas"));
  assert.deepEqual(fdM.states.map((s) => s.id), ["start", "consult", "end"]);
  const ideaM = compileMachine(root, join(root, "product", "deliverable", "machines", "ideation.canvas"));
  assert.deepEqual(ideaM.states.map((s) => s.id), ["start", "frame", "diverge", "converge", "route", "end"]);
});

test("settings survive an engine life: a new session restores the store", () => {
  const root = freshRoot();
  const a = new Session(root);
  a.setAutonomy(0.85);
  a.setShutdown(3);
  const b = new Session(root);
  assert.equal(b.autonomy, 0.85);
  assert.equal(b.shutdown, 3);
});

test("se_answer records an aq entry and the feed types it aq", async () => {
  const root = freshRoot();
  const server = await bootedServer(root);
  const t = await call(server, "se_answer", { question: "Where does the ruling live?", answer: "On the branch — the close stamps it." });
  assert.equal(t.isError, false, JSON.stringify(t.body));
  const { CallLog } = await import("../engine/calllog.ts");
  const { feedRows } = await import("../engine/render.ts");
  const { seDir } = await import("../engine/paths.ts");
  const rows = feedRows(new CallLog(seDir(root)), "2000-01-01").rows as { type: string; brief: string }[];
  const aq = rows.find((r) => r.type === "aq");
  assert.ok(aq !== undefined, "the aq row rides the feed");
  assert.equal(aq!.brief, "Where does the ruling live?", "the feed line is the question");
});

test("se_test: one call runs both scripts with structured verdicts", async () => {
  const root = freshRoot();
  const server = await bootedServer(root);
  const t = await call(server, "se_test");
  assert.equal(t.isError, false, JSON.stringify(t.body));
  const body = t.body as unknown as { ok: boolean; results: { script: string; ok: boolean; output: string }[] };
  assert.equal(body.results.length, 2);
  assert.equal(body.ok, true, JSON.stringify(body.results));
});

// THIS FILE PROVES THE SCRIPTS RUN, so the suite's spawn-skip is cleared
// here — a guard that makes a tool do nothing is invisible to a test that
// only reads its output (software.md).
delete process.env.SE_SCRIPT_SKIP;

// e14 — the pre-iteration bundle: arbitrary-depth nesting (the walk is a
// stack), archive decades as real sub-machines, the open-map "…and N
// more", state to-do lists, and the se_test tool.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { Decisions, parseUpdate } from "../engine/decisions.ts";
import { type ArchiveEntry, buildArchive } from "../engine/expmachine.ts";
import { compileMachine } from "../engine/machines/compile.ts";
import { renderMirror } from "../engine/render.ts";
import { DEFAULT_TIER } from "../engine/scale.ts";
import { mainMachinePath, Session } from "../engine/session.ts";
import { bootedServer, call, checkDocs, freshRoot, waitForTestJob } from "./helpers.ts";

function entries(n: number): ArchiveEntry[] {
  return Array.from({ length: n }, (_, i) => ({ sid: `e${i + 1}`, full: `e${i + 1}-x`, goal: "" }));
}

test("buildArchive: ten or fewer stay flat, more grows decade sub-machines", () => {
  const flat = buildArchive("expedition_archive", entries(9), "expedition");
  assert.equal(flat.decl.states.length, 11, "start + 9 records + end");
  assert.equal(flat.subGen, undefined);
  const dec = buildArchive("expedition_archive", entries(13), "expedition");
  assert.deepEqual(
    dec.decl.states.map((s) => s.id),
    ["start", "e1-e10", "e11-e13", "end"],
  );
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

// CORRECT WHAT IS MECHANICAL, ANNOUNCE IT, REFUSE ONLY THE AMBIGUOUS. An
// update on the item just resolved was the biggest refusal class in the log.
test("an update on a CLOSED node is corrected and announced, never refused", () => {
  const d = new Decisions(mkdtempSync(join(tmpdir(), "se-dec-")));
  d.apply("s@0", parseUpdate({ op: "plan", items: ["parent"] }));
  d.apply("s@0", parseUpdate({ op: "plan", node: "d1", items: ["child"] }));
  d.apply("s@0", parseUpdate({ op: "done", node: "d2", brief: "the child landed" }));
  // The child is closed; its parent is not, so the update goes to the parent.
  const onChild = d.apply("s@0", parseUpdate({ op: "update", node: "d2", brief: "still tidying it" }));
  assert.equal(onChild.active, "d1", "it landed on the open parent");
  assert.match(String(onChild.corrected), /d2 is already done/);
  d.apply("s@0", parseUpdate({ op: "done", node: "d1", brief: "the parent landed" }));
  // Nothing above it is open now, so the same update lands bare.
  const bare = d.apply("s@0", parseUpdate({ op: "update", node: "d1", brief: "one last word" }));
  assert.equal(bare.active, null, "with nothing open it lands bare");
  assert.match(String(bare.corrected), /landed bare/);
  // A RESOLUTION is a different matter — re-resolving is a real disagreement.
  assert.throws(() => d.apply("s@0", parseUpdate({ op: "done", node: "d99", brief: "no such thing" })));
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
  // Entering b materializes the parked defer as an open to-do, so the
  // update names it. An update floating free of the checklist it should be
  // moving is exactly what the node requirement exists to stop.
  d.apply("b@0", parseUpdate({ op: "update", node: "d3", brief: "arrived" }));
  const after = d.stateTodos("b");
  assert.equal(after.parked.length, 0);
  assert.ok(
    after.visits.some((v) => v.nodes.some((n) => n.origin === "deferred")),
    "the arrived point knows it was deferred",
  );
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
    await s.advance();
  }
  throw new Error("boot did not reach idle");
}

test("nesting: the walk descends into an archive decade and climbs back out", async () => {
  const root = freshRoot();
  gitSeed(root);
  // TWELVE CLOSED EXPEDITIONS, cheaply. A record is a FOLDER and its own
  // status says whether it is closed, so the fixture writes twelve records.
  for (let i = 1; i <= 12; i++) {
    const dir = join(root, "spec", "expeditions", `e${i}-t`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "record.md"), `---\nid: e${i}-t\nkind: fix\nstatus: closed\ngoal: "probe ${i}"\n---\n`, "utf8");
  }
  const s = new Session(root);
  await bootHuman(s);
  await s.advance("expedition_archive");
  assert.deepEqual(s.active(), ["expedition_archive/start"]);
  await s.advance("e1-e10");
  assert.deepEqual(s.active(), ["expedition_archive/e1-e10/start"], "entering the decade pushes a second level");
  assert.deepEqual(s.breadcrumb(), ["main", "expedition_archive", "e1-e10"]);
  await s.advance("e5");
  assert.deepEqual(s.active(), ["expedition_archive/e1-e10/e5"]);
  await s.advance();
  assert.deepEqual(s.active(), ["expedition_archive/e1-e10/end"], "one record visited completes the decade");
  await s.advance();
  assert.deepEqual(s.active(), ["expedition_archive/end"], "leaving the decade returns to the archive container");
  await s.advance();
  assert.deepEqual(s.active(), ["idle"], "leaving the archive returns to main");
  // The nested machines stay viewable from idle — decl and drawing.
  const dec = s.viewFor("e11-e12");
  assert.ok(dec !== undefined);
  assert.equal(dec?.decl.states.length, 4, "start + two records + end");
  assert.ok(s.viewFor("expedition_archive") !== undefined);
  // Breadcrumbs walk the PARENT CHAIN — a decade stands under its archive.
  assert.deepEqual(s.viewChain("e11-e12"), ["main", "expedition_archive", "e11-e12"]);
  const html = renderMirror({ session: s, root, lastPacket: undefined, mode: "manual", log: undefined }, undefined, "e11-e12");
  assert.ok(html.includes('<b class="here">e11-e12</b>'), "the decade is the here-crumb");
  assert.ok(html.includes('href="/?view=expedition_archive"'), "its parent archive is a crumb link");
  // ONE BUTTON PER STANDING STATE, so the hook is a class rather than an id
  // (owner ruling 2026-08-08, when finders became a fan). Here the walk
  // stands in one state, so there is exactly one button.
  assert.ok(html.includes('class="ghost cur-state"'), "the header names the walk's current state");
});

test("the front desk and ideation stand as idle doors with their drawn shapes", () => {
  const root = freshRoot();
  const m = compileMachine(root, mainMachinePath(root));
  const idle = m.states.find((s) => s.id === "idle")!;
  assert.ok(
    idle.edges.some((e) => e.to === "front_desk"),
    "idle reaches the front desk",
  );
  assert.ok(
    idle.edges.some((e) => e.to === "ideation"),
    "idle reaches ideation",
  );
  const fd = m.states.find((s) => s.id === "front_desk")!;
  assert.equal(fd.priority, 0.2);
  assert.equal(fd.submachine, undefined, "the one-state rule: the desk is a plain state");
  assert.match(fd.statement, /in doubt, go here/i, "the statement IS the subtitle");
  assert.ok((fd.tags ?? []).includes("front-desk"), "the method doc pulls by this tag");
  const retro = m.states.find((s) => s.id === "retro")!;
  assert.equal(retro.submachine, undefined, "the retro converted under the same rule");
  assert.ok((retro.legal_tools ?? []).includes("se_note_drain"), "the legality zone rides legal_tools");
  const idea = m.states.find((s) => s.id === "ideation")!;
  assert.equal(idea.priority, 1, "the ideation door sits at the slider's top notch");
  assert.equal(idea.statement, "Diverge on purpose.", "authored door statement rides up");
  const idle2 = m.states.find((s) => s.id === "idle")!;
  assert.equal(idle2.statement, "", "filler statements are struck - empty beats an echo");
  const ideaM = compileMachine(root, join(root, "deliverable", "machines", "ideation.canvas"));
  assert.deepEqual(
    ideaM.states.map((s) => s.id),
    ["start", "frame", "diverge", "converge", "route", "end"],
  );
});

// SETTINGS BELONG TO A SESSION (owner rulings 2026-07-28). A RELOAD is the
// same session and keeps the sliders; a session that ended and started again
// is a new one and takes the defaults. The shim stamps each engine life with
// the session's token, and matching it is what tells the two apart.
test("settings survive a RELOAD: the same session restores the store", () => {
  const root = freshRoot();
  const was = process.env.SE_SESSION;
  process.env.SE_SESSION = "session-under-test";
  try {
    const a = new Session(root);
    a.setAutonomy(0.85);
    a.setPower("block-auto-sleep", true);
    // A reload is a new engine life inside the SAME session.
    const b = new Session(root);
    assert.equal(b.autonomy, 0.85);
    assert.equal(b.power.block_sleep, true);
  } finally {
    if (was === undefined) delete process.env.SE_SESSION;
    else process.env.SE_SESSION = was;
  }
});

test("settings do NOT survive the session: a fresh start takes the defaults", () => {
  const root = freshRoot();
  const was = process.env.SE_SESSION;
  try {
    process.env.SE_SESSION = "the-session-that-ended";
    const a = new Session(root);
    a.setAutonomy(0.85);
    a.setPower("block-auto-sleep", true);
    // A new session mints a new token, so last session's store does not apply.
    process.env.SE_SESSION = "a-brand-new-session";
    const b = new Session(root);
    // THE DEFAULT IS ASSERTED BY NAME, never as a value (owner ruling
    // 2026-08-18). A case that pins the number goes red every time the ladder
    // is re-spaced, and says nothing about which rung was meant.
    assert.equal(b.tier, DEFAULT_TIER, "autonomy is back to its default rung");
    assert.equal(b.power.block_sleep, false, "the power flags are back to their default");
    // It fails SAFE: no token at all restores nothing either, so a crash or a
    // power cut cannot leave the last session's sliders standing.
    delete process.env.SE_SESSION;
    const c = new Session(root);
    assert.equal(c.tier, DEFAULT_TIER);
    assert.equal(c.power.block_sleep, false);
  } finally {
    if (was === undefined) delete process.env.SE_SESSION;
    else process.env.SE_SESSION = was;
  }
});

test("the voice lint: walls, sentences, chains and the pyramid - thresholds are data", async () => {
  const { lintProse } = await import("../engine/lint.ts");
  const { writeFileSync } = await import("node:fs");
  const root = freshRoot();
  const wall = Array.from({ length: 9 }, (_, i) => `plain prose line number ${i} of the wall`).join("\n");
  assert.ok(
    lintProse(root, wall).some((f) => f.rule === "wall"),
    "nine unbroken lines are a wall",
  );
  assert.ok(lintProse(root, `${"word ".repeat(30)}end.`).some((f) => f.rule === "long-sentence"));
  assert.ok(
    lintProse(root, "we walk the drawing, prove the reading, fill the form, stamp the claim and pull again.").some(
      (f) => f.rule === "comma-chain",
    ),
    "a chain of THOUGHTS is the buried list",
  );
  // A PART MUST CARRY SUBSTANCE TO COUNT (e28 ruling, rebuilt 2026-08-09):
  // an enumeration of bare NAMES is reference, and nobody wants `pill` on
  // its own bullet.
  assert.ok(
    !lintProse(root, "we need alpha, beta, gamma, delta and epsilon.").some((f) => f.rule === "comma-chain"),
    "a chain of bare names is reference, not a buried list",
  );
  // A SPAN IS ONE THING. The separator set includes the slash, so a path
  // inside a code span split into an "item" per segment. Every card saying
  // where its node lives fired the chain rule on a path it could not fix.
  assert.equal(
    lintProse(root, "Lives in `spec/trace/raid/`. Written at M4.").length,
    0,
    "a path inside a code span is one item, not five",
  );
  // A LIST MARKER IS NOT A SENTENCE. "1." ends in a full stop, so a numbered
  // item measured one sentence more than it had.
  assert.equal(
    lintProse(root, "1. State the overall function. Abstract until it holds.").length,
    0,
    "a numbered marker does not count as a sentence",
  );
  // A numbered step IS a list item, so the item cap applies to it.
  assert.ok(
    lintProse(root, "1. Do this. Then do that. Then do the third thing.").some((f) => f.rule === "item-grew"),
    "three sentences in a numbered item is item-grew",
  );
  // A PIPE ROW IS CELLS. A form field is `- name | help | required`, and the
  // trailing `required` was counted as a sentence of the help text.
  assert.equal(
    lintProse(root, "- tldr | The chosen candidate. What it beat. | required").length,
    0,
    "the trailing cell of a field row is not a sentence of its help",
  );
  // DASH CHAINS, not dashes. One dash sets off an aside and is house style
  // here; flagging every one would be an advisory nobody heeds.
  assert.ok(lintProse(root, "we need alpha — then beta — then gamma — then delta.").some((f) => f.rule === "dash-chain"));
  assert.ok(
    !lintProse(root, "we need alpha — the obvious one — before anything else.").some((f) => f.rule === "dash-chain"),
    "a single aside is not a chain",
  );
  const five = Array.from({ length: 5 }, (_, i) => `paragraph ${i}.`).join("\n\n");
  assert.ok(
    lintProse(root, five).some((f) => f.rule === "pyramid"),
    "five headingless paragraphs want the pyramid",
  );
  assert.equal(lintProse(root, "# Heading\n\nshort and clean.").length, 0, "clean prose passes");
  // REFERENCES ARE NOTES: the link belongs in a reference note, and every
  // other page cites that note instead of carrying the link itself.
  const linked = "see https://example.org/paper for the method.";
  assert.ok(
    lintProse(root, linked, "guidance/some.md").some((f) => f.rule === "external-link"),
    "a link outside the reference home is a finding",
  );
  assert.ok(
    !lintProse(root, linked, "spec/references/ref-paper.md").some((f) => f.rule === "external-link"),
    "the same link inside a reference note is where it belongs",
  );
  assert.ok(!lintProse(root, linked).some((f) => f.rule === "external-link"), "text with no home is not judged");
  // DATA, not code: raise the threshold in the config - the wall passes.
  writeFileSync(join(root, "deliverable", "machines", "lint", "voice-lint.md"), "---\nwall_paragraph_lines: 99\n---\n", "utf8");
  assert.ok(!lintProse(root, wall).some((f) => f.rule === "wall"), "the edited threshold applies without a rebuild");
});

// THE SWEEP. Linting one file per call is why nothing was ever linted: the
// tool could only be aimed at prose somebody already suspected.
test("the voice lint sweeps a whole tree and reports what it left out", async () => {
  const root = freshRoot();
  const server = await bootedServer(root);
  const { writeFileSync, mkdirSync } = await import("node:fs");
  const dir = join(root, "guidance", "sweeptest");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "dirty.md"), "we walk the drawing, prove the reading, fill the form, stamp the claim and pull again.\n", "utf8");
  writeFileSync(join(dir, "clean.md"), "# Heading\n\nshort and clean.\n", "utf8");
  writeFileSync(join(dir, "notprose.txt"), "never read by a prose lint\n", "utf8");
  // A STATE NOTE keeps its prose in the FRONTMATTER, where lintProse never
  // looked - and `guidance` is read by an agent on every single visit.
  writeFileSync(
    join(dir, "astate.md"),
    "---\nstate: probe\nguidance: we walk the drawing, prove the reading, fill the form, stamp the claim and pull again.\n---\n\nclean body.\n",
    "utf8",
  );
  const swept = await call(server, "se_lint", { glob: "guidance/sweeptest/*" });
  assert.equal(swept.isError, false, JSON.stringify(swept.body));
  assert.equal(swept.body.swept, 3, "every markdown file was read");
  assert.equal(swept.body.skipped_not_markdown, 1, "and the one it skipped is named, not implied");
  assert.equal(swept.body.clean, 1, "the clean file is counted");
  const files = swept.body.files as { path: string; count: number; findings: { where: string }[] }[];
  assert.equal(files.length, 2, "only files WITH findings come back");
  assert.ok(
    files.some((f) => /dirty\.md$/.test(f.path)),
    "the one with a bad body",
  );
  const stateNote = files.find((f) => /astate\.md$/.test(f.path))!;
  assert.ok(stateNote !== undefined, "and the one whose only bad prose is in its frontmatter");
  assert.equal(stateNote.findings[0].where, "guidance", "each finding says WHICH prose it is in");
  // Neither of the older forms is disturbed by the new one.
  const one = await call(server, "se_lint", {
    text: "we walk the drawing, prove the reading, fill the form, stamp the claim and pull again.",
  });
  assert.equal(one.body.count, 1, "a single block still lints");
  const none = await call(server, "se_lint", {});
  assert.equal(none.isError, true);
  assert.match(String(none.body.expected), /glob/, "and the refusal offers the sweep");
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
  assert.equal(aq?.brief, "Where does the ruling live?", "the feed line is the question");
});

test("se_test: one job formats, runs both scripts and sweeps, with structured verdicts", async () => {
  const root = freshRoot();
  const server = await bootedServer(root);
  // FORCE, BECAUSE THIS CASE PROVES THE BATTERY'S SHAPE and does not earn one
  // (i11). The full battery belongs to verification now
  // (req-the-full-battery-runs-where-the-method-says), and this fixture stands
  // at the front desk — so without force it meets the refusal it is not about.
  const started = await call(server, "se_test", { force: true });
  assert.equal(started.isError, false, JSON.stringify(started.body));
  assert.equal(started.body.handed_off, true, JSON.stringify(started.body));
  const body = await waitForTestJob(server, String(started.body.job));
  const results = body.results as { script: string; ok: boolean; output: string }[];
  // FOUR SINCE i6: the CONFORMANCE SWEEP rides the battery. There is no verb
  // for it, so the engine runs it where it decides — the boot, this row's
  // sibling at sweep-consistency, and here.
  assert.equal(results.length, 4, JSON.stringify(results.map((r) => r.script)));
  assert.equal(results[0].script, "biome check --write --error-on-warnings .");
  assert.equal(results[1].script, "deliverable/engine/bin/preflight.ts");
  assert.equal(results[2].script, "deliverable/engine/bin/selftest.ts");
  assert.equal(results[3].script, "deliverable/engine/bin/sweep.ts");
  assert.equal(body.ok, true, JSON.stringify(results));
});

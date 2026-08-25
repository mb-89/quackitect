// THE STOP TOOTH. The contract's stop rules failed
// as prose four recorded times, so the Stop hook refuses an unsanctioned
// stop mechanically — on Claude Code via .claude/settings.json, on Copilot
// CLI via the same cross-tool file plus .github/hooks/se-stop.json.
//
// The verdict comes from the engine's own ground truth: the newest se_pull
// in the call log. wait — the machine's own stop — passes. Anything
// mid-work (do, read, fill, choose) blocks, once; stop_hook_active is the
// valve for a question that genuinely blocks the walk.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { decide } from "../engine/bin/se-hook-stop.ts";
import { freshRoot, pullBoot } from "./helpers.ts";

const HOOK = fileURLToPath(new URL("../engine/bin/se-hook-stop.ts", import.meta.url));

/** A crafted product root holding only the call log the hook reads.
 *
 *  `mode` writes the settings file the hook reads to learn whether anybody is
 *  there to read a claim. Omitted, no settings file is written at all, which
 *  is the case a real session must survive. */
function craftRoot(records: object[], mode?: string): string {
  const root = mkdtempSync(join(tmpdir(), "se-stop-"));
  mkdirSync(join(root, ".se"), { recursive: true });
  writeFileSync(join(root, ".se", "calls.jsonl"), `${records.map((r) => JSON.stringify(r)).join("\n")}\n`, "utf8");
  if (mode !== undefined) writeFileSync(join(root, ".se", "settings.json"), JSON.stringify({ mode }), "utf8");
  return root;
}

/** What the hook decides: the JSON it would write, or empty for a pass.
 *
 *  ASKED IN THIS PROCESS. Every case used to spawn a node that type-stripped
 *  the hook again — twenty processes to answer twenty questions. Under the
 *  parallel battery one of them exited 1 having written nothing at all, and no
 *  amount of reading the hook explained it, because the hook never ran.
 *
 *  THE SPAWN IS STILL PROVEN, once, at the bottom of this file. That case is
 *  for the WIRING — stdin, stdout, exit code. Every other case is about the
 *  DECISION, and a decision needs no process. */
function verdict(records: object[], payload: object, mode?: string): string {
  const held = process.env.SE_HOOK_ROOT;
  process.env.SE_HOOK_ROOT = craftRoot(records, mode);
  try {
    const v = decide(JSON.stringify(payload));
    return v.block ? JSON.stringify({ decision: "block", reason: v.reason ?? "" }) : "";
  } finally {
    if (held === undefined) delete process.env.SE_HOOK_ROOT;
    else process.env.SE_HOOK_ROOT = held;
  }
}

const pullRecord = (response: object): object => ({
  ref: "call-000000000001",
  ts: "2026-08-09T16:00:00.000Z",
  tool: "se_pull",
  args: {},
  ok: true,
  outcome: "result",
  response,
});

test("a walk standing mid-work blocks the stop, and the reason names the state", () => {
  const out = verdict([pullRecord({ pull: "do", where: ["retro"] })], {});
  const d = JSON.parse(out) as { decision: string; reason: string };
  assert.equal(d.decision, "block");
  assert.match(d.reason, /"do" at retro/, "the reason names the pull and the state");
  assert.match(d.reason, /se_pull/, "and says what to do about it");
});

test("the machine's own wait passes — idle, the desk, or a step above the slider", () => {
  assert.equal(verdict([pullRecord({ pull: "wait", where: ["front_desk"] })], {}), "");
});

// THE DESK ANSWERS `do` ON THE TURN THE WALK ARRIVES (owner, 2026-08-17,
// one call after an iteration shipped): "when you're on the front desk after
// an iteration, you just stop. You don't keep going."
//
// Only `wait` used to pass, and the desk answers `wait` only on the pull
// AFTER arriving — because its own guidance is work. So the shape
// "iteration ships -> lands at the desk -> stop" could not be expressed, and
// the tooth bit a stop the agent had already named as sanctioned.

test("the desk with nothing routed passes, whatever the pull called it", () => {
  assert.equal(verdict([pullRecord({ pull: "do", where: ["front_desk"], target: "" })], {}), "");
});

test("the desk with a target set still blocks — a routed goal is a standing instruction", () => {
  const out = verdict([pullRecord({ pull: "do", where: ["front_desk"], target: "iterations/i34/shipped" })], {});
  assert.equal(JSON.parse(out).decision, "block", "the desk is not a hiding place from a goal the person routed");
});

// THE STOP-AT NOTCH DECIDES.
//
// One fixed rule was right about eight stops in a day and wrong about five,
// and no tuning lets it tell them apart: the REASON a stop happened is not in
// the walk's position. The person can see it, so the notch is theirs.

test("stop @ state end passes every stop — the engine is the one holding", () => {
  // Under this notch the ENGINE refuses each transition, so the agent handing
  // back IS the machine's own stop. Blocking it would fight the engine.
  assert.equal(verdict([pullRecord({ pull: "do", where: ["iterations/i11/build-steps/x"], stop_at: "state end" })], {}), "");
});

test("stop @ agent judgement is the default, and blocks mid-work exactly as before", () => {
  const withNotch = verdict([pullRecord({ pull: "do", where: ["retro"], stop_at: "agent judgement" })], {});
  const without = verdict([pullRecord({ pull: "do", where: ["retro"] })], {});
  assert.equal(JSON.parse(withNotch).decision, "block");
  assert.equal(JSON.parse(without).decision, "block", "an absent notch reads as the default, never as a licence");
});

test("stop @ bless passes at a gate and blocks anywhere else", () => {
  assert.equal(verdict([pullRecord({ pull: "fill", where: ["iterations/i11/gate-implementation"], stop_at: "bless" })], {}), "");
  const away = verdict([pullRecord({ pull: "do", where: ["iterations/i11/build-steps/x"], stop_at: "bless" })], {});
  const d = JSON.parse(away) as { decision: string; reason: string };
  assert.equal(d.decision, "block");
  assert.match(d.reason, /stop @ bless/, "the refusal names the notch that is asking");
});

test("stop @ blockers only passes a REFUSED pull and blocks a working one", () => {
  // The unattended-run notch: nothing brings the person back until the walk
  // genuinely cannot go on.
  const refused = { ...pullRecord({ pull: "do", where: ["x"], stop_at: "blockers only" }), ok: false };
  const working = pullRecord({ pull: "do", where: ["x"], stop_at: "blockers only" });
  assert.equal(verdict([working, refused], {}), "", "a refused pull is the block this notch waits for");
  const d = JSON.parse(verdict([working], {})) as { decision: string; reason: string };
  assert.equal(d.decision, "block");
  assert.match(d.reason, /blockers only/);
});

/** A forced stop, recorded the way the lane records one. */
const forceRecord = (because: string): object => ({
  ref: "call-000000000002",
  ts: "2026-08-09T16:00:01.000Z",
  tool: "se_stop",
  args: { because },
  ok: true,
  outcome: "result",
  response: { forced: because },
});

// RETRYING IS NOT CLAIMING, and the valve used to treat it as though it were.
//
// WHAT THE LIVE LOG SHOWED, four times in a row: `stop-block do at front_desk`
// and then, on the very next attempt, `stop-pass bites once per stop`. The
// tooth bit and the valve immediately released it.
//
// THE FLAG IS THE HARNESS'S, NOT THE AGENT'S. `stop_hook_active` is set when a
// blocked stop is retried. Nothing was decided, so nothing was claimed — and
// the refusal's invitation to name a sanctioned stop went unanswered while the
// stop went through anyway.
test("a retry alone no longer releases a stop — the flag is the harness's, not a claim", () => {
  const working = pullRecord({ pull: "do", where: ["retro"] });
  assert.equal(JSON.parse(verdict([working], {})).decision, "block", "the first attempt blocks");
  const again = JSON.parse(verdict([working], { stop_hook_active: true })) as { decision: string };
  assert.equal(again.decision, "block", "and the retry blocks too, because nobody claimed anything");
});

test("a stop forced on the record passes, blockers only included", () => {
  const working = pullRecord({ pull: "do", where: ["retro"], stop_at: "blockers only" });
  const forced = forceRecord("the retro's field-feedback question, and only the owner can answer it");
  assert.equal(
    verdict([working, forced], { stop_hook_active: true }),
    "",
    "blocked once and forced on purpose is the pair that opens the valve",
  );
});

test("a force cannot pre-empt the tooth — it must have bitten first", () => {
  const working = pullRecord({ pull: "do", where: ["retro"] });
  const forced = forceRecord("a decision only the owner can make");
  const out = JSON.parse(verdict([working, forced], {})) as { decision: string };
  assert.equal(out.decision, "block", "without the retry flag the first attempt still blocks");
});

test("a pull spends the force — one force releases one stop", () => {
  const forced = forceRecord("something broke and no remedy gets past it");
  const working = pullRecord({ pull: "do", where: ["retro"] });
  // The pull is NEWER than the force, so the walk moved on and the claim is
  // spent. A force that outlived its pull would be a switch, not a decision.
  const out = JSON.parse(verdict([forced, working], { stop_hook_active: true })) as { decision: string };
  assert.equal(out.decision, "block", "the walk moved after the force, so the force is gone");
});

test("a wait WITH A TARGET blocks — an escape does not launder a stop", () => {
  // MEASURED: the escape hatch lands at the front desk, the desk
  // answers wait, and the tooth had nothing to bite. Two stops that day were
  // post-escape and both passed, while a routed goal stood the whole time.
  const out = verdict([pullRecord({ pull: "wait", where: ["front_desk"], target: "iterations/i27" })], {});
  const d = JSON.parse(out) as { decision: string; reason: string };
  assert.equal(d.decision, "block");
  assert.match(d.reason, /iterations\/i27/, "the reason names the target the walk is not on");
  assert.match(d.reason, /not the same as nothing to do/, "and says why a wait is not idle here");
});

test("a wait with an EMPTY target still passes — that is genuine idle", () => {
  assert.equal(verdict([pullRecord({ pull: "wait", where: ["front_desk"], target: "" })], {}), "");
});

test("a wait with a whitespace target passes — blank is blank", () => {
  assert.equal(verdict([pullRecord({ pull: "wait", where: ["front_desk"], target: "   " })], {}), "");
});

test("a targeted wait, blocked once and FORCED, passes — the valve covers it too", () => {
  const waiting = pullRecord({ pull: "wait", where: ["front_desk"], target: "iterations/i27" });
  assert.notEqual(verdict([waiting], { stop_hook_active: true }), "", "the retry alone leaves the target standing");
  const forced = forceRecord("a gate the person owns is waiting on their thumb");
  assert.equal(verdict([waiting, forced], { stop_hook_active: true }), "", "and the force releases it");
});

test("a mid-form stop, blocked once and FORCED, passes — the valve for a blocking question", () => {
  const filling = pullRecord({ pull: "fill", where: ["work"] });
  assert.notEqual(verdict([filling], { stop_hook_active: true }), "", "the retry alone is not a claim");
  const forced = forceRecord("a decision only the owner can make");
  assert.equal(verdict([filling, forced], { stop_hook_active: true }), "", "and the force releases it");
});

test("no pull on record passes — the engine never ran here", () => {
  assert.equal(verdict([{ ref: "call-x", tool: "se_note", ok: true }], {}), "");
});

test("a string-encoded response still parses, and newer non-pull records are skipped", () => {
  const out = verdict(
    [
      pullRecord(JSON.parse(JSON.stringify({ pull: "read", where: ["boot"] })) as object),
      { ref: "call-y", tool: "se_file_read", ok: true },
    ],
    {},
  );
  const d = JSON.parse(out) as { decision: string };
  assert.equal(d.decision, "block", "the newest PULL decides, not the newest call");
});

test("an absent log passes rather than breaking the turn", () => {
  const root = mkdtempSync(join(tmpdir(), "se-stop-"));
  const r = spawnSync(process.execPath, [HOOK], {
    input: "{}",
    encoding: "utf8",
    env: { ...process.env, SE_HOOK_ROOT: root },
    windowsHide: true,
  });
  assert.equal(r.status, 0);
  assert.equal(r.stdout.trim(), "");
});

// THE CALL LOG STORES A RESPONSE AS A STRING, and a long one is stored CUT.
// Every test above hands the hook an OBJECT, which is why the string path was
// never exercised and the tooth was toothless in the field.
//
// FOUND LIVE 2026-08-14. The hook passed a mid-work stop twice against the
// real log. Every recent pull's response was too long to store whole, so
// JSON.parse threw, the line was skipped as torn, and no pull was ever found.

const pullString = (response: string): object => ({
  ref: "call-000000000002",
  ts: "2026-08-09T16:00:00.000Z",
  tool: "se_pull",
  args: {},
  ok: true,
  outcome: "result",
  response,
});

test("a response stored as a whole STRING still blocks", () => {
  const out = verdict([pullString(JSON.stringify({ pull: "do", where: ["retro"], target: "" }))], {});
  const d = JSON.parse(out) as { decision: string; reason: string };
  assert.equal(d.decision, "block");
  assert.match(d.reason, /"do" at retro/);
});

test("a response stored TRUNCATED still blocks — the tooth must not need the whole answer", () => {
  // Exactly what the log holds: the head of a huge fill, cut mid-object.
  const cut =
    '{"pull":"fill","where":["iterations/i27/build-steps/delta-compose"],"target":"front_desk","forms":[{"state_form":true,"title":"Evi';
  const out = verdict([pullString(cut)], {});
  assert.notEqual(out, "", "a cut response must not silently pass the stop");
  const d = JSON.parse(out) as { decision: string; reason: string };
  assert.equal(d.decision, "block");
  assert.match(d.reason, /fill/, "the reason still names the pull");
  assert.match(d.reason, /delta-compose/, "and still names where the walk stands");
});

test("a truncated WAIT with no target still passes — the fix must not make the tooth bite the machine's own stop", () => {
  const cut = '{"pull":"wait","where":["front_desk"],"target":"","forms":[{"state_form":true,"title":"Evi';
  assert.equal(verdict([pullString(cut)], {}), "", "the desk with nothing routed is sanctioned, cut or whole");
});

test("a truncated wait WITH a target still blocks", () => {
  const cut = '{"pull":"wait","where":["front_desk"],"target":"iterations/i27/specify-build","forms":[{"state_form":true';
  const out = verdict([pullString(cut)], {});
  const d = JSON.parse(out) as { decision: string; reason: string };
  assert.equal(d.decision, "block");
  assert.match(d.reason, /A target is set/);
});

// THE SEAM THIS FILE COULD NOT SEE, measured 2026-08-24.
//
// EVERY TEST ABOVE HANDS THE HOOK A PULL RESPONSE WRITTEN BY HAND. That proves
// the hook reads what it is given. It proves nothing about what the engine
// actually gives it, and the two drifted apart for four days.
//
// WHAT DRIFTED. Commit c318aeda stamped the notch onto packet(), which serves
// the mirror. The hook reads PULLS. Measured across the live call log: 338 of
// 338 pulls carried no stop_at at all. So the hook's notch always read empty,
// `state end`, `bless` and `blockers only` were unreachable branches, and the
// person's stop-at control changed nothing about when the agent handed back.
//
// A GREEN SUITE THE WHOLE TIME. Both halves were correct in isolation.
//
// SO THIS TEST JOINS THEM: a real session produces a real pull, and that exact
// object is what the hook is fed.

test("a REAL pull carries the notch, and the hook obeys it end to end", async () => {
  const { Session } = await import("../engine/session.ts");
  const s = new Session(freshRoot());

  // THE CONTROL THE PERSON PRESSES, set by name the way the surface sets it.
  const set = s.setStopAt("blockers only") as { stop_at?: string };
  assert.equal(set.stop_at, "blockers only", "the notch is settable by name");

  const packet = (await s.pull()) as Record<string, unknown>;

  // THE ASSERTION THAT WAS MISSING, and the only one here that is new in kind:
  // it reads the PRODUCER's own output rather than a fixture.
  assert.equal(packet.stop_at, "blockers only", "a pull must carry the notch — the call log is the hook's only ground truth");

  // Fed that real packet, the hook honours the notch. `blockers only` waits for
  // a refused pull and nothing else, so a refused newest pull passes.
  const refused = { ...pullRecord(packet), ok: false };
  assert.equal(verdict([pullRecord(packet), refused], {}), "", "under `blockers only` a refused pull is the blocker the notch waits for");

  // And with nothing refused the walk can still go on, so the stop is refused.
  assert.notEqual(verdict([pullRecord(packet)], {}), "", "under `blockers only` an unrefused pull is not a blocker");
});

// THE SECOND SEAM, and it hid in the same shape as the first.
//
// THE NOTCH ARRIVED AND WAS THEN NEVER CONSULTED. A rule below it — the desk
// with nothing routed — passed every stop unconditionally. Measured on a live
// session's own lifecycle log: four stops in a row recorded
// `stop-pass nothing routed` while the notch stood at `blockers only` and the
// agent had work in hand.
//
// BOTH HALVES WERE CORRECT IN ISOLATION, again. The notch rides the pull, and
// the idle-desk rule is right wherever the person has not asked for more. The
// defect was only ever visible where the two meet, so this case drives a REAL
// session and feeds the hook that session's own pull.
/** A session walked all the way to the desk, the way a real boot leaves it.
 *  ONE PULL IS NOT ENOUGH: a fresh session stands at `start` and owes its
 *  reading, so a case asserting about the desk has to walk there first. */
async function deskedSession(notch?: string) {
  const { Session } = await import("../engine/session.ts");
  const { buildServer } = await import("../engine/tools.ts");
  const root = freshRoot();
  const s = new Session(root);
  const server = buildServer(root, s);
  await pullBoot(server, s);
  if (notch !== undefined) s.setStopAt(notch);
  const packet = (await s.pull()) as Record<string, unknown>;
  return { s, packet };
}

// THE DESK IS A STOP AT EVERY NOTCH (owner ruling 2026-08-25). The owner's
// words: "being at the front desk is a valid stop... especially after a boot,
// you just stop."
//
// THIS CASE ASSERTED THE OPPOSITE FOR ONE DAY. The notch was made to outrank
// the desk, which fixed a real defect — four stops passing mid-work — and
// overshot onto a session that had genuinely finished.
test("an idle desk passes under blockers only — the desk outranks the notch", async () => {
  const { packet } = await deskedSession("blockers only");

  // THE EXACT SHAPE THE LIVE LOG HELD: standing at the desk, nothing aimed.
  assert.ok((packet.where as string[]).includes("front_desk"), `the walk stands at the desk, got ${JSON.stringify(packet.where)}`);
  assert.equal(packet.target, "", "with nothing routed");
  assert.equal(packet.stop_at, "blockers only", "and the notch rides the pull");

  assert.equal(verdict([pullRecord(packet)], {}), "", "the desk with nothing routed is the machine's own stop");
});

test("the desk under blockers only still blocks WITH a target — a routed goal outranks the desk", async () => {
  const { packet } = await deskedSession("blockers only");
  const aimed = { ...packet, target: "iterations/i27" };
  const out = verdict([pullRecord(aimed)], {});
  assert.notEqual(out, "", "the desk is not a hiding place from a goal the person routed");
  const d = JSON.parse(out) as { decision: string; reason: string };
  assert.match(d.reason, /iterations\/i27/, "and the refusal names it");
});

// AN EMPTY TARGET MUST NOT RENDER AS A SET ONE. `aimed` was `pull === "wait"`
// alone, so a blank target printed as `A target is set ()` and the reader was
// told to take the door leading toward it. There was no such door.
//
// CAUGHT 2026-08-25 by the tooth biting its own author, who read the sentence,
// went looking for the target, and found none.
test("an idle wait away from the desk never claims a target is set", () => {
  const out = verdict([pullRecord({ pull: "wait", where: ["iterations/i27/build"], stop_at: "blockers only" })], {});
  assert.notEqual(out, "", "a wait mid-machine under this notch is not a sanctioned stop");
  const d = JSON.parse(out) as { decision: string; reason: string };
  assert.doesNotMatch(d.reason, /A target is set \(\s*\)/, "an empty target must never print as a set one");
  assert.match(d.reason, /the target is empty/, "it says what is actually true");
  assert.doesNotMatch(d.reason, /door that leads toward the target/, "and does not point at a door that cannot exist");
});

test("an idle desk still passes with no notch set — it is the machine's own stop", async () => {
  const { packet } = await deskedSession();
  assert.ok((packet.where as string[]).includes("front_desk"), `the walk stands at the desk, got ${JSON.stringify(packet.where)}`);
  assert.equal(verdict([pullRecord(packet)], {}), "", "with no notch set, the desk with nothing routed is sanctioned");
});

// THE ONE CASE THAT SPAWNS, and the only thing it is about is the WIRING.
//
// EVERY OTHER CASE ABOVE ASKS `decide` IN THIS PROCESS. That is what a decision
// is, and it needs no process. What a process still proves is the three things
// a function cannot: the payload arrives on stdin, the block lands on stdout,
// and the exit code is clean whatever was decided.
//
// ONE SPAWN, NOT TWENTY. The old file paid for a node per case, each one
// type-stripping the hook again, and under the parallel battery one of them
// occasionally exited 1 having written nothing.
test("the entrypoint reads stdin, writes the block to stdout, and always exits clean", () => {
  const blocking = craftRoot([pullRecord({ pull: "do", where: ["retro"] })]);
  const spawned = spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify({}),
    encoding: "utf8",
    env: { ...process.env, SE_HOOK_ROOT: blocking },
    windowsHide: true,
  });
  assert.equal(
    spawned.status,
    0,
    `the hook always exits clean — signal ${String(spawned.signal)}, error ${spawned.error?.message ?? "none"}, stderr ${JSON.stringify(spawned.stderr)}`,
  );
  const d = JSON.parse(spawned.stdout.trim()) as { decision: string; reason: string };
  assert.equal(d.decision, "block", "the decision reached stdout");
  assert.match(d.reason, /"do" at retro/, "and it is the same reason the function gives");

  // A PASS WRITES NOTHING AT ALL. An empty stdout is how the host reads consent.
  const passing = craftRoot([pullRecord({ pull: "wait", where: ["front_desk"] })]);
  const quiet = spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify({}),
    encoding: "utf8",
    env: { ...process.env, SE_HOOK_ROOT: passing },
    windowsHide: true,
  });
  assert.equal(quiet.status, 0);
  assert.equal(quiet.stdout.trim(), "", "a sanctioned stop is silent consent");
});

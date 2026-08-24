// THE STOP TOOTH (owner order 2026-08-09). The contract's stop rules failed
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

const HOOK = fileURLToPath(new URL("../engine/bin/se-hook-stop.ts", import.meta.url));

/** Run the hook against a crafted root, feeding the stop payload. */
function verdict(records: object[], payload: object): string {
  const root = mkdtempSync(join(tmpdir(), "se-stop-"));
  mkdirSync(join(root, ".se"), { recursive: true });
  writeFileSync(join(root, ".se", "calls.jsonl"), `${records.map((r) => JSON.stringify(r)).join("\n")}\n`, "utf8");
  const r = spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify(payload),
    encoding: "utf8",
    env: { ...process.env, SE_HOOK_ROOT: root },
    windowsHide: true,
  });
  assert.equal(r.status, 0, `the hook always exits clean — stderr: ${r.stderr}`);
  return r.stdout.trim();
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

// THE STOP-AT NOTCH DECIDES (owner design 2026-08-16, machines/stopat.md).
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
  const afterBlock = JSON.parse(verdict([refused, working], { stop_hook_active: true })) as { decision: string; reason: string };
  assert.equal(afterBlock.decision, "block");
  assert.match(afterBlock.reason, /blockers only/);
});

test("a wait WITH A TARGET blocks — an escape does not launder a stop", () => {
  // MEASURED 2026-08-14: the escape hatch lands at the front desk, the desk
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

test("a targeted wait already blocked once passes — the valve covers it too", () => {
  assert.equal(verdict([pullRecord({ pull: "wait", where: ["front_desk"], target: "iterations/i27" })], { stop_hook_active: true }), "");
});

test("a stop already blocked once passes — the valve for a blocking question", () => {
  assert.equal(verdict([pullRecord({ pull: "fill", where: ["work"] })], { stop_hook_active: true }), "");
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

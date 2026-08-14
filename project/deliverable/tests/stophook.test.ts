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
  writeFileSync(join(root, ".se", "calls.jsonl"), records.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf8");
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
  assert.equal(verdict([pullRecord({ pull: "wait", where: ["idle"], target: "   " })], {}), "");
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

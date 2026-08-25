// se-hook-stop — THE UNSANCTIONED STOP IS REFUSED MECHANICALLY.
//
// The contract has said it in prose since: a turn ends when the
// work does, a report is not a checkpoint, size is not a reason. Prose
// failed four recorded times in two days. This hook is the tooth.
//
// BOTH HOSTS RUN IT. Claude Code fires it as a Stop hook from
// .claude/settings.json. Copilot CLI fires the same script twice over:
// it reads the repository's .claude/settings.json cross-tool, and the
// repo root carries .github/hooks/se-stop.json naming the PascalCase
// "Stop" event — which selects the VS-Code-compatible payload, the same
// snake_case shape Claude sends. One script, one parser, one output:
// {"decision": "block", "reason": ...} on stdout, exit 0. Copilot ignores
// non-zero exits on agentStop, so the block MUST ride stdout JSON.
//
// WHEN A STOP IS SANCTIONED, from the engine's own ground truth (the call
// log — the hook never calls the mirror over HTTP, which would deadlock
// the session's own server):
//
// - the last pull answered "wait" AND NO TARGET IS SET — the machine's own
//   stop: idle, the desk with nothing routed, or a step above the slider;
//
//   THE TARGET HALF WAS MISSING AND AN ESCAPE WALKED STRAIGHT THROUGH THE
//   GAP (owner instruction ). The escape hatch lands at the front
//   desk, and the desk answers "wait". So the sequence was: escape for a
//   real reason, land at the desk, stop — and the tooth had nothing to
//   bite, because the last pull said "wait".
//
//   Measured that day: three stops, two of them post-escape and both
//   passed. A routed goal stood the whole time and idle was an open door
//   at weight 0.2 against a dial of 1.
//
//   A "wait" WITH A TARGET IS NOT THE MACHINE'S OWN STOP. It is an agent
//   declining to walk toward something it was pointed at, which is the
//   exact thing this hook exists to refuse;
// - no pull is on record — the engine never ran here;
// - stop_hook_active is set — this stop was already blocked once. The
//   valve for a question that genuinely BLOCKS: ask it in one line, stop
//   again, and the tooth lets it through. It bites once per stop.
//
// Everything else — do, read, fill, choose — is a walk standing mid-work,
// and the stop is refused with the reason on it.
//
// A hook must never break the turn, so every failure is swallowed and the
// exit is always clean.

import { closeSync, existsSync, fstatSync, openSync, readdirSync, readFileSync, readSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { recordLifecycle } from "../lifecycle.ts";

// bin -> engine -> deliverable -> the project root. THREE hops, not four.
//
// IT CLIMBED FOUR AND LANDED OUTSIDE THE REPOSITORY. The layout once carried a
// `product/` folder between the root and `deliverable/`, and the extra hop
// survived its removal. The root then resolved to the repository's PARENT,
// where no call log exists.
//
// THE FAILURE WAS SILENT AND TOTAL. No log means no pull on record, which is
// one of the three sanctioned stops, so the hook allowed every stop it was
// built to refuse. A tooth aimed at an empty folder bites nothing, and the
// swallow-everything exit made a broken check look like a permitted stop.
//
// The env override is the test seam — the suite points the hook at a crafted log.
// READ PER CALL, NOT AT LOAD. A check asks the decision about several crafted
// roots inside one process, and a constant captured at import time would pin
// every one of them to whichever root happened to be set first.
function hookRoot(): string {
  return process.env.SE_HOOK_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
}

// The newest pull can carry a whole document, so the tail window is wide.
const TAIL_BYTES = 4 * 1024 * 1024;

function tailOf(path: string): string {
  const fd = openSync(path, "r");
  try {
    const size = fstatSync(fd).size;
    const start = Math.max(0, size - TAIL_BYTES);
    const buf = Buffer.alloc(size - start);
    readSync(fd, buf, 0, buf.length, start);
    return buf.toString("utf8");
  } finally {
    closeSync(fd);
  }
}

/** The log tail, read once. Two readers walk it and the window is megabytes. */
let cachedLines: string[] | undefined;

function logLines(): string[] {
  cachedLines ??= tailOf(join(hookRoot(), ".se", "calls.jsonl")).split("\n");
  return cachedLines;
}

/** A BACKGROUND RUN STILL GOING, named for the refusal. Undefined when none is.
 *
 *  THE HOOK CANNOT ASK THE SERVER — calling the session's own mirror over HTTP
 *  deadlocks it. So it reads what a run WRITES: the job records under
 *  .se/test-jobs, one file per run, whose last line gains an `ended` stamp when
 *  the verdict lands.
 *
 *  STALE RECORDS ARE NOT NEWS. A run older than the window belongs to a session
 *  that is gone, and blocking on it would wedge every later turn. */
const RUNNING_WINDOW_MS = 30 * 60 * 1000;

function runningWork(): string | undefined {
  const dir = join(hookRoot(), ".se", "test-jobs");
  if (!existsSync(dir)) return undefined;
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".jsonl")) continue;
    try {
      const lines = readFileSync(join(dir, name), "utf8").trimEnd().split("\n");
      const last = JSON.parse(lines[lines.length - 1]) as { started?: number; ended?: number };
      if (typeof last.started !== "number" || last.ended !== undefined) continue;
      if (Date.now() - last.started > RUNNING_WINDOW_MS) continue;
      const secs = Math.round((Date.now() - last.started) / 1000);
      return `a test run has been going ${secs}s and its verdict is not in yet`;
    } catch {
      // A torn or half-written record is not evidence that anything is running.
    }
  }
  return undefined;
}

/** Has this stop already been blocked once? Both hosts spell the flag their
 *  own way, and either spelling means the same thing. */
function bitesOnce(payload: string): boolean {
  const p = JSON.parse(payload || "{}") as { stop_hook_active?: boolean; stopHookActive?: boolean };
  return p.stop_hook_active === true || p.stopHookActive === true;
}

/** EVERY DECISION LEAVES A LINE, not only the refusals.
 *
 *  A BLOCK WAS RECORDED AND A PASS WAS NOT, so a hook that permitted a stop and
 *  a hook that broke on the way to deciding looked identical from outside. That
 *  is not a worry, it is this file's own history: the root once climbed one
 *  directory too far, found no call log, and permitted every stop it exists to
 *  refuse. Nothing was written either way, so nobody could see it.
 *
 *  The record is the answer to "why did the hook not bite", asked afterwards. */
function pass(why: string, detail = ""): Verdict {
  try {
    recordLifecycle(hookRoot(), "stop-pass", detail === "" ? why : `${why} — ${detail}`);
  } catch {
    // a hook must never break the turn
  }
  return { block: false };
}

/** WHAT THE HOOK DECIDED. Blocking carries the reason the agent will read.
 *
 *  IT IS A VALUE, NOT AN EXIT. The decision used to call `process.exit` from
 *  wherever it landed, so the ONLY way to ask what the hook thinks was to spawn
 *  it and read its exit code.
 *
 *  WHAT THAT COST. Twenty cases, twenty node processes, each type-stripping
 *  this file again — and under the parallel battery one of them occasionally
 *  exited 1 having written nothing at all, which no amount of reading the hook
 *  could explain. A red that vanishes on a re-run teaches people to re-run. */
export interface Verdict {
  block: boolean;
  reason?: string;
}

/** IS ANYBODY THERE TO READ A CLAIM? Absent, the answer is yes: an attended
 *  laptop is the ordinary case, and a missing file must not silently turn a
 *  session into an unattended one. */
function sessionMode(): string {
  try {
    const raw = readFileSync(join(hookRoot(), ".se", "settings.json"), "utf8");
    const m = (JSON.parse(raw) as { mode?: unknown }).mode;
    return typeof m === "string" && m !== "" ? m : "attended";
  } catch {
    return "attended";
  }
}

/** THE BITES-ONCE VALVE, and who it is for.
 *
 *  A STOP ALREADY BLOCKED ONCE PASSES. This hook's own refusal ends by inviting
 *  the agent to name which sanctioned stop it is and stop again, so the second
 *  attempt IS the claim. The invitation is a lie if that attempt cannot get
 *  through.
 *
 *  UNATTENDED IS THE EXCEPTION, AND ONLY AT BLOCKERS ONLY. There nobody reads
 *  the claim, so releasing on it would let a run end itself for a reason no
 *  human ever sees. That notch exists for exactly those runs.
 *
 *  BOTH HALVES HAVE BITTEN. Making the notch the whole test leaves an attended
 *  session unable to present a plan and stop, since the tooth then bites every
 *  attempt. Ignoring the notch lets an unattended run end a turn it should have
 *  kept walking. Attendance is what actually separates the two. */
function bypassesStop(payload: string, notch: string, mode: string): boolean {
  if (!bitesOnce(payload)) return false;
  return !(mode !== "attended" && notch === "blockers only");
}

/** Refuse the stop while a run is going, and say what to do instead. True when
 *  it wrote the refusal, so the caller exits without deciding anything else. */
function blockedByRunningWork(): boolean {
  const busy = runningWork();
  if (busy === undefined) return false;
  const reason =
    `[se] ${busy}. Do not end the turn on it. The run reports itself on the \`work\` account of your next lane call — ` +
    "how far along, how many failed, and the first failures by name. Read it there, act on the verdict, then stop.";
  process.stdout.write(`${JSON.stringify({ decision: "block", reason })}\n`);
  try {
    recordLifecycle(hookRoot(), "stop-block", `a test run is still going: ${busy}`);
  } catch {
    // The block is already written, so the decision stands either way. Guarded
    // like the one in pass(), so a throw here cannot relabel a block an error.
  }
  return true;
}

/** EVERY DOOR THAT AIMS, and there are two.
 *
 *  `se_aim` is the AGENT's. `mirror_target` and `mirror_target/selected` are the
 *  PERSON's, and the person is the hand the contract says does the aiming. A
 *  first fix taught the hook only the agent's door, which left the more
 *  important one open and made the blindness asymmetric instead of removing it. */
const AIMING_TOOLS = (tool: string): boolean => tool === "se_aim" || tool.startsWith("mirror_target");

/** A TARGET SET BY AIMING SINCE THE NEWEST PULL. Undefined when nobody aimed;
 *  the EMPTY STRING when the newest aim CLEARED the target.
 *
 *  THE HOOK READS PULLS AND AIMING WRITES NONE. Aiming with `go: false` records
 *  a target and walks nothing, and the mirror's route does not walk at all. The
 *  hook then read a stale pull, saw no target on it, and permitted the stop
 *  while a routed goal stood.
 *
 *  IT IS THE SAME HOLE THE ESCAPE HATCH OPENED, which this file's header already
 *  describes: a newer act moved the walk and the tooth was still reading the
 *  older record.
 *
 *  THE SCAN STOPS AT THE FIRST SUCCESSFUL PULL, because a pull carries its own
 *  target and is then the newer news. A REFUSED pull does not stop it: a refusal
 *  did not move the walk, so an aim before it still stands. `lastPull()` anchors
 *  on the same record, so the two cannot disagree about which pull is the
 *  reference.
 *
 *  AN EMPTY TARGET IS RETURNED RATHER THAN SKIPPED. Clearing the target is an
 *  act, and skipping it would let an older aim outlive the clear that cancelled
 *  it. */
function aimedSinceLastPull(): string | undefined {
  const lines = logLines();
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line === "") continue;
    let rec: { tool?: string; ok?: boolean; response?: unknown };
    try {
      rec = JSON.parse(line) as { tool?: string; ok?: boolean; response?: unknown };
    } catch {
      continue;
    }
    if (rec.tool === "se_pull" && rec.ok === true) return undefined;
    if (rec.tool === undefined || !AIMING_TOOLS(rec.tool) || rec.ok !== true) continue;
    const body = typeof rec.response === "string" ? rec.response : JSON.stringify(rec.response ?? {});
    // READ BY PATTERN, NOT BY PARSING, and it is not a shortcut. Every aiming
    // answer in the log is stored CUT — 44 of 44 measured, none parseable —
    // because an aim carries its whole drawn route and the log caps a response.
    //
    // THE FIELD SURVIVES THE CUT because it sits first in the answer, which is
    // the same reason the truncated-pull reader below works.
    // see dsp-boot-and-power.md#a-long-response-is-stored-truncated
    return /"target"\s*:\s*"([^"]*)"/.exec(body)?.[1]?.trim() ?? "";
  }
  return undefined;
}

interface LastPull {
  pull?: string;
  where?: unknown;
  target?: unknown;
  stop_at?: unknown;
  /** False when the newest pull was REFUSED. Under `blockers only` that is
   *  the one thing that sanctions a stop. */
  ok?: boolean;
}

/** The newest se_pull's answer, read from the log tail. */
function lastPull(): LastPull | undefined {
  const lines = logLines();
  let refused = false;
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line === "") continue;
    try {
      const rec = JSON.parse(line) as { tool?: string; ok?: boolean; response?: unknown };
      if (rec.tool !== "se_pull") continue;
      if (rec.ok !== true) {
        // A REFUSED PULL IS STILL THE NEWEST WORD ABOUT THE WALK. It says the
        // walk could not move, which is exactly what `blockers only` waits for.
        refused = true;
        continue;
      }
      if (typeof rec.response !== "string") return { ...((rec.response ?? {}) as LastPull), ok: !refused };
      try {
        return { ...(JSON.parse(rec.response) as LastPull), ok: !refused };
      } catch {
        // see dsp-boot-and-power.md#a-long-response-is-stored-truncated
        const pull = /"pull"\s*:\s*"([a-z]+)"/.exec(rec.response)?.[1];
        if (pull === undefined) continue;
        const target = /"target"\s*:\s*"([^"]*)"/.exec(rec.response)?.[1];
        const where = /"where"\s*:\s*\[([^\]]*)\]/.exec(rec.response)?.[1];
        const stopAt = /"stop_at"\s*:\s*"([^"]*)"/.exec(rec.response)?.[1];
        return {
          pull,
          target,
          stop_at: stopAt,
          ok: !refused,
          where: where === undefined ? undefined : where.split(",").map((s) => s.trim().replace(/^"|"$/g, "")),
        };
      }
    } catch {
      // the first line of the tail may be a torn record; a broken line is skipped
    }
  }
  return undefined;
}

/** WHAT THE NOTCH ITSELF SANCTIONS, as [why, detail], or undefined when this
 *  notch has nothing to say about this stop.
 *
 *  SPLIT OUT OF THE HANDLER so the decision reads as three named cases rather
 *  than three more branches in an already long function. */
/** IS THIS THE MACHINE'S OWN IDLE STOP?
 *
 *  THE DESK WITH NOTHING ROUTED IS SANCTIONED in the ordinary case. There is
 *  genuinely nowhere to walk, and the desk's own guidance says to stay there.
 *  see dsp-boot-and-power.md#the-desk-with-nothing-routed-is-the-machines-own
 *
 *  `blockers only` OUTRANKS IT, and it is the only notch that does. That notch
 *  means one thing: come back when the walk CANNOT GO ON. An idle desk is not a
 *  blocker, it is the absence of one.
 *
 *  MEASURED ON A LIVE SESSION'S OWN LOG: four stops in a row passed as "nothing
 *  routed" while the notch stood at `blockers only` and the agent had work in
 *  hand. The notch was read correctly and then never consulted, because this
 *  rule sat below it and passed unconditionally. */
function nothingRouted(notch: string, target: string, pull: string, at: string): boolean {
  if (notch === "blockers only") return false;
  if (target !== "") return false;
  return pull === "wait" || at.split(",").some((w) => w.trim() === "front_desk");
}

function notchSanction(notch: string, last: LastPull, at: string): [string, string] | undefined {
  // STATE END: the ENGINE holds every transition and refuses to move. The
  // agent stopping is then not a failure of nerve, it is the machine's own
  // stop — exactly what this hook exists to let through.
  if (notch === "state end") return ["notch: state end", "the engine holds every transition"];
  // BLOCKERS ONLY: nothing brings the person back until the walk cannot go on.
  // The newest pull being REFUSED is that, and it is the only thing that is —
  // an unattended run is what this notch is for.
  if (notch === "blockers only" && last.ok === false) return ["notch: blockers only", "the newest pull was refused"];
  // BLESS: run to where a thumb is owed anyway, and stop there. A gate is the
  // only place that is true, and the walk's own position names it.
  if (notch === "bless" && /(^|\/)gate[-_]/.test(at)) return ["notch: bless", `a gate is owed at ${at}`];
  return undefined;
}

/** THE WHOLE DECISION, from the payload and whatever the root holds.
 *
 *  EXPORTED SO A CHECK CAN ASK IT DIRECTLY, in this process, with no spawn in
 *  the way. Point `SE_HOOK_ROOT` at a crafted log and call it. */
export function decide(payload: string): Verdict {
  // THE CALL LOG IS READ ONCE PER DECISION, not once per process. A second ask
  // about a second root must not be served the first root's log.
  cachedLines = undefined;
  {
    // A BACKGROUND RUN STILL GOING OUTRANKS EVERY SANCTIONED STOP BELOW. Its
    // verdict is seconds away and nobody reads a job nobody asked about, so a
    // turn that ends first throws the answer away.
    //
    // A RUN THAT NEVER FINISHES COSTS ONE WINDOW, NOT THE SESSION. Only a run
    // started inside the window counts as going, so a hung one stops blocking
    // by itself.
    if (blockedByRunningWork()) return { block: false };
    const last = lastPull() ?? {};
    const pull = last.pull;
    if (pull === undefined) return pass("no pull on record", "the engine never ran here");
    // see dsp-boot-and-power.md#the-notch-decides
    const notch = typeof last.stop_at === "string" ? last.stop_at.trim().toLowerCase() : "";
    // The valve may release a question about a standing blocker. It cannot
    // release a newer runnable pull under blockers only.
    if (bypassesStop(payload, notch, sessionMode())) return pass("bites once per stop", "this stop was already blocked once");
    const at = Array.isArray(last.where) ? (last.where as unknown[]).map(String).join(", ") : String(last.where ?? "");
    const sanctioned = notchSanction(notch, last, at);
    if (sanctioned !== undefined) return pass(sanctioned[0], sanctioned[1]);
    // A TARGET IS A STANDING INSTRUCTION FROM THE PERSON. While one is set,
    // the walk has somewhere to be, and "nothing to route" is false whatever
    // the desk answered.
    // AN AIM SINCE THE LAST PULL WINS. It is the newer statement of where the
    // walk is meant to be going.
    const target = aimedSinceLastPull() ?? (typeof last.target === "string" ? last.target.trim() : "");
    if (nothingRouted(notch, target, pull, at)) {
      return pass("nothing routed", `no target, and the pull answered "${pull}"${at === "" ? "" : ` at ${at}`}`);
    }
    const where = at;
    const aimed = pull === "wait";
    // WHAT THE NOTCH IS ASKING FOR, said in the refusal rather than left for
    // the reader to infer from a setting they may not have looked at.
    const NOTCHED: Record<string, string> = {
      bless: "[se] stop @ bless: you run until a BLESS is owed, and no gate is owed here. ",
      "blockers only": "[se] stop @ blockers only: you stop only when the walk CANNOT go on, and the last pull was not refused. ",
    };
    const prefix = NOTCHED[notch] ?? "";
    // see dsp-boot-and-power.md#the-only-stops-that-are-sanctioned
    const SANCTIONED =
      "FOUR STOPS ARE SANCTIONED AND NOTHING ELSE IS. " +
      "(1) A GATE THE PERSON OWNS — gate-implementation is theirs to bless; the rest are yours at this dial. " +
      "(2) A DECISION ONLY THEY CAN MAKE — no answer you could pick would let the walk continue honestly. " +
      "(3) SOMETHING BROKE and no remedy gets you past it. " +
      "(4) THE RETRO'S FIELD-FEEDBACK QUESTION — ask it, then STOP and wait. It is the owner's own report from outside the machine, " +
      "nothing else in the retro can stand in for it, and walking on past it has quietly skipped it for several retros running. " +
      "(5) A PLAN, BEFORE IT IS ACTED ON. PLANNING WAITS FOR THE OWNER'S GO; EXECUTION DOES NOT (owner ruling 2026-08-14). " +
      "Seeding a record, splitting or merging one, deciding which iteration a finding belongs to, choosing scope — all planning. Present the list and WAIT. " +
      "Once the plan has the go, execute the whole of it without asking again. " +
      "Being unsure is not one. Having a lot left is not one. Having just finished a piece is not one. " +
      "Stopping for one of the four? Say which, in one line, and stop again — this tooth bites once per stop.";
    // The veto is now observable after the fact. Without a line here, a turn
    // the hook ended looks exactly like one the transport ended.
    try {
      recordLifecycle(hookRoot(), "stop-block", where === "" ? pull : `${pull} at ${where}`);
    } catch {
      // a hook must never break the turn
    }
    return {
      block: true,
      reason:
        prefix +
        (aimed
          ? `[se] A target is set (${target}) and the walk is not on it` +
            (where !== "" ? `, standing at ${where}` : "") +
            '. The pull answered "wait" because nothing routed FROM HERE, which is not the same as nothing to do. ' +
            "Take the door that leads toward the target and keep walking. " +
            SANCTIONED
          : `[se] The walk stands mid-work: the last pull answered "${pull}"` +
            (where !== "" ? ` at ${where}` : "") +
            ". A report is not a checkpoint and size is not a reason — call se_pull and keep walking. " +
            SANCTIONED),
    };
  }
}

// THE ENTRYPOINT, and the only place that touches a stream or an exit code.
// Everything above is a question with an answer.
//
// ONLY WHEN RUN AS THE PROGRAM. A check imports this file to ask `decide`, and
// wiring stdin there would leave a listener holding the runner's own input
// open — a test process that finishes its cases and never exits.
if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let raw = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (c: string) => {
    raw += c;
  });
  process.stdin.on("end", () => {
    try {
      const verdict = decide(raw);
      if (verdict.block) process.stdout.write(JSON.stringify({ decision: "block", reason: verdict.reason ?? "" }));
    } catch (err) {
      // A HOOK MUST NEVER BREAK THE TURN, so the failure is swallowed — but it
      // is no longer silent. A swallowed throw permits the stop, which is the
      // exact shape of the root-path defect this file carries a scar from.
      try {
        recordLifecycle(hookRoot(), "stop-error", String(err).slice(0, 300));
      } catch {
        // nothing left to try
      }
    }
    process.exit(0);
  });
}

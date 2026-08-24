// THE SHELL AND THE SUITE: the screenshot, the shell run, the battery and the
// git verb — every tool that starts something outside this process.
//
// Split out of tools.ts. A run is a child process with a job id, and the test
// job store here is what lets a verdict outlive the call that asked for it.
//
// see dsp-lane-door.md#the-verbs-are-grouped-by-what-they-touch

import { spawn } from "node:child_process";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { availableParallelism } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { hostCapState, recordHostCap } from "./bound.ts";
import { CallLog, UNREPORTED } from "./calllog.ts";
import { BATTERY_QUESTION, decideScope, laneSummary, laneVerdict, parseTap, streakNudge, testRecord } from "./discipline.ts";
import { CLAUSES, Rejection } from "./errors.ts";
import { gitLane } from "./gitlane.ts";
import { capMiddle } from "./jsonio.ts";
import type { ToolDef } from "./mcp.ts";
import { resolveInRoot, seDir } from "./paths.ts";
import { type MirrorState, renderMirror } from "./render.ts";
import { readRigorMatrix } from "./rigor-matrix.ts";
import {
  jobAcknowledge,
  jobAcknowledgeSettled,
  jobDone,
  jobRoster,
  jobStatus,
  jobStop,
  noteModel,
  noteProgress,
  noteRole,
  noteStarted,
  openOperation,
  retireOtherMilestones,
  runBackground,
  runToCompletion,
  settleOperation,
  startJob,
} from "./run.ts";
import { shoot } from "./shoot.ts";
import { TIMINGS_DIR_ENV, testConcurrency, testReporterArgs, timedSince, timingReport } from "./testreporters.ts";
import type { ReadingHook } from "./tools-file.ts";

const BIOME_BIN = fileURLToPath(new URL("../node_modules/@biomejs/biome/bin/biome", import.meta.url));

/** The last battery's measured wall and file count, in ONE read. The wall is
 *  phrased for a caller sizing a wait; the count is what a progress figure
 *  divides into. An expectation is measured or absent — never guessed. */
function batteryRecord(se: string): { pace: string; total?: number } {
  try {
    const rec = JSON.parse(readFileSync(join(se, "test-last-run.json"), "utf8")) as {
      wall_ms?: number;
      files?: unknown[];
    };
    const total = Array.isArray(rec.files) ? { total: rec.files.length } : {};
    if (typeof rec.wall_ms === "number")
      return {
        pace: ` The last battery took ${Math.round(rec.wall_ms / 1000)}s wall — expect the verdict on that scale.`,
        ...total,
      };
    return { pace: " The last battery on record has no wall clock; the next completed run records one.", ...total };
  } catch {
    return { pace: " No earlier battery is on record to size the wait." };
  }
}
/** HOW MANY STEPS THE WORK HAS, and a refusal when nobody says.
 *
 *  THE INTERFACE FORCES THE COUNT because a task that will not say how big it
 *  is cannot be projected, and a surface with nothing to show invites the
 *  reader to stop looking. An estimate revised upward later is honest; silence
 *  is not. */
function stepsAsked(args: Record<string, unknown>, verb: string): number {
  // A HOST MAY SEND THE COUNT AS TEXT. Some harnesses serialise a numeric
  // argument as a string, and this check is the only place that reads one
  // strictly, so the agent verb refused a count the shell verb accepted.
  // A string that IS a number is an answer; anything else still refuses.
  const raw = args.steps;
  const n = typeof raw === "string" && raw.trim() !== "" ? Number(raw) : raw;
  if (typeof n === "number" && Number.isFinite(n) && n > 0) return Math.round(n);
  throw new Rejection({
    clause: CLAUSES.REQUIRED_ARGS,
    expected: "steps: how many steps this work has, as a whole number above zero",
    got: n === undefined ? "no steps" : String(n),
    remedy: {
      tool: "se_run",
      args: { [verb]: "<what it is>", steps: 5 },
      note: "a guess is fine and it may rise later: report with se_run {job, did, steps?}",
    },
    source: "engine/tools-run.ts stepsAsked",
  });
}

/** WHICH MODEL ANSWERS FOR THIS HAND, and a refusal when nobody says.
 *
 *  THE RETRO CANNOT WEIGH SPAWNING WITHOUT IT. The question it must answer is
 *  whether putting work on a second hand paid for itself, and that is a
 *  question about tokens, which is a question about which model ran.
 *
 *  A LABEL IS NOT A RECORD. Naming the model inside the description works only
 *  while somebody remembers, and the first hand spawned under this roster was
 *  registered without one. */
function modelAsked(args: Record<string, unknown>): string {
  const m = args.model;
  if (typeof m === "string" && m.trim() !== "") return m.trim();
  throw new Rejection({
    clause: CLAUSES.REQUIRED_ARGS,
    expected: "model: which model answers for this hand, so the retro can weigh what the spawn cost",
    got: m === undefined ? "no model" : String(m),
    remedy: {
      tool: "se_run",
      args: { agent: "<what it is for>", steps: 5, model: "sonnet" },
      note: "a shell run needs none and records as script; only a spawned hand is asked",
    },
    source: "engine/tools-run.ts modelAsked",
  });
}

/** WHERE A SPAWNED JOB SITS, so it can be stamped without the caller
 *  declaring a state — a declared state is a claim that can be wrong. The
 *  milestone follows from the rigor matrix row whose name matches the
 *  state's last segment — the same join the matrix uses everywhere else. */
function agentPosition(root: string, positionOf?: () => string): { state?: string; milestone?: string } {
  const state = positionOf?.();
  if (state === undefined) return {};
  const milestone = readRigorMatrix(root).rows.find((r) => r.name === state.split("/").pop())?.milestone;
  return { state, ...(milestone === undefined ? {} : { milestone }) };
}

/** WHICH HAND IS BEING REGISTERED — walker, reviewer or researcher.
 *
 *  ONLY A WALKER COUNTS AGAINST THE RECORD'S CEILING (
 *  ). A reviewer buys separation and a researcher buys reading
 *  nobody has done; neither competes for the walking slot, and neither should
 *  be able to strand the next phase by filling it.
 *
 *  IT DEFAULTS TO `walker`, which is the conservative direction: an unnamed
 *  hand counts, so a forgotten role can never quietly raise the ceiling. */
function roleAsked(args: Record<string, unknown>): string {
  const raw = args.role;
  if (raw === "walker" || raw === "reviewer" || raw === "researcher") return raw;
  return "walker";
}

/** The job side of se_run: list, stop, wait or status. Undefined when the
 *  call names no job — the command side handles it. */
function jobArm(args: Record<string, unknown>, root: string, positionOf?: () => string): unknown {
  if (args.jobs === true) return jobRoster(root);
  // A SUBAGENT IS WORK OUT OF SIGHT, so it belongs on the same list. Nothing
  // here can observe one, so the agent that spawned it registers it and closes
  // it. An unclosed one shows as running, which is the honest answer.
  if (typeof args.agent === "string" && args.agent !== "") {
    const id = `agent-${Date.now().toString(36)}`;
    const model = modelAsked(args);
    const role = roleAsked(args);
    const at = agentPosition(root, positionOf);
    // ONE WALKER PER MILESTONE, AND THE HANDOVER IS VISIBLE. Registering a hand
    // for a new milestone retires the hands of every other one, so the table
    // shows the M1 walker going as the M2 walker arrives rather than both
    // standing for ever.
    //
    // THIS IS THE ONE MOMENT THE ENGINE RELIABLY LEARNS the previous milestone
    // is over. It cannot see a spawned hand die — the harness owns that process
    // — so a row otherwise reads `running` long after the agent is gone.
    const retired = at.milestone === undefined ? [] : retireOtherMilestones(at.milestone);
    openOperation({
      id,
      kind: "agent",
      command: args.agent,
      root,
      steps: stepsAsked(args, "agent"),
      ...at,
    });
    noteModel(id, model, root);
    noteRole(id, role, root);
    noteStarted(id, root);
    return {
      agent: id,
      ...(retired.length === 0 ? {} : { retired }),
      // THIS USED TO POINT A SPAWNED HAND AT se_run TO REPORT PROGRESS, and
      // se_run IS LEGAL ONLY IN THE SPAWN STATE — nowhere the hand itself
      // ever stands. The instruction refused on the hand's first attempt,
      // silently: it read like working guidance because nothing checked
      // whether the tool it named was one the hand could actually call.
      // The real channel is the update system, which rides every lane call
      // a hand already makes; its opening plan sets the job's length.
      note: 'report through update: {op: "plan", items: [...]} on your first lane call, then update: {op: "done", node, brief} as each item resolves — the plan\'s item count sets this job\'s length. Close with se_run {agent_done: "<id>"}',
    };
  }
  // SAY HOW FAR ALONG, and revise the total where the work turned out bigger.
  if (typeof args.job === "string" && typeof args.did === "number") {
    const total = typeof args.steps === "number" ? args.steps : undefined;
    if (!noteProgress(args.job, args.did, total, root)) {
      throw new Rejection({
        clause: CLAUSES.JOB_UNKNOWN,
        expected: "a job this session started",
        got: String(args.job),
        remedy: { tool: "se_run", args: { jobs: true }, note: "the ids are here" },
        source: "engine/run.ts noteProgress",
      });
    }
    return { job: args.job, steps_done: args.did, ...(total === undefined ? {} : { steps_total: total }) };
  }
  if (typeof args.agent_done === "string" && args.agent_done !== "") {
    settleOperation(String(args.agent_done), args.ok !== false, root);
    return { closed: args.agent_done };
  }
  // ACKNOWLEDGING DROPS SETTLED WORK FROM THE RIDE. `ack: true` clears
  // everything settled; a list clears exactly those. A running job is named
  // back rather than hidden, because its outcome is not in yet.
  // `true` MAY ARRIVE AS THE STRING "true". This argument takes several shapes,
  // so its schema declares no type, and an untyped property is handed over as
  // the transport found it. MEASURED: ack: true acknowledged a job
  // named "true" and cleared nothing.
  if (args.ack === true || args.ack === "true" || args.ack === "all") {
    // A COUNT, NOT THE LIST. Clearing a long session acknowledged 200 jobs and
    // named every one of them, which is the noise this whole verb exists to
    // remove. An explicit list still gets its ids back, because the caller
    // named them and is owed the answer.
    const done = jobAcknowledgeSettled(root);
    return {
      acknowledged: done.length,
      note: "settled work no longer rides answers; each record stays reachable by its id with se_run {job}",
    };
  }
  if (Array.isArray(args.ack)) return jobAcknowledge(args.ack.map(String), root);
  if (typeof args.ack === "string" && args.ack !== "") return jobAcknowledge([args.ack], root);
  if (args.job === undefined) return undefined;
  if (args.stop === true) return jobStop(String(args.job), root);
  return jobStatus(String(args.job), root);
}

/** A TRUNCATING PIPE CUTS BEFORE THE ENGINE SEES. What Select-Object
 *  -First dropped exists NOWHERE — not here, not in the log. The note
 *  rides at the moment of risk; a marker after the fact costs nothing
 *  and once turned "(425.501917ms)" read from a shaped slice into a
 *  confidently wrong 425 SECONDS. */
function annotateRun(res: unknown, laneWarning: unknown): unknown {
  if (laneWarning === undefined) return res;
  return { ...(res as unknown as Record<string, unknown>), lane_warning: laneWarning };
}

/** see dsp-lane-door.md#a-shape-that-cuts-before-the-engine-sees */
const SHAPED =
  /select-object\s+-(first|last|skip)|(^|[;|&(\s])(head|tail)\s+-|\bcut\s+-c|\bmeasure-object\b|\|\s*(select-string|sls|findstr|grep|rg)\b/i;

/** WHICH LANE VERB WAS ACTUALLY WANTED. The pipe is reached for when the raw
 *  output is expected to be long, and every long thing the lane produces has a
 *  verb that answers it structured or by reference. */
function shapedRemedy(command: string): { tool: string; args: Record<string, unknown>; note: string } {
  if (/--test\b|\bnpm\b.*\btest\b|\bjest\b|\bvitest\b/i.test(command)) {
    return {
      tool: "se_test",
      // NO SCOPE ARGUMENT, and that is ruled. You say what
      // you want to know; the engine reads what changed and decides whether
      // that is the battery, a named set, or nothing at all.
      args: { question: "<what this run answers>" },
      note: "se_test answers STRUCTURED — counts, only the failures' detail, and `decided` saying what ran and why. Nothing to shape, and nothing lost.",
    };
  }
  if (/\b(rg|ripgrep|grep|findstr|select-string)\b/i.test(command)) {
    return {
      tool: "se_file_search",
      args: { query: "<pattern>", intent: "<why you are looking>", limit: 30 },
      note: "se_file_search windows with `limit` and says `truncated` when it did — a cut the reader can SEE, which a pipe never gives.",
    };
  }
  if (/\b(cat|type|get-content|gc)\b/i.test(command)) {
    return {
      tool: "se_file_read",
      args: { path: "<path>", offset: 1, limit: 200 },
      note: "the reader pages by line with offset/limit, and an oversize whole-file read is refused rather than silently truncated.",
    };
  }
  return {
    tool: "se_run",
    args: { command: "<the same command, unshaped>" },
    note: "run it whole — the lane captures the FULL output under the call's ref, and se_log_query {ref} serves it back a page at a time. Shaping is what makes it unrecoverable.",
  };
}
interface TestJobEntry {
  done: Promise<void>;
  verdict?: Record<string, unknown>;
  started: number;
  /** When the verdict landed. Without it a finished run reports the time since
   *  it started rather than how long it took. */
  ended?: number;
  pace: string;
  /** The count this run's progress divides into, from the last battery on
   *  record. see dsp-the-work-account.md#interface */
  total?: number;
}
interface PersistedTestJob {
  id: string;
  started: number;
  ended?: number;
  pace: string;
  total?: number;
  verdict?: Record<string, unknown>;
}
const testVerdicts = new Map<string, TestJobEntry>();
let testSeq = 0;

function testJobPath(se: string, id: string): string {
  return join(se, "test-jobs", `${id}.jsonl`);
}

/** THE LAST RUN'S WHOLE RESULT, at one stable path.
 *
 *  THE ACCOUNT CARRIES A COUNT AND NOTHING ELSE, because it rides every answer
 *  and the answer has a byte bound. The names behind that count have to be
 *  somewhere a reader can follow, and one file that always holds the newest
 *  run is the cheapest somewhere there is.
 *
 *  IT IS MACHINE-LOCAL and overwritten by the next run. The call log keeps
 *  every verdict for good; this is the one wanted almost every time. */
function storeLastResults(se: string, result: Record<string, unknown>): void {
  try {
    mkdirSync(se, { recursive: true });
    writeFileSync(join(se, "test-last.json"), JSON.stringify(result, null, 1), "utf8");
  } catch {
    // Bookkeeping never kills a run.
  }
}

function persistTestJob(se: string, id: string, entry: TestJobEntry): void {
  mkdirSync(join(se, "test-jobs"), { recursive: true });
  const record: PersistedTestJob = {
    id,
    started: entry.started,
    ...(entry.ended === undefined ? {} : { ended: entry.ended }),
    pace: entry.pace,
    ...(entry.total === undefined ? {} : { total: entry.total }),
    ...(entry.verdict === undefined ? {} : { verdict: entry.verdict }),
  };
  appendFileSync(testJobPath(se, id), `${JSON.stringify(record)}\n`, "utf8");
}

// THE STATUS READER IS GONE, and nothing replaced it in this file. A running
// battery reports itself through the work account on every lane call, which is
// where every other background job already reported. See run.ts batteryFound.

// see dsp-write-guard.md#scopedfiles-is-gone

/** THE QUESTION A SCOPED RUN ANSWERS (req-test-run-carries-its-question).
 *  The scope already says which tests ran. Only this says why, and without
 *  it a later reader cannot tell a real question from a reassurance run. */
function scopedQuestion(questionArg: unknown): string {
  const question = typeof questionArg === "string" ? questionArg.trim() : "";
  if (question !== "") return question;
  throw new Rejection({
    clause: CLAUSES.TEST_NO_QUESTION,
    expected: "question: one line saying what this run answers",
    got: "a scoped run with no question",
    remedy: {
      tool: "se_test",
      args: { question: "did <this change> break <that behaviour>?" },
      note: "the battery needs none — its question is fixed. Anything narrower is yours, so say what you wanted to learn. You do not name the scope; the engine reads what changed.",
    },
    source: "engine/tools.ts se_test",
  });
}

// THE BEAT FILE IS READ BY THE WORK ACCOUNT NOW, in run.ts batteryFound. It
// was read here too, for a status verb that no longer exists.

export function runTools(
  rootOf: (rel?: string) => string,
  projectRoot: string,
  _reading?: ReadingHook,
  mirror?: () => MirrorState,
  /** WHERE THE WALK STANDS, for stamping a spawned job's milestone at
   *  registration. The engine reads its own position; a caller-declared
   *  state would be a claim that can be wrong. */
  positionOf?: () => string,
): ToolDef[] {
  return [
    {
      name: "se_shoot",
      title: "se.shoot",
      description:
        "LOOK AT THE MIRROR. Renders the surface to an image and hands back the PICTURE, so a change to a pane can be judged by seeing it rather than by reading its HTML. Shoot the whole page, or one widget with widget: 'machine' | 'details' | 'log' | 'terminal'. view: names a machine to draw instead of the one being walked. Nothing is served over HTTP and no browser window opens.",
      inputSchema: {
        type: "object",
        properties: {
          widget: { type: "string", description: "machine | details | log | terminal — omit for the whole page" },
          view: { type: "string", description: "draw this machine instead of the one the walk stands in" },
          width: { type: "number", description: "viewport width, default 1600" },
          height: { type: "number", description: "viewport height, default 1000" },
        },
      },
      handler: (args) => {
        const w = args.widget === undefined ? undefined : (String(args.widget) as "machine" | "details" | "log" | "terminal" | "table");
        if (mirror === undefined) {
          throw new Rejection({
            clause: CLAUSES.CONDITION_UNMET,
            expected: "a server built with a mirror surface",
            got: "no mirror on this build",
            remedy: { tool: "se_pull", args: {}, note: "the full engine serves the mirror; this build cannot shoot it" },
            source: "engine/tools.ts se_shoot",
          });
        }
        // The same renderer the owner's mirror uses, so the picture is the
        // surface itself rather than a second drawing of it.
        const html = renderMirror(mirror(), w, args.view === undefined ? undefined : String(args.view));
        // .se IS SESSION STATE, so a shot belongs to the PROJECT root however
        // deep in a record the walk stands — exactly as the handover, the
        // notes and the call log do. Passing rootOf() with no address would
        // write the shot where the reader never looks.
        return shoot(rootOf(".se"), html, {
          ...(args.width !== undefined ? { width: Number(args.width) } : {}),
          ...(args.height !== undefined ? { height: Number(args.height) } : {}),
          name: w ?? "page",
        });
      },
    },
    {
      name: "se_probe_cap",
      title: "se.probe.cap",
      description: `MEASURE THIS HOST'S OWN OUTPUT CAP, because only the agent can see where it bites.\n\nTHE CUT HAPPENS BETWEEN THE HOST AND THE MODEL. The engine hands over the whole answer and never learns what arrived, so a number written into the engine by hand is a guess. This verb is the ladder that replaces the guess.\n\nHOW TO RUN IT. Call {bytes: N} and look at the very end of what you got. An intact answer ends with the marker END-OF-PROBE-<N>. Missing marker means the host cut it. Climb until it cuts, halve the step, and settle on the largest N that still shows its marker.\n\nSTART AT 20000 AND DOUBLE. Four or five calls settle it.\n\nTHEN RECORD IT with {cap: N}. That number is written to .se/harness-cap.json and the answer bound moves to it, so every later call pages at the size this host can actually take.\n\nCALL IT WITH NOTHING to see what is recorded now.\n\nTHIS ANSWER IS NOT BOUNDED. It is the one verb that must not be, or it would measure our own ceiling instead of the host's.`,
      inputSchema: {
        type: "object",
        properties: {
          bytes: { type: "number", description: "send a payload of about this many characters, ending in its own marker" },
          cap: { type: "number", description: "record the largest payload that arrived intact on this host" },
        },
      },
      handler: async (args) => {
        const root = rootOf(".se");
        if (args.cap !== undefined) return recordHostCap(root, Number(args.cap));
        if (args.bytes === undefined) return hostCapState(root);
        const asked = Math.max(1, Math.min(4_000_000, Number(args.bytes)));
        const marker = `END-OF-PROBE-${asked}`;
        const filler = "x".repeat(Math.max(0, asked - marker.length - 200));
        return {
          probe: { asked },
          how: "the answer is intact only if the LAST thing in it is the end field below, unchanged",
          filler,
          end: marker,
        };
      },
    },
    {
      name: "se_run",
      title: "se.run",
      description: `Run a shell command from the project root: bash on POSIX, PowerShell on Windows. For what ONLY a shell does, such as node, npm, builds and processes.\n\nWRITE A SCRIPT WHEN THE QUESTION IS ABOUT MANY THINGS. Put it in scratchpad/, run it here, change it, run it again. Counting, routing and measuring across a tree are programs, not readings. Have the script PRINT what you need, and nothing has to be piped.\n\nTHE LANE JOBS ARE REFUSED HERE: ${laneSummary()}. The refusal names the lane call as the remedy (SE-C-129). A first offence per category runs once with a warning. Pass no_tool_reason where the lane truly cannot do the job, and it is logged for the retro.\n\nOutput is captured and logged IN FULL under the call ref. Foreground waits. background returns a job at once: read it with {job}, cancel with {job, stop: true}, list with {jobs: true}.\n\nNever call this session own mirror over HTTP from here. The run blocks the server event loop, so the mirror cannot answer itself.`,
      inputSchema: {
        type: "object",
        properties: {
          command: { type: "string" },
          no_tool_reason: {
            type: "string",
            description:
              "why the lane cannot do this job — runs a lane-covered command ONCE and files the reason for the retro; a frequent reason is the lane's next verb",
          },
          background: { type: "boolean", description: "start it detached and return a job handle IMMEDIATELY — for work you know is long" },
          job: { type: "string", description: "ask an existing job how it is doing: its output so far, whether it still runs" },
          stop: { type: "boolean", description: "with job: kill it and every process it spawned" },
          jobs: {
            type: "boolean",
            description:
              'list what is RUNNING right now, newest first, and NOTHING else. A finished job is served whole by se_run {job: "<id>"}; how many there are rides as `settled`.',
          },
          agent: {
            type: "string",
            description:
              "REGISTER A SUBAGENT YOU JUST SPAWNED, saying in one line what it is doing, and NAME ITS MODEL with the model argument. It then rides the work account and the panel like every other background task. Nothing here can see a subagent for itself — the harness spawns it, so you are the one who knows. HAND IT THE RETURNED ID so it can report progress; a hand that never reports reads as idle whatever it is doing.",
          },
          model: {
            type: "string",
            description:
              "WHICH MODEL ANSWERS FOR THIS HAND. Required alongside agent, because the retro's question is whether spawning paid for itself, and that cannot be answered without knowing what ran. A shell run needs none and records as script.",
          },
          agent_done: { type: "string", description: "close a registered subagent by its id; pass ok: false where it failed" },
          ok: { type: "boolean", description: "with agent_done: whether the subagent succeeded" },
          ack: {
            description:
              "ACKNOWLEDGE SETTLED WORK so it stops riding every answer. true clears everything settled; a job id, or a list of them, clears exactly those. A running job is named back rather than hidden. The record stays reachable with se_run {job} afterwards.",
          },
          steps: {
            type: "number",
            description:
              "HOW MANY STEPS THIS WORK HAS. Required to start anything in the background, because a task that will not say how big it is cannot be projected and the panel has nothing to show. A guess is fine, and it may rise later.",
          },
          did: {
            type: "number",
            description:
              "with job: how many steps are behind you now. Pass steps alongside to revise the total where the work turned out bigger.",
          },
          timeout_ms: { type: "number" },
          role: {
            type: "string",
            enum: ["walker", "reviewer", "researcher"],
            description:
              "with agent: which hand this is. Only a walker counts against the record's ceiling — a reviewer and a researcher are a different purchase. Defaults to walker.",
          },
          cwd: { type: "string", description: "root-relative working directory" },
        },
      },
      handler: async (args) => {
        const root = rootOf();
        const job = jobArm(args, root, positionOf);
        if (job !== undefined) return job;
        if (args.command === undefined) {
          throw new Rejection({
            clause: CLAUSES.REQUIRED_ARGS,
            expected: "a command to run, or a job to ask about",
            got: "neither",
            remedy: { tool: "se_run", args: { command: "<the command>" }, note: "pass command, or job to check one already running" },
            source: "engine/tools.ts se_run",
          });
        }
        // see dsp-lane-door.md#the-discipline-ladder
        if (SHAPED.test(String(args.command)) && args.no_tool_reason === undefined) {
          const remedy = shapedRemedy(String(args.command));
          throw new Rejection({
            clause: CLAUSES.OUTPUT_SHAPED,
            expected: "output the engine can capture whole — ends carry verdicts: exit codes, totals, units",
            got: `a truncating shape in the command: ${String(args.command).slice(0, 200)}`,
            remedy,
            source: "engine/tools.ts se_run",
          });
        }
        const laneWarning = laneVerdict(
          seDir(projectRoot),
          String(args.command),
          args.no_tool_reason === undefined ? undefined : String(args.no_tool_reason),
        );
        const cwd = args.cwd !== undefined ? { cwd: String(args.cwd) } : {};
        const res =
          args.background === true
            ? runBackground(root, String(args.command), { ...cwd, steps: stepsAsked(args, "background") })
            : await runToCompletion(root, String(args.command), cwd);
        return annotateRun(res, laneWarning);
      },
    },
    {
      name: "se_test",
      title: "se.test",
      description:
        "ASK FOR A TEST; THE ENGINE DECIDES WHAT RUNS. You say what you want to know, and nothing else. The engine reads what changed, picks the scope, runs it, and `decided` says what it picked and why. No argument widens or narrows it.\n\nNOTHING IS A REAL ANSWER. An unchanged tree keeps its last verdict, and the result says so rather than refusing. `force` is a flake hunt, which is the whole suite by definition.\n\nWhere the diff is mostly DOCUMENTS the engine sweeps the corpus alongside the tests, and says so in `decided.sweep`.\n\nIt is a durable job. Starting returns a handle, and THE RUN THEN REPORTS ITSELF on the `work` account of every lane call you make — how far along it is, how many failed, the first failures by name, and how much longer it needs. THERE IS NO POLL and asking for one is refused. Carry on working; the news finds you. Every run records its timings, so a silent instrument failure shows instead of passing as green.",
      inputSchema: {
        type: "object",
        properties: {
          question: {
            type: "string",
            description:
              "what you want to know, in one line. REQUIRED, and recorded with the verdict. The engine says which tests ran; only this says why you asked.",
          },
          force: { type: "boolean", description: "a flake hunt: run the whole suite whatever the diff says" },
        },
      },
      handler: async (args) => {
        const root = rootOf();
        const se = seDir(projectRoot);
        const force = args.force === true;
        // THERE IS NO POLL HERE ANY MORE. A running battery
        // rides the `work` account on every lane call, carrying its count,
        // its estimate and the failures as they land. A verb for reading
        // status invited a tight polling loop, and got one.
        if (args.job !== undefined) {
          throw new Rejection({
            clause: CLAUSES.UNKNOWN_ARGS,
            expected: "a question — se_test starts a run and the work account reports it",
            got: `job: ${String(args.job)}`,
            remedy: {
              tool: "se_pull",
              args: {},
              note: "the running battery rides `work` on this and every other lane call, with cases_done, remaining_ms and failures_so_far. Keep working; do not poll. se_run {job} still serves the whole record afterwards.",
            },
            source: "engine/tools.ts se_test",
          });
        }
        // see dsp-lane-door.md#a-test-run-never-outlives-its-session
        const spawnNode = async (
          argv: string[],
          cwd = root,
          extraEnv: Record<string, string> = {},
        ): Promise<{ status: number | null; out: string }> => {
          let out = "";
          const started = startJob(
            `node --test (${argv.length} args)`,
            () => {
              const child = spawn("node", argv, {
                cwd,
                windowsHide: true,
                detached: process.platform !== "win32",
                env: { ...process.env, ...extraEnv },
              });
              child.stdout?.setEncoding("utf8");
              child.stderr?.setEncoding("utf8");
              child.stdout?.on("data", (c: string) => {
                out += c;
              });
              child.stderr?.on("data", (c: string) => {
                out += c;
              });
              return child;
            },
            root,
          );
          const result = await jobDone(started.job);
          return { status: result.exit, out };
        };
        const runScoped = async (
          question: string,
          chosen: string[],
          why: string,
          sweep: boolean,
          unanswered?: string[],
        ): Promise<Record<string, unknown>> => {
          const files = chosen;
          const scope = files.join(",");
          const argv = [
            "--test",
            `--test-concurrency=${String(testConcurrency(availableParallelism()))}`,
            ...testReporterArgs("tap"),
            ...files.map((f) => resolveInRoot(root, f, "engine/tools.ts se_test")),
          ];
          const startedAt = Date.now();
          const r = await spawnNode(argv, root, { [TIMINGS_DIR_ENV]: se });
          const tap = parseTap(r.out);
          const timed = timedSince(se, startedAt);
          const ok = r.status === 0 && tap.fail === 0;
          const streak = testRecord(se, root, ok, scope, files, question);
          const nudge = streakNudge(streak);
          // Counts plus failures — the slice every temp-file grep was after.
          // A long green streak carries the owner's law back with the result:
          // in ~95% of cases the change broke nothing; test to answer a
          // question, not to reassure.
          const swept = sweep ? [await runSweep()] : [];
          return {
            ok,
            question,
            decided: { scope: "scoped", files, why, sweep, ...(unanswered === undefined ? {} : { unanswered }) },
            ...(swept.length > 0 ? { results: swept } : {}),
            tests: { total: tap.total, pass: tap.pass, fail: tap.fail },
            ...timingReport(timed, tap.total),
            ...(tap.failures.length > 0 ? { failures: tap.failures } : {}),
            ...(nudge !== undefined ? { green_streak: streak, nudge } : {}),
            ...(tap.total === 0 ? { output: capMiddle(r.out.trim(), 4000) } : {}),
          };
        };
        // see dsp-lane-door.md#the-battery-is-earned-never-habitual
        const runSweep = async (): Promise<{ script: string; ok: boolean; exit: number | null; output: string }> => {
          const abs = resolveInRoot(root, "deliverable/engine/bin/sweep.ts", "engine/tools.ts se_test");
          const r = await spawnNode([abs, "--root", root], root);
          return { script: "deliverable/engine/bin/sweep.ts", ok: true, exit: r.status, output: capMiddle(r.out.trim(), 4000) };
        };
        const runBattery = async (why: string, sweep: boolean): Promise<Record<string, unknown>> => {
          const results: { script: string; ok: boolean; exit: number | null; output: string }[] = [];
          const deliverable = resolveInRoot(root, "deliverable", "engine/tools.ts se_test");
          const format = await spawnNode([BIOME_BIN, "check", "--write", "--error-on-warnings", "."], deliverable);
          results.push({
            script: "biome check --write --error-on-warnings .",
            ok: format.status === 0,
            exit: format.status,
            output: capMiddle(format.out.trim(), 4000),
          });
          if (format.status !== 0) {
            testRecord(se, root, false);
            return { ok: false, results };
          }
          const scripts = ["deliverable/engine/bin/preflight.ts", "deliverable/engine/bin/selftest.ts"];
          for (const rel of scripts) {
            const abs = resolveInRoot(root, rel, "engine/tools.ts se_test");
            // The battery is long BY DESIGN now that boot walks read real
            // guidance — 150s killed it mid-run. Configurable, generous default.
            const r = await spawnNode([abs, "--root", root], root, { [TIMINGS_DIR_ENV]: se });
            results.push({ script: rel, ok: r.status === 0, exit: r.status, output: capMiddle(r.out.trim(), 4000) });
          }
          if (sweep) results.push(await runSweep());
          const ok = results.every((x) => x.ok);
          // The verdict is REMEMBERED with the tree it judged, so an identical
          // tree can be answered from the record instead of another 90 seconds.
          testRecord(se, root, ok);
          return { ok, question: BATTERY_QUESTION, decided: { scope: "battery", files: [], why, sweep }, results };
        };
        // see dsp-lane-door.md#the-question-is-checked-before-the-handoff
        const decision = decideScope(se, root, force);
        // NOTHING IS AN ANSWER, NOT A REFUSAL. An unchanged tree keeps its
        // last verdict, and saying so plainly beats SE-C-130's old refusal:
        // the caller learns the same thing and the walk does not stop.
        if (decision.scope === "nothing") {
          // THE SWEEP IS NOT THE SUITE. A diff that maps to no test runs no
          // test file, and the check that READS documents still answers for it.
          const swept = decision.sweep ? [await runSweep()] : [];
          return {
            ok: true,
            ran: decision.sweep,
            question: scopedQuestion(args.question),
            decided: {
              scope: "nothing",
              files: [],
              why: decision.why,
              sweep: decision.sweep,
              ...(decision.unanswered === undefined ? {} : { unanswered: decision.unanswered }),
            },
            ...(swept.length > 0 ? { results: swept } : {}),
          };
        }
        const work =
          decision.scope === "scoped"
            ? runScoped(scopedQuestion(args.question), decision.files, decision.why, decision.sweep, decision.unanswered)
            : runBattery(decision.why, decision.sweep);
        const id = `test-${Date.now().toString(36)}-${++testSeq}`;
        // THIS SESSION STARTED IT, and the account cannot tell that from the
        // record on disk alone. Without this a run that settles between two
        // lane calls reads back as history and never reaches the caller.
        noteStarted(id, root);
        // THE LAST RUN SIZES THE EXPECTATION: a
        // battery caller is told how long the previous one took — measured,
        // never guessed — or told plainly that no record exists.
        const battery = decision.scope === "battery";
        // A SCOPED RUN IS SIZED BY ITS OWN FILE LIST. Only a battery has a
        // previous run to be paced against, but every scoped run knows how many
        // files it will work through, and that count is what the projection
        // divides by (req-a-time-remaining-names-its-basis). Without it every
        // scoped run — the common case — could only ever say it cannot estimate.
        const measured = battery ? batteryRecord(se) : { pace: "", total: decision.files.length === 0 ? undefined : decision.files.length };
        const entry: TestJobEntry = {
          done: undefined as unknown as Promise<void>,
          started: Date.now(),
          pace: measured.pace,
          ...(measured.total === undefined ? {} : { total: measured.total }),
        };
        // FIRE AND FORGET: completion records the verdict through the job promise.
        entry.done = work.then(
          (value) => {
            entry.verdict = { job: id, running: false, ...value };
            entry.ended = Date.now();
            persistTestJob(se, id, entry);
            storeLastResults(se, { job: id, question: args.question, ...value });
            try {
              // see dsp-lane-door.md#the-record-carries-the-question-it-answered
              new CallLog(seDir(projectRoot)).append({
                tool: "se_test_verdict",
                args: { job: id, battery, question: args.question },
                actor: "ui",
                part: "surface",
                state: UNREPORTED,
                answered_by: UNREPORTED,
                ok: value.ok === true,
                outcome: "result",
                duration_ms: Date.now() - entry.started,
                response: {
                  ok: value.ok,
                  question: args.question,
                  decided: { scope: decision.scope, why: decision.why },
                  ...(value.tests !== undefined ? { tests: value.tests } : {}),
                  ...(value.results !== undefined ? { results: value.results } : {}),
                },
              });
            } catch {
              // bookkeeping never kills the engine
            }
          },
          (error) => {
            entry.verdict = { job: id, running: false, refused: error instanceof Rejection ? error.toJSON() : String(error) };
            persistTestJob(se, id, entry);
            try {
              new CallLog(seDir(projectRoot)).append({
                tool: "se_test_verdict",
                args: { job: id, battery, question: args.question },
                actor: "ui",
                part: "surface",
                state: UNREPORTED,
                answered_by: UNREPORTED,
                ok: false,
                outcome: "rejected",
                duration_ms: Date.now() - entry.started,
                response: { question: args.question, decided: { scope: decision.scope, why: decision.why }, ...entry.verdict },
              });
            } catch {
              // bookkeeping never kills the engine
            }
          },
        );
        testVerdicts.set(id, entry);
        persistTestJob(se, id, entry);
        // see dsp-lane-door.md#a-scoped-run-answers-the-caller-that-asked
        if (decision.scope === "scoped") {
          await entry.done;
          return entry.verdict ?? { job: id, running: false };
        }
        return {
          handed_off: true,
          job: id,
          note: `running in the background. DO NOT POLL: it rides the \`work\` account on every lane call, with its count, its estimate and the failures as they land. Carry on working and read it there. The final verdict records itself.${measured.pace}`,
        };
      },
    },
    {
      name: "se_git",
      title: "se.git",
      description:
        "Git through the lane, allowlisted: status, log, diff, show, add, commit, fetch, branch, rev-parse, restore (--staged only), checkout (--ours/--theirs on a conflicted path, mid-merge only), merge (--abort to back out a conflict). No push — pushing is the user's act; no rebase — a diverged branch reconciles by merge, which only adds a revertable commit. Runs in the one tree, always.",
      inputSchema: {
        type: "object",
        properties: { args: { type: "array", items: { type: "string" }, description: 'git arguments, e.g. ["status", "--porcelain"]' } },
        required: ["args"],
      },
      handler: (args) => gitLane(rootOf(), (args.args as unknown[]) ?? []),
    },
    //
    // AND THERE IS NOTHING FOR THEM TO DO. Work is written on trunk from the
    // first keystroke, so it is landed by construction and cannot be stale.
  ];
}

// THE SHELL AND THE SUITE: the screenshot, the shell run, the battery and the
// git verb — every tool that starts something outside this process.
//
// Split out of tools.ts. A run is a child process with a job id, and the test
// job store here is what lets a verdict outlive the call that asked for it.
//
// see dsp-lane-door.md#the-verbs-are-grouped-by-what-they-touch

import { spawn } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { availableParallelism } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { CallLog } from "./calllog.ts";
import { BATTERY_QUESTION, decideScope, laneSummary, laneVerdict, parseTap, streakNudge, testRecord } from "./discipline.ts";
import { CLAUSES, Rejection } from "./errors.ts";
import { gitLane } from "./gitlane.ts";
import { capMiddle } from "./jsonio.ts";
import type { ToolDef } from "./mcp.ts";
import { resolveInRoot, seDir } from "./paths.ts";
import { type MirrorState, renderMirror } from "./render.ts";
import { jobDone, jobList, jobStatus, jobStop, runBackground, runToCompletion, startJob } from "./run.ts";
import { shoot } from "./shoot.ts";
import { TIMINGS_DIR_ENV, testConcurrency, testReporterArgs, timedSince, timingReport } from "./testreporters.ts";
import type { ReadingHook } from "./tools-file.ts";

const BIOME_BIN = fileURLToPath(new URL("../node_modules/@biomejs/biome/bin/biome", import.meta.url));

/** The last battery's measured wall, phrased for a caller sizing a wait.
 *  An expectation is measured or absent — never guessed. */
function batteryPace(se: string): string {
  try {
    const rec = JSON.parse(readFileSync(join(se, "test-last-run.json"), "utf8")) as { wall_ms?: number };
    if (typeof rec.wall_ms === "number")
      return ` The last battery took ${Math.round(rec.wall_ms / 1000)}s wall — expect the verdict on that scale.`;
    return " The last battery on record has no wall clock; the next completed run records one.";
  } catch {
    return " No earlier battery is on record to size the wait.";
  }
}
/** The job side of se_run: list, stop, wait or status. Undefined when the
 *  call names no job — the command side handles it. */
function jobArm(args: Record<string, unknown>, root: string): unknown {
  if (args.jobs === true) return { jobs: jobList(root) };
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
      // NO SCOPE ARGUMENT, since the owner's ruling (2026-08-16). You say what
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
  pace: string;
}
interface PersistedTestJob {
  id: string;
  started: number;
  pace: string;
  verdict?: Record<string, unknown>;
}
const testVerdicts = new Map<string, TestJobEntry>();
let testSeq = 0;

function testJobPath(se: string, id: string): string {
  return join(se, "test-jobs", `${id}.jsonl`);
}

function persistTestJob(se: string, id: string, entry: TestJobEntry): void {
  mkdirSync(join(se, "test-jobs"), { recursive: true });
  const record: PersistedTestJob = {
    id,
    started: entry.started,
    pace: entry.pace,
    ...(entry.verdict === undefined ? {} : { verdict: entry.verdict }),
  };
  appendFileSync(testJobPath(se, id), `${JSON.stringify(record)}\n`, "utf8");
}

function recoverTestJob(se: string, id: string): TestJobEntry | undefined {
  const path = testJobPath(se, id);
  if (!existsSync(path)) return undefined;
  const lines = readFileSync(path, "utf8").trimEnd().split("\n");
  for (let index = lines.length - 1; index >= 0; index--) {
    try {
      const record = JSON.parse(lines[index]) as PersistedTestJob;
      return { done: Promise.resolve(), started: record.started, pace: record.pace, verdict: record.verdict };
    } catch {
      // An incomplete final append never hides the preceding valid state.
    }
  }
  return undefined;
}

/** see dsp-lane-door.md#the-verdict-outlives-the-call */
function testJobArm(args: Record<string, unknown>, se: string): Record<string, unknown> {
  const id = String(args.job);
  const t = testVerdicts.get(id) ?? recoverTestJob(se, id);
  if (t === undefined) {
    throw new Rejection({
      clause: CLAUSES.JOB_UNKNOWN,
      expected: "a test run started in this session",
      got: `${id} (unknown)`,
      remedy: { tool: "se_run", args: { jobs: true }, note: "list the session's jobs" },
      source: "engine/tools.ts se_test",
    });
  }
  if (t.verdict !== undefined) return t.verdict;
  if (!testVerdicts.has(id)) {
    return {
      job: id,
      running: false,
      state: "owner_unavailable",
      elapsed_ms: Date.now() - t.started,
      note: "The server owning this unfinished test job is unavailable. Start a new test run.",
    };
  }
  const progress = t.pace !== "" ? batteryProgress(se, t.started) : undefined;
  return {
    job: id,
    running: true,
    elapsed_ms: Date.now() - t.started,
    ...(progress !== undefined ? { progress } : {}),
    note: `still running. Call again with {job} to read current status.${t.pace}`,
  };
}

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

/** Live progress of a running battery, read from the reporter's beat file.
 *  Absent when the stream is missing or belongs to an older run. */
function batteryProgress(se: string, since: number): Record<string, unknown> | undefined {
  try {
    const lines = readFileSync(join(se, "test-progress.jsonl"), "utf8")
      .split("\n")
      .filter((l) => l.trim() !== "");
    const head = JSON.parse(lines[0]) as { start?: string; files_total?: number; tests_last_run?: number };
    if (typeof head.start !== "string" || Date.parse(head.start) < since) return undefined;
    let cases = 0;
    const files = new Set<string>();
    const failures: string[] = [];
    for (const line of lines.slice(1)) {
      let rec: { file?: string; fail?: string; msg?: string };
      try {
        rec = JSON.parse(line);
      } catch {
        continue;
      }
      if (typeof rec.file !== "string") continue;
      cases += 1;
      files.add(rec.file);
      if (typeof rec.fail === "string") failures.push(`${rec.fail}${typeof rec.msg === "string" && rec.msg !== "" ? `: ${rec.msg}` : ""}`);
    }
    return {
      cases_done: cases,
      ...(typeof head.tests_last_run === "number" ? { cases_last_run: head.tests_last_run } : {}),
      files_touched: files.size,
      files_total: head.files_total,
      ...(failures.length > 0 ? { failures_so_far: failures } : {}),
    };
  } catch {
    return undefined;
  }
}

export function runTools(
  rootOf: (rel?: string) => string,
  projectRoot: string,
  _reading?: ReadingHook,
  mirror?: () => MirrorState,
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
        // deep in a worktree the walk stands — exactly as the handover, the
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
      name: "se_run",
      title: "se.run",
      description: `Run a shell command from the project root (bash on POSIX, PowerShell on Windows) — for what ONLY a shell does: node, npm, builds, processes. THE LANE'S JOBS ARE REFUSED HERE: ${laneSummary()}. A first offence per category runs once with a warning; after that the category refuses (SE-C-129) with the lane call as the remedy. If the lane truly cannot do the job, pass no_tool_reason — the command runs once and your reason is logged for the retro.\n\nOutput is engine-captured and logged IN FULL under the returned call ref. Foreground waits for process completion. Background returns a job immediately. Use {job} for status or {job, stop: true} to cancel. {jobs: true} lists this session's jobs.\n\nNEVER call this session's own mirror over HTTP from here — the run blocks the server's event loop, so the mirror cannot answer itself.`,
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
          jobs: { type: "boolean", description: "list every job this session started, newest first" },
          timeout_ms: { type: "number" },
          cwd: { type: "string", description: "root-relative working directory" },
        },
      },
      handler: async (args) => {
        const root = rootOf();
        const job = jobArm(args, root);
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
            ? runBackground(root, String(args.command), cwd)
            : await runToCompletion(root, String(args.command), cwd);
        return annotateRun(res, laneWarning);
      },
    },
    {
      name: "se_test",
      title: "se.test",
      description:
        "ASK FOR A TEST; THE ENGINE DECIDES WHAT RUNS (owner ruling 2026-08-16). You say WHAT YOU WANT TO KNOW and nothing else. The engine reads what actually changed, picks the scope — the whole battery, a named set of test files, or nothing at all — runs it, and the verdict SAYS what it picked and why, in `decided`. There is no argument that widens or narrows it, because choosing the scope was never the agent's job. NOTHING is a real answer: an unchanged tree keeps its last verdict, and the result says so rather than refusing. `force` is the one thing a person asks for directly — a flake hunt, which is the whole suite by definition. THE CONFORMANCE SWEEP RIDES THE SAME DECISION: where the diff is mostly DOCUMENTS, the engine sweeps the corpus alongside the tests and says so in `decided.sweep`, because a battery says nothing about prose and the sweep says everything. Structured as a durable job: starting returns a handle, and calling again with {job} reads its status or final verdict. EVERY RUN RECORDS ITS TIMINGS, one row per case, and the verdict says how many it timed so a silent instrument failure shows instead of passing as green.",
      inputSchema: {
        type: "object",
        properties: {
          question: {
            type: "string",
            description:
              "what you want to know, in one line — 'did the frontier change break the token sync?'. REQUIRED, and recorded with the verdict. The engine says which tests ran; only this says why you asked.",
          },
          force: { type: "boolean", description: "a flake hunt: run the whole suite whatever the diff says" },
          job: {
            type: "string",
            description: "read a test job's current status or final verdict without waiting",
          },
        },
      },
      handler: async (args) => {
        const root = rootOf();
        const se = seDir(projectRoot);
        const force = args.force === true;
        if (args.job !== undefined) return testJobArm(args, se);
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
        const runScoped = async (question: string, chosen: string[], why: string, sweep: boolean): Promise<Record<string, unknown>> => {
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
            decided: { scope: "scoped", files, why, sweep },
            ...(swept.length > 0 ? { results: swept } : {}),
            tests: { total: tap.total, pass: tap.pass, fail: tap.fail },
            ...timingReport(timed, tap.total),
            ...(tap.failures.length > 0 ? { failures: tap.failures } : {}),
            ...(nudge !== undefined ? { green_streak: streak, nudge } : {}),
            ...(tap.total === 0 ? { output: capMiddle(r.out.trim(), 4000) } : {}),
          };
        };
        // see dsp-lane-door.md#the-battery
        const runSweep = async (): Promise<{ script: string; ok: boolean; exit: number | null; output: string }> => {
          const abs = resolveInRoot(root, "project/deliverable/engine/bin/sweep.ts", "engine/tools.ts se_test");
          const r = await spawnNode([abs, "--root", root], root);
          return { script: "project/deliverable/engine/bin/sweep.ts", ok: true, exit: r.status, output: capMiddle(r.out.trim(), 4000) };
        };
        const runBattery = async (why: string, sweep: boolean): Promise<Record<string, unknown>> => {
          const results: { script: string; ok: boolean; exit: number | null; output: string }[] = [];
          const deliverable = resolveInRoot(root, "project/deliverable", "engine/tools.ts se_test");
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
          const scripts = ["project/deliverable/engine/bin/preflight.ts", "project/deliverable/engine/bin/selftest.ts"];
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
          return {
            ok: true,
            ran: false,
            question: scopedQuestion(args.question),
            decided: { scope: "nothing", files: [], why: decision.why },
          };
        }
        const work =
          decision.scope === "scoped"
            ? runScoped(scopedQuestion(args.question), decision.files, decision.why, decision.sweep)
            : runBattery(decision.why, decision.sweep);
        const id = `test-${Date.now().toString(36)}-${++testSeq}`;
        // THE LAST RUN SIZES THE EXPECTATION (owner ruling 2026-08-03): a
        // battery caller is told how long the previous one took — measured,
        // never guessed — or told plainly that no record exists.
        const battery = decision.scope === "battery";
        const pace = battery ? batteryPace(se) : "";
        const entry: TestJobEntry = {
          done: undefined as unknown as Promise<void>,
          started: Date.now(),
          pace,
        };
        // FIRE AND FORGET: completion records the verdict through the job promise.
        entry.done = work.then(
          (value) => {
            entry.verdict = { job: id, running: false, ...value };
            persistTestJob(se, id, entry);
            try {
              // see dsp-lane-door.md#the-record-carries-the-question-it-answered
              new CallLog(seDir(projectRoot)).append({
                tool: "se_test_verdict",
                args: { job: id, battery, question: args.question },
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
          note: `running in the background. Call se_test with {job: "${id}"} to read status. The final verdict records itself.${pace}`,
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
    // `se_git_land` AND `se_git_sync` ARE DELETED (i34, found by the tester at
    // verification). Both reconciled a record's worktree with trunk: land put
    // the work out without closing, sync brought trunk in so a worktree was
    // never silently stale.
    //
    // THEY COULD NOT SUCCEED ANY MORE. `twoTrees` refuses when the two roots
    // are equal, and since the worktrees went, `rootOf()` IS `projectRoot` on
    // every call. Each verb refused every time while its description still
    // promised the reconciliation.
    //
    // AND THERE IS NOTHING FOR THEM TO DO. Work is written on trunk from the
    // first keystroke, so it is landed by construction and cannot be stale.
  ];
}

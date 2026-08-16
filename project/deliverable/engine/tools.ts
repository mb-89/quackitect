// The tool surface — v3 bootstrap cut: drop-in replacements for every native
// tool the cage removes, plus the log query lane. The state machine wires in
// here next (one generic guard reading the active state's legal list); the
// surface below is deliberately COMPLETE for daily work and nothing else.
//
// Laws carried from v2:
//   R8  — required args enforced at dispatch; a wrong arg NAME is refused,
//         never silently coerced (the String(undefined) incident).
//   NEW — unknown args are refused too, naming the accepted set.
//   §5  — honest truncation everywhere; results carry the remedy inline.

import { spawn } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { availableParallelism } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { setAnswerSpill } from "./bound.ts";
import { CallLog } from "./calllog.ts";
import { parseUpdate } from "./decisions.ts";
import { BATTERY_QUESTION, decideScope, laneSummary, laneVerdict, parseTap, streakNudge, testRecord } from "./discipline.ts";
import { CLAUSES, Rejection, type RejectionPayload } from "./errors.ts";
import type { PatchOp } from "./files.ts";
import { gitLane } from "./gitlane.ts";
import { contentHash } from "./hash.ts";
import { rankDemand, searchHelp } from "./help.ts";
import { appendNote, drainNote, type Priority, readNotes } from "./inbox.ts";
import { capJson, capMiddle } from "./jsonio.ts";
import { LINT_CONFIG, lintProse } from "./lint.ts";
import { bumpDrawingEpoch } from "./machines/compile.ts";
import { McpServer, requestContextAdapter, type ToolDef } from "./mcp.ts";
import { ModelFileSystem } from "./model-fs.ts";
import { openPanel } from "./panel.ts";
import { resolveInRoot, seDir } from "./paths.ts";
import { type MirrorState, renderMirror } from "./render.ts";
import { resolve as resolveSeam } from "./resolve.ts";
import { jobDone, jobList, jobStatus, jobStop, runBackground, runToCompletion, startJob } from "./run.ts";
import { requiredDependsOn } from "./seed.ts";
import { type AmendOp, Session } from "./session.ts";
import { shoot } from "./shoot.ts";
import { survey } from "./survey.ts";
import { TIMINGS_DIR_ENV, testConcurrency, testReporterArgs, timedSince, timingReport } from "./testreporters.ts";
import { Toll } from "./toll.ts";
import { SE_VERSION } from "./version.ts";
import { webFetch, webSearch } from "./web.ts";

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

/** THE TICK — the machinery's one tool, legal in every state. */
export function sessionTools(session: Session): ToolDef[] {
  return [
    {
      name: "se_pull",
      title: "se.pull",
      description:
        'THE PULL — your ONLY verb. Say pull, do what comes back, pull again. There is nothing else to learn. The machine owns every decision; you decide nothing about the walk unless it ASKS you to. You never name a target, never name a path, never ask which state you are in, and never ask which tools are legal. BLOCKING IS AN INSTRUCTION, NOT AN ERROR — a pull does not refuse a walk that cannot move yet, it tells you what to do about it. FIVE ANSWERS, and `pull` names which one you got. `read` — a document rides along in `document`, and `prove` names its LAST WORDS: read it, then pull again with form: {"read": "<those words>"}. One document per pull, and the next arrives when this one is proven. The tail is asked for because a host that truncates a big result drops the END, so quoting it is what shows the text arrived whole. `fill` — the next step wants evidence: the machine BUILT the form and handed it to you, so fill it and return it ON THE NEXT PULL as form: {"<section>": "<text>"}. There is no submit VERB — the pull is the only call — but there IS a submit FLAG, and it rides in the form. THREE KEYS ARE ACTS, not sections: `submit: true` stamps it (every check runs, then it signs), `bless: true`/`bless: false` is the thumb on a gate, and a fill carrying NEITHER is saved and deliberately left unstamped so you can finish it later. So a form you mean to finish carries `submit: true`; without it the fields land, nothing signs, and the same form comes back looking untouched. A GATE IS THE SAME MECHANISM and takes both flags — at high autonomy the agent blesses its own (owner ruling 2026-08-09); below the dial it belongs to the person. All three in one pull is legal. `choose` — the road splits: the machine offers its doors, and you answer ON THE NEXT PULL as form: {"choice": "<to>"} (a LIST is legal where the work fans out to several agents — the first is walked, the rest come back as not_walked). A choice exists ONLY where one was offered. `do` — the happy path was WALKED for you, every hop to the next branching point in one call: `here` is where you landed, with its guidance. `wait` — the machine is out of work, or the next step weighs more than the session autonomy: say plainly which step waits and STOP, because the dial alone cannot wake you and the person must message you after moving it. A genuinely illegal call still refuses typed — a choice outside the offer, a form nothing asked for.',
      inputSchema: {
        type: "object",
        properties: {
          form: {
            type: "object",
            description:
              'the filled form the LAST pull handed you. A reading proof: {"read": "<the document\'s last words>"}. Evidence: {"<section>": "<text>", ...}. An offered choice: {"choice": "<to>"} — or a list, where the work fans out. Which one is never your call: a proof while a document is owed, evidence while a step demands it, a choice only where one was offered.',
          },
          escape: {
            type: "string",
            description:
              "step OUT with this reason — the ONE hatch for every kind of stepping out: the person said stop, the walk is MECHANICALLY stuck, earlier work no longer stands (say so — the person invalidates it, and the walk re-earns it). Lands at the FRONT DESK, where the person routes; recorded with its reason. A QUESTION IS NOT AN ESCAPE: waiting on an answer, stay where you stand, ask, and stop — escape only when you already know no answer could let the walk continue from here. Boot cannot be escaped.",
          },
        },
      },
      handler: async (args) =>
        session.pull(
          {
            ...(typeof args.form === "object" && args.form !== null ? { form: args.form as Record<string, unknown> } : {}),
            ...(args.escape !== undefined ? { escape: String(args.escape) } : {}),
          },
          "agent",
        ),
    },
    {
      name: "se_panel",
      title: "se.panel",
      description:
        "Open the panel (the mirror — the human's hand on the walk) in the user's default browser, or POINT AT IT: with ping, the named surface lights YELLOW in every open window and STAYS lit until you point somewhere else — the tour's pointing finger, and 'look HERE' for a refusal or a diff. Legal in every state.",
      inputSchema: {
        type: "object",
        properties: {
          ping: {
            type: "string",
            description:
              "light this surface instead of opening the panel, and leave it lit until the next ping: a card id (its title from project/deliverable/views/cards.md, slugged — e.g. state-machine, chat, log, details), the widget a card shows (machine, terminal), a drawn state id, or an element id",
          },
          note: { type: "string", description: "optional one-liner recorded with the ping" },
        },
      },
      handler: (args) => {
        if (session.mirrorUrl === undefined) {
          throw new Rejection({
            clause: CLAUSES.NOT_CONFIGURED,
            expected: "a listening mirror (the panel)",
            got: "no mirror on this session (port 0, or the bind failed)",
            remedy: {
              tool: "se_pull",
              args: {},
              note: "start the server with a mirror port (default 7333); the URL also prints on the server's stderr",
            },
            source: "engine/tools.ts panel",
          });
        }
        if (args.ping !== undefined) {
          return session.pingSurface(String(args.ping), args.note === undefined ? undefined : String(args.note));
        }
        openPanel(session.mirrorUrl);
        return { opened: session.mirrorUrl, note: "the panel is opening in the user's browser" };
      },
    },
    {
      name: "se_reload",
      title: "se.reload",
      description:
        "Reload the engine onto the current sources — legal only with the walk at idle. Canary-guarded: a tree that does not load is refused and the running engine survives. The reload reboots the walk (boot re-proves the engine green). Swaps NEVER fire on their own — this call, from either hand, is the only trigger.",
      inputSchema: { type: "object", properties: {} },
      handler: () => session.requestReload(),
    },
    // TWO SCRIPTS THAT WERE ONLY EVER REACHABLE THROUGH THE SHELL (owner
    // ruling 2026-08-07). Measured over one 15-hour window: 8 of 23 se_run
    // calls were these two, four runs each, every one carrying a
    // no_tool_reason that said the same thing — the lane has no verb for it.
    //
    // One of those eight died MODULE_NOT_FOUND because the shell's working
    // directory was trunk while the script it wanted lived in a worktree.
    // These resolve the tree the way every other lane call does, so that
    // failure stops being possible rather than stopping by luck.
    {
      name: "se_prompt_place",
      title: "se.prompt.place",
      description:
        "Re-project the PROMPT LAYER — AGENTS.md, CLAUDE.md and the Copilot instructions — from project/guidance/ into the tree the lane is working in. Preflight names this script as its own remedy when what was placed has gone stale, so this is the verb behind that remedy. It resolves the tree itself, so the projection cannot land in the one you are not standing in.",
      inputSchema: { type: "object", properties: {} },
      handler: async () =>
        runToCompletion(session.workRoot(), "node --experimental-strip-types project/deliverable/engine/bin/place-prompt-layer.ts"),
    },
    {
      name: "se_format",
      title: "se.format",
      description:
        "Run the frontmatter formatter over the vault. This is a parse-and-print, which is exactly what se_file_replace cannot be — that verb is a regex. Pass check: true to report what WOULD change without writing anything. It resolves the tree itself.",
      inputSchema: {
        type: "object",
        properties: { check: { type: "boolean", description: "report what would change and write nothing" } },
      },
      handler: async (args) =>
        runToCompletion(
          session.workRoot(),
          `node --experimental-strip-types project/deliverable/engine/bin/format-vault.ts${args.check === true ? " --check" : ""}`,
          {},
        ),
    },
    {
      name: "se_aim",
      title: "se.aim",
      description:
        "AIM THE WALK at a state, then pull and be carried there. The machine draws the route and walks every hop whose conditions already pass, stopping only where something is genuinely owed — so a state that is already green is walked THROUGH, never landed on. Name any state in the machine you stand in, or a fully qualified one like iterations/i1/write-requirements. THIS IS HOW YOU MOVE: taking an offered door aims one hop, which draws a route one segment long and lands you on every state in between. Aim far instead. Aiming is not walking and changes nothing — the pull still refuses whatever the conditions and the dial refuse.",
      inputSchema: {
        type: "object",
        properties: {
          to: { type: "string", description: "the state to aim at — the route is drawn to it and the pull follows it" },
          go: {
            type: "boolean",
            description:
              "TAKE ME THERE IN THIS CALL. Aiming alone only draws the route; with go the machine walks it and the answer says whether it ARRIVED. Nothing is owed on the way means one call and you are there. Something owed means it stops on that state and says which, and the walk stands where it stopped — never between two states.",
          },
        },
        required: ["to"],
      },
      handler: async (args) => {
        const aimed = session.setTarget(String(args.to));
        if (args.go !== true) return aimed;
        // req-a-clear-jump-is-one-call: the caller named the target and asked
        // to be taken there in the SAME call, so the sweep runs here rather
        // than waiting for a pull. The sweep is time-bounded, so this answers
        // whether or not the whole route fits.
        return { ...aimed, ...(await session.sweep(String(args.to), "agent")) };
      },
    },
    {
      name: "se_why",
      title: "se.why",
      description:
        "WHY IS THIS STATE GREY — every condition holding it, in one answer. The walk already computes these to decide whether a step opens; it throws the FIRST failing one and discards the rest, so asking used to mean a cluster of probes against files the lane already holds. Each blocker carries what was expected, what is there instead, and an executable remedy — the same payload the refusal would have carried, because it IS that payload. An EMPTY list means the claim stands: nothing is holding it, and if the walk still will not go there, the reason is the route or the dial rather than the state. Name any state in the machine you stand in, or a fully qualified one like iterations/i1/write-requirements.",
      inputSchema: {
        type: "object",
        properties: {
          state: { type: "string", description: "the state to explain — defaults to where the walk stands" },
        },
      },
      handler: (args) => session.whyGrey(args.state === undefined ? undefined : String(args.state)),
    },
    {
      name: "se_reopen",
      title: "se.reopen",
      description:
        "SEND A STANDING CLAIM BACK to be re-earned. Use it when the work is WRONG — the state goes grey, its form is owed again, and everything downstream falls with it because green ripples through the feeders. The SIGNATURE IS KEPT, but a BLESS IS NOT: a reopen of a claim a person blessed is refused unless you pass confirm, and the refusal names how many states fall with it. WHEN THE GROUND MOVED BUT THE CLAIM'S OWN CONTENT STILL PASSES, use se_amend instead — it fixes the field and leaves the tree standing, the bless with it. A fallen-input refusal now names which of the two fits.",
      inputSchema: {
        type: "object",
        properties: {
          state: { type: "string", description: "the state whose claim must be re-earned" },
          reason: { type: "string", description: "why it stopped standing — one line, and the record keeps it" },
          machine: { type: "string", description: "which machine the state belongs to — needed from outside it, e.g. i1" },
          confirm: {
            type: "boolean",
            description:
              "required only when the claim carries a PERSON'S bless — the reopen destroys that adjudication, and the refusal says how many states fall with it",
          },
        },
        required: ["state", "reason"],
      },
      handler: (args) =>
        session.reopenClaim(
          String(args.state),
          String(args.reason),
          "agent",
          args.machine === undefined ? undefined : String(args.machine),
          args.confirm === true,
        ),
    },
    {
      name: "se_amend",
      title: "se.amend",
      description:
        "FIX A SUBMITTED FORM WITHOUT REOPENING IT, by PATCHING it: ops:[{field, old_string, new_string}], the same shape se_file_patch takes. For the small correction that does not change what the claim says: a reference renamed under it, a path that moved, a typo. The signature stays, because nothing it attested to has changed — invalidating a whole tree to fix a spelling is the cost that leaves spellings wrong. The amend is RECORDED on the file, so a reader sees it happened, when, and why. THE CHECKS STILL RUN: an amend that breaks one is refused and the file is put back untouched, with se_reopen named as what to use instead. Judgement is yours — the engine only guarantees an amend cannot smuggle a reopen past the checks.",
      inputSchema: {
        type: "object",
        properties: {
          state: { type: "string", description: "the state whose submitted form is being corrected" },
          ops: {
            type: "array",
            description:
              "the usual shape: patch a field in place. Each op is {field, old_string, new_string, all?}. old_string must match the field EXACTLY ONCE or the op refuses — pass all: true to replace every occurrence. Several ops chain, each seeing the last one's result.",
            items: {
              type: "object",
              properties: {
                field: { type: "string", description: "the form section to patch" },
                old_string: { type: "string", description: "the text as the form carries it now" },
                new_string: { type: "string", description: "what it becomes" },
                all: { type: "boolean", description: "replace every occurrence instead of refusing an ambiguous match" },
              },
              required: ["field", "old_string", "new_string"],
            },
          },
          fills: {
            type: "object",
            description:
              "rewrite fields WHOLE, as {field: text}. For a small correction prefer ops — resending two thousand characters to change eleven is how a paragraph nobody meant to touch goes missing. A fills entry wins over an op on the same field.",
          },
          reason: { type: "string", description: "what was wrong — one line, and the file keeps it" },
          machine: { type: "string", description: "which machine the state belongs to — needed from outside it, e.g. i1" },
        },
        required: ["state", "reason"],
      },
      handler: (args) =>
        session.amendClaim(
          String(args.state),
          (args.fills ?? {}) as Record<string, string>,
          String(args.reason),
          "agent",
          args.machine === undefined ? undefined : String(args.machine),
          (args.ops ?? []) as AmendOp[],
        ),
    },
  ];
}

export function expeditionTools(session: Session): ToolDef[] {
  return [
    {
      name: "se_seed_expedition",
      title: "se.seed.expedition",
      description:
        "Seed an expedition: kind (spike | fix | explore), goal, and depends_on — the ids it WAITS FOR, which is the container's DAG and the only thing stopping two agents being handed the same files. An empty list is legal and states that it waits for nothing; omitting the key refuses, because a silence and a decision must not be the same bytes on disk. The seed mints a record folder on trunk and nothing else (i34): no branch, no worktree, no push. It stands in the expeditions container at once — entering there binds it.",
      inputSchema: {
        type: "object",
        properties: {
          kind: { type: "string", description: "spike | fix | explore" },
          goal: { type: "string", description: "what this expedition is after" },
          depends_on: {
            type: "array",
            items: { type: "string" },
            description:
              "REQUIRED. Record ids this one WAITS FOR. An EMPTY LIST is legal and is a stated decision: nothing is waited on. Omitting the key refuses, because a silence and a decision must not be the same bytes on disk.",
          },
        },
        // depends_on IS REQUIRED AND IS NOT ON THIS LIST, on purpose (i6).
        // The generic required-args check fires BEFORE the handler and answers
        // with `depends_on: "<value>"` — which is the exact failure the row
        // exists to prevent, because it leaves the caller to guess whether an
        // empty list is legal. requiredDependsOn refuses instead, and its
        // remedy shows the call to make.
        required: ["kind", "goal"],
      },
      handler: (args) =>
        session.expeditionNew(
          String(args.kind),
          String(args.goal),
          requiredDependsOn("se_seed_expedition", args.depends_on, { kind: args.kind, goal: args.goal }),
        ),
    },
    {
      name: "se_seed_iteration",
      title: "se.seed.iteration",
      description:
        "Seed an iteration: goal, rough vision, input refs, and depends_on — the ids it WAITS FOR, which is the container's DAG and the only thing stopping two agents being handed the same files. An empty list is legal and states that it waits for nothing; omitting the key refuses, because a silence and a decision must not be the same bytes on disk. Naming another open iteration draws the edge dep -> this, so the drawing shows the real shape (independent ones side by side, dependent ones in series) AND the walk refuses to enter this one until that dependency leaves the open set. The seed mints a record folder on trunk and nothing else (i34): no branch, no worktree, no push. It stands in the iterations container in M0 — the retro onboards, the kickoff proposes a size, and the bless pins the rest. No size is asked at the seed.",
      inputSchema: {
        type: "object",
        properties: {
          goal: { type: "string", description: "what this iteration is after" },
          vision: { type: "string", description: "roughly how — what done looks like" },
          inputs: { type: "array", items: { type: "string" }, description: "context refs: an expedition id, retro note refs" },
          depends_on: {
            type: "array",
            items: { type: "string" },
            description:
              "REQUIRED. Iteration ids this one WAITS FOR — it cannot be entered until each has left the open set. An EMPTY LIST is legal and is a stated decision: nothing is waited on. Omitting the key refuses, because a silence and a decision must not be the same bytes on disk.",
          },
        },
        // Required, and deliberately not on this list — see se_seed_expedition
        // above. The generic check would pre-empt the remedy that matters.
        required: ["goal", "vision"],
      },
      handler: (args) =>
        session.iterationSeed(
          String(args.goal),
          String(args.vision),
          Array.isArray(args.inputs) ? args.inputs.map(String) : [],
          requiredDependsOn("se_seed_iteration", args.depends_on, { goal: args.goal, vision: args.vision }),
        ),
    },
    {
      name: "se_exp_close",
      title: "se.exp.close",
      description:
        "Close the bound expedition — the close IS the ruling: apply (merge: true, default) or dismiss (merge: false), stamped on the record. The work already stands on trunk, so nothing moves either way and DISMISS DOES NOT DISCARD ANYTHING — reverting is a separate act. Leftovers are committed, and the record's folder stays where it is. THE REPORT MUST BE CONFIRMED BY A PERSON, in the mirror. Closing on a report the agent finished itself is refused unless `override` says who authorised it — and the override is stamped on the record, so the archive shows which reports carry a person's judgement and which do not.",
      inputSchema: {
        type: "object",
        properties: {
          merge: { type: "boolean", description: "true = apply (default); false = dismiss" },
          override: {
            type: "string",
            description:
              "who lifted the confirmation requirement, and where they said it — required when the report was not confirmed by a person; recorded on the record",
          },
        },
      },
      handler: (args) => session.expeditionClose(args.merge !== false, args.override === undefined ? undefined : String(args.override)),
    },
  ];
}

// rootOf takes the path because ONE lane serves two trees: `.se/` is session
// state at the project root, everything else follows the walk into its bound
// worktree (Session.laneRoot, owner ruling 2026-07-28). Callers that act on no
// single path — search, glob, run, git — pass nothing and get the work root.
// judgmentDrainAllowed answers ONE question for se_note_drain: may this
// caller park a note or carry it, or only record the mechanical verdicts.
// It is a thunk because the walk moves under a built tool list.
// THE PEEK RETIRED WITH THE TICK: an agent choosing among doors gets them
// from the pull's own offer, statements and weights riding along. The
// mirror still reads any state through stateInfo.

/** A cheap multi-read makes it easy to pull documents nobody needed, which
 *  wastes context quietly. Twenty is far above any real reading list — boot's
 *  is eight — and well below a sweep of the tree. */
const MAX_READ_PATHS = 20;

/** MANY PATHS, ONE CALL. Read-proof is a SET, not a sequence: leaving boot
 *  demands eight hashes TOGETHER, and asking one at a time pays a round trip
 *  per document for nothing. The reads themselves do not collapse and should
 *  not — proving you read is the point. The waiting collapses.
 *
 *  EACH ENTRY ANSWERS FOR ITSELF. An oversize or missing path returns its own
 *  typed refusal in place of its content and the rest still come back. Losing
 *  seven good reads because the eighth is large would make the cheap call
 *  useless exactly where it is worth most. */
function readMany(model: ModelFileSystem, entries: unknown[], ref: string | undefined, optional: boolean): Record<string, unknown> {
  if (entries.length > MAX_READ_PATHS) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: `at most ${MAX_READ_PATHS} paths in one call`,
      got: `${entries.length} paths`,
      remedy: {
        tool: "se_file_read",
        args: { paths: ["<first>", "<second>"] },
        note: "ask for the set you will actually read; a wide multi-read spends context on documents nobody wanted",
      },
      source: "engine/tools.ts se_file_read",
    });
  }
  const files = entries.map((e) => {
    const spec = typeof e === "string" ? { path: e } : (e as { path?: unknown; offset?: unknown; limit?: unknown; optional?: unknown });
    const path = String(spec.path ?? "");
    try {
      return model.read(path, {
        ...(spec.offset !== undefined ? { offset: Number(spec.offset) } : {}),
        ...(spec.limit !== undefined ? { limit: Number(spec.limit) } : {}),
        ...(ref !== undefined ? { ref } : {}),
        ...(spec.optional === true || optional ? { optional: true } : {}),
      }) as unknown as Record<string, unknown>;
    } catch (err) {
      const r = err as { clause?: string; expected?: string; got?: string; remedy?: unknown; message?: string };
      return { path, refused: { clause: r.clause, expected: r.expected ?? r.message, got: r.got, remedy: r.remedy } };
    }
  });
  const failed = files.filter((f) => f.refused !== undefined).length;
  return { files, ...(failed > 0 ? { failed } : {}) };
}

/** The reading is engine-written, so its ceiling is the engine's to set.
 *  Past it the read pages like any other large file, and each page credits
 *  the documents it fully showed. */
const READING_BUDGET = 120_000;

export interface ReadingHook {
  path: string;
  build(): string[];
  credit(offset: number, lines: number): string[];
}

/** THE READING is written the moment it is asked for, then served like
 *  any other file — same numbered lines, same hash, same offset/limit.
 *  What it showed is credited on the way out, so the documents inside
 *  it never have to be asked for again. Undefined when the ask is not
 *  the reading: the plain read handles it. */
function serveReading(
  model: ModelFileSystem,
  reading: ReadingHook | undefined,
  args: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (reading === undefined || args.ref !== undefined || args.paths !== undefined) return undefined;
  if (String(args.path ?? "").replace(/\\/g, "/") !== reading.path) return undefined;
  reading.build();
  const res = model.read(reading.path, {
    ...(args.offset !== undefined ? { offset: Number(args.offset) } : {}),
    ...(args.limit !== undefined ? { limit: Number(args.limit) } : {}),
    maxChars: READING_BUDGET,
  }) as unknown as Record<string, unknown>;
  const range = res.range as { offset: number; limit: number } | undefined;
  const offset = range?.offset ?? 1;
  const lines = range?.limit ?? Number(res.total_lines ?? 0);
  return { ...res, credited: reading.credit(offset, lines) };
}

function readManyGuarded(model: ModelFileSystem, paths: unknown, ref: string | undefined, optional: boolean): Record<string, unknown> {
  if (!Array.isArray(paths)) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "paths as an array of paths, or of {path, offset?, limit?}",
      got: typeof paths,
      remedy: { tool: "se_file_read", args: { paths: ["<path>"] }, note: "one path uses `path`; a set uses `paths`" },
      source: "engine/tools.ts se_file_read",
    });
  }
  return readMany(model, paths, ref, optional);
}

/** WORDS THAT MEAN THE SAME THING TO A CALLER. The lane's verbs disagree about
 *  what to call their subject: search takes `query`, glob takes `glob`, list
 *  takes `dir`, the readers and writers take `path`, and run takes `command`.
 *  Every one of those is defensible on its own and the set is not learnable,
 *  so a caller pays a round trip for a word.
 *
 *  MEASURED ON i11'S OWN WALK: two refusals in one call pair, both `pattern`,
 *  one meaning `query` and one meaning `glob`.
 *
 *  A GROUP IS A MEANING, NOT A RENAME. Nothing is renamed — every verb keeps
 *  the name it has, and a caller who uses a sibling's word is understood. */
const ARG_SYNONYMS: readonly (readonly string[])[] = [
  ["query", "pattern", "regex", "search", "q", "text"],
  ["glob", "pattern", "files", "file_pattern"],
  ["path", "file", "filepath", "file_path", "dir", "directory", "folder"],
  ["command", "cmd", "shell"],
];

/** Which of the tool's OWN argument names a wrong word could have meant. Only
 *  names the tool actually declares, and only ones the caller did not already
 *  send — so a call carrying both `path` and `dir` never has one rewritten
 *  over the other. */
function candidateArgs(wrong: string, args: Record<string, unknown>, known: string[]): string[] {
  const out = new Set<string>();
  for (const group of ARG_SYNONYMS) {
    if (!group.includes(wrong)) continue;
    for (const name of group) {
      if (name !== wrong && known.includes(name) && !(name in args)) out.add(name);
    }
  }
  return [...out];
}

/** THE ONE-CANDIDATE REPAIR, and it is never silent.
 *
 *  A wrong argument name is still refused when it is AMBIGUOUS — two possible
 *  meanings is a guess, and the lane does not guess at its boundary. What
 *  changes is the unambiguous case: `pattern` on a verb that declares `query`
 *  and no other synonym can only have meant `query`.
 *
 *  THE REPAIR IS REPORTED on the result as `arg_repaired`, because "a wrong
 *  arg name is refused rather than silently ignored" was the right instinct.
 *  Silence is the problem; the round trip was only the remedy. */
let argRepairs: { from: string; to: string; note: string }[] | undefined;

function repairArgNames(tool: string, args: Record<string, unknown>, known: string[]): void {
  if (known.length === 0) return;
  const repaired: { from: string; to: string }[] = [];
  for (const wrong of Object.keys(args).filter((k) => !known.includes(k))) {
    const could = candidateArgs(wrong, args, known);
    if (could.length !== 1) continue;
    args[could[0]] = args[wrong];
    delete args[wrong];
    repaired.push({ from: wrong, to: could[0] });
  }
  if (repaired.length > 0) {
    argRepairs = repaired.map((r) => ({
      ...r,
      note: `${tool} calls it \`${r.to}\` — read as that, and nothing was guessed`,
    }));
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

/** A SHAPE THAT CUTS BEFORE THE ENGINE SEES. Select-Object -First, head, tail,
 *  cut -c, Measure-Object: each one drops output between the command and the
 *  capture, so what it removed exists NOWHERE — not on the result, not in the
 *  log, not under the ref.
 *
 *  A FILTER AFTER A PIPE IS THE SAME THING, and it was the one actually doing
 *  the damage. `| Select-String fail` keeps the matching lines and throws away
 *  the TAP summary — which is where the counts live. That is how a run came
 *  back as exit 1 with empty output on 2026-08-16, inside the iteration
 *  building this refusal.
 *
 *  BEFORE a pipe they are a different offence: reaching for the shell's
 *  searcher instead of the lane's, which SE-C-129 already covers. */
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

export function coreTools(
  rootOf: (rel?: string) => string,
  projectRoot: string,
  judgmentDrainAllowed: () => boolean = () => true,
  reading?: ReadingHook,
  doors: () => Record<string, unknown>[] = () => [],
  mirror?: () => MirrorState,
  /** WHICH RECORD IS BOUND, for the minted_in stamp. It used to be scraped
   *  off the write's root as a `.worktrees/<id>` segment, and i34 removes
   *  worktrees — so the stamp had to be asked of the walk rather than of a
   *  path. Defaults to nothing, which stamps nothing, exactly as writing
   *  outside a record always did. */
  boundRecord: () => string | undefined = () => undefined,
  // `whereNow` IS DELETED (i6). It existed for one caller: the battery refusal
  // that asked WHERE the walk stood before deciding whether an agent-initiated
  // battery was legal. The owner's ruling moved that decision into the engine
  // — the agent asks for a test and `decideScope` reads what CHANGED — so the
  // position stopped being an input and the parameter stopped being read.
): ToolDef[] {
  const model = new ModelFileSystem(rootOf, boundRecord);
  return [
    {
      name: "se_file_read",
      title: "se.file.read",
      description:
        "Read a project file (root-relative path) — TEXT OR IMAGE. Returns the CAS hash writes will demand. Text comes back as numbered lines; pass offset (1-based line) / limit to read a large file in PARTS — an oversize whole-file read is refused with the remedy, never silently truncated. An IMAGE (png, jpg, gif, webp) comes back as the picture itself, so a sketch can be LOOKED AT rather than described to you. Any other binary is refused. A DECLARED ROOT is reachable as '@name/rest' (the owner declares roots in .se/roots.json; they are read-only). Pass ref to read AT A COMMITTED REF ('main' reaches v1, 'v2' reaches v2) — pair with se_file_search/se_file_glob at the same ref. Pass optional: true for a file that is ALLOWED to be missing (the handover): absence answers exists: false rather than refusing. THE READING (.se/reading.md) is the one path the ENGINE writes: it holds every document the way ahead still demands, concatenated, and reading it CREDITS them all — one call instead of one per document, and no read_hashes to carry afterwards. The packet names it whenever anything is owed.",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string" },
          paths: {
            type: "array",
            description:
              "read MANY in ONE call — a list of paths, or of {path, offset?, limit?} for per-file windows. Read-proof is a SET, so a state's whole reading list comes back in one envelope, each entry with its own hash. An unreadable path returns its refusal in place of its content and the others still arrive.",
            items: { type: ["string", "object"] },
          },
          offset: { type: "number", description: "1-based first line" },
          limit: { type: "number", description: "how many lines" },
          ref: { type: "string", description: "read from this committed git ref instead of the working tree" },
          optional: {
            type: "boolean",
            description:
              "the file is ALLOWED not to exist — absence comes back as exists: false instead of a refusal. Only absence is forgiven; a path outside the root still refuses. Per-entry in `paths` too.",
          },
        },
      },
      handler: (args) => {
        const ref = args.ref !== undefined ? String(args.ref) : undefined;
        const optional = args.optional === true;
        const served = serveReading(model, reading, args);
        if (served !== undefined) return served;
        if (args.paths !== undefined) return readManyGuarded(model, args.paths, ref, optional);
        if (args.path === undefined) {
          throw new Rejection({
            clause: CLAUSES.REQUIRED_ARGS,
            expected: "path (one file) or paths (a set)",
            got: "neither",
            remedy: { tool: "se_file_read", args: { path: "<root-relative path>" }, note: "name what to read" },
            source: "engine/tools.ts se_file_read",
          });
        }
        return model.read(String(args.path), {
          ...(args.offset !== undefined ? { offset: Number(args.offset) } : {}),
          ...(args.limit !== undefined ? { limit: Number(args.limit) } : {}),
          ...(ref !== undefined ? { ref } : {}),
          ...(optional ? { optional: true } : {}),
        });
      },
    },
    {
      name: "se_file_write",
      title: "se.file.write",
      description:
        "Whole-file write. base_hash: null CREATES; otherwise base_hash must match disk (CAS) — read first, write with the hash you read.",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string" },
          content: { type: "string" },
          base_hash: { type: ["string", "null"], description: "null to create; the hash from se_file_read to overwrite" },
        },
        required: ["path", "content", "base_hash"],
      },
      // Some harnesses serialize the scalar null as its string — both mean CREATE.
      handler: (args) =>
        model.write(
          String(args.path),
          String(args.content),
          args.base_hash === null || args.base_hash === "null" ? null : String(args.base_hash),
        ),
    },
    {
      name: "se_file_patch",
      title: "se.file.patch",
      description:
        "EDIT FILES — five verbs, one atomic batch. Each op is ONE of: {path, old_string, new_string} exact match (unique, or replace_all) · {path, pattern, replacement, flags?, expect_count?} regex substitution, always global, count reported · {path, append: true, new_string} append (prepend: true likewise) — never rebuild a file to add to its end · {path, at: {from_line, to_line}, new_string, base_hash} replace a line range from a read you hold. MANY edits, MANY files, ONE call — every guard checked before anything is written. TRIVIAL MISMATCHES ARE CORRECTED, NOT REFUSED: a CRLF/LF difference is applied in the file's own endings and named on the result (`corrected`).",
      inputSchema: {
        type: "object",
        properties: {
          ops: {
            type: "array",
            description: "[{path, + one verb's fields}, ...] — atomic across the batch",
            items: {
              type: "object",
              properties: {
                path: { type: "string" },
                old_string: { type: "string", description: "exact verb: the text to find (unique unless replace_all)" },
                new_string: { type: "string", description: "the replacement / appended / prepended / range text" },
                base_hash: { type: "string", description: "CAS pin from se_file_read — REQUIRED on a range op" },
                replace_all: { type: "boolean" },
                pattern: { type: "string", description: "regex verb: JS regex, always global; $1 backrefs work in replacement" },
                replacement: { type: "string" },
                flags: { type: "string", description: "regex flags from i m s — g is implied" },
                expect_count: { type: "number", description: "regex verb: refuse unless the match count is exactly this" },
                append: { type: "boolean", description: "append new_string to the file's end (newline seam handled and named)" },
                prepend: { type: "boolean", description: "prepend new_string to the file's start" },
                at: { type: "object", description: "{from_line, to_line} 1-based inclusive — replace these lines with new_string" },
              },
              required: ["path"],
            },
          },
        },
        required: ["ops"],
      },
      handler: (args) => {
        // Unknown op fields refuse BY NAME — a mistyped find/replace once
        // read as "0 occurrences" and cost a round of misdiagnosis.
        const KNOWN = new Set([
          "path",
          "old_string",
          "new_string",
          "base_hash",
          "replace_all",
          "pattern",
          "replacement",
          "flags",
          "expect_count",
          "append",
          "prepend",
          "at",
        ]);
        const ALIAS: Record<string, string> = {
          find: "old_string",
          replace: "new_string",
          search: "old_string",
          old: "old_string",
          new: "new_string",
        };
        (Array.isArray(args.ops) ? (args.ops as Record<string, unknown>[]) : []).forEach((op, i) => {
          const unknown = Object.keys(op).filter((k) => !KNOWN.has(k));
          if (unknown.length > 0) {
            throw new Rejection({
              clause: CLAUSES.REQUIRED_ARGS,
              expected: "op fields: path, old_string, new_string, base_hash?, replace_all?",
              got: `unknown field(s) on op ${i + 1}: ${unknown.map((k) => (ALIAS[k] !== undefined ? `${k} (use ${ALIAS[k]})` : k)).join(", ")}`,
              remedy: {
                tool: "se_file_patch",
                args: { ops: [{ path: "<path>", old_string: "<exact text>", new_string: "<replacement>" }] },
                note: "rename the fields and repeat — nothing was written",
              },
              source: "engine/tools.ts se_file_patch",
            });
          }
        });
        const ops = args.ops as PatchOp[];
        // A patch is ATOMIC under one root. Session state and project content
        // resolve to different trees, so a batch spanning both has no single
        // root to be atomic under — say so rather than writing half of it.
        const roots = new Set(ops.map((o) => rootOf(String(o.path))));
        if (roots.size > 1) {
          throw new Rejection({
            clause: CLAUSES.REQUIRED_ARGS,
            expected: "one atomic patch per tree — .se/ is session state, everything else is project content",
            got: `ops spanning ${roots.size} trees`,
            remedy: {
              tool: "se_file_patch",
              args: { ops: "[…only the .se/ ops, then a second call for the rest…]" },
              note: "split the batch; each call stays atomic within its own tree",
            },
            source: "engine/tools.ts",
          });
        }
        return model.patch(ops);
      },
    },
    {
      name: "se_file_replace",
      title: "se.file.replace",
      description:
        "SEARCH AND REPLACE ACROSS FILES — one regex, every file a glob reaches, one atomic call. se_file_patch's regex verb is the scalpel for a path you already hold; this is the sweep for a rename that runs through the tree.\n\nIT HANDS BACK EVERY PLACE IT LANDED: path, line, and the line BEFORE and AFTER, so you judge the replace instead of trusting it. Read that list. A wide edit whose result is only a number is the one nobody can check, and undoing it costs more than reading it.\n\nA pattern matching NOTHING is refused, never a quiet success. expect_count refuses unless the total is exactly that — use it when you already know how many places there are. Nothing is written unless every file passes every guard.",
      inputSchema: {
        type: "object",
        properties: {
          glob: { type: "string", description: "which files to sweep, e.g. **/*.ts or project/guidance/**/*.md" },
          pattern: { type: "string", description: "JS regex, always global; $1 backrefs work in replacement" },
          replacement: { type: "string" },
          flags: { type: "string", description: "flags from i m s — g is implied" },
          expect_count: { type: "number", description: "refuse unless the total match count across all files is exactly this" },
        },
        required: ["glob", "pattern", "replacement"],
      },
      handler: (args) =>
        model.replace(String(args.glob), String(args.pattern), String(args.replacement), {
          ...(args.flags !== undefined ? { flags: String(args.flags) } : {}),
          ...(args.expect_count !== undefined ? { expect_count: Number(args.expect_count) } : {}),
        }),
    },
    {
      name: "se_file_move",
      title: "se.file.move",
      description:
        "Move or rename a file and fix EVERY reference in one pass. PROSE (.md, .canvas) takes all three reference forms: root-relative paths, vault-relative canvas refs, and wiki links. SOURCE (.ts, .ps1, .json) takes the root-relative form only, because the other two are markdown conventions. Reports what was rewritten AND what it could not: `unrewritten` lists every surviving mention of the old path, with file and line, as work you still owe. A quiet `rewritten: []` never again means the move was clean. Refuses to overwrite.",
      inputSchema: {
        type: "object",
        properties: {
          from: { type: "string", description: "root-relative source path" },
          to: { type: "string", description: "root-relative destination path" },
        },
        required: ["from", "to"],
      },
      handler: (args) => model.move(String(args.from), String(args.to)),
    },
    {
      name: "se_file_delete",
      title: "se.file.delete",
      description:
        "Hash-guarded delete: base_hash must match disk — no blind removal. THE ANSWER NAMES WHO POINTED AT IT: for a trace node, cited_by lists every file citing its id, in frontmatter edges AND in prose, with line numbers. It never refuses — deleting a node with dependents is legal and often right, and the list is there while the decision is still being made. An unreferenced node answers with an empty list rather than silence.",
      inputSchema: {
        type: "object",
        properties: { path: { type: "string" }, base_hash: { type: "string" } },
        required: ["path", "base_hash"],
      },
      handler: (args) => model.delete(String(args.path), String(args.base_hash)),
    },
    {
      name: "se_file_list",
      title: "se.file.list",
      description:
        "List entries under a project directory (root-relative; '.' is the project root). A DECLARED ROOT is browsable as '@name' or '@name/sub' — the owner declares roots in .se/roots.json.",
      inputSchema: {
        type: "object",
        properties: { dir: { type: "string", default: "." } },
      },
      handler: (args) => model.list(String(args.dir ?? ".")),
    },
    {
      name: "se_file_glob",
      title: "se.file.glob",
      description:
        "List project files matching a glob (e.g. **/*.test.ts) — the 'where does this live' lane. Glob a DECLARED ROOT as '@name/**/*.md'; hits come back as '@name/...', the same address the reader takes. Pass ref to glob a committed ref's tree instead ('main' reaches v1, 'v2' reaches v2).",
      inputSchema: {
        type: "object",
        properties: {
          glob: { type: "string" },
          ref: { type: "string", description: "glob this committed git ref's tree instead of the working tree" },
        },
        required: ["glob"],
      },
      // The GLOB carries the root selector, so it decides which tree answers.
      // Called with no argument, a bound worktree answered instead — and the
      // worktree has no .se/roots.json, so every declared root read as
      // undeclared while the READER resolved the same name fine.
      handler: (args) => model.glob(String(args.glob), { ...(args.ref !== undefined ? { ref: String(args.ref) } : {}) }),
    },
    {
      name: "se_file_search",
      title: "se.file.search",
      description:
        "Regex search (ripgrep). context: N brings N lines around every hit — usually saves the follow-up read; include: '**/*.ts' filters by filename in the same call; count_only: true answers 'how many, where' for a fraction of the tokens. Search any git ref with ref (a branch or tag; this repo is a branch of quack, so 'main' reaches v1 and 'v2' reaches v2). Scope to a DECLARED ROOT with path: '@name'; hits come back as '@name/...', the same address the reader takes. For more than context can carry, read around a hit with se_file_read offset/limit.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "the regex" },
          intent: { type: "string", description: "what you are trying to find — logged, feeds the retro" },
          path: { type: "string", description: "restrict to a subdirectory (a pathspec when ref is given)" },
          ref: { type: "string", description: "search this committed ref instead of the tree" },
          ignore_case: { type: "boolean" },
          limit: { type: "number", default: 100 },
          context: {
            type: "number",
            description:
              "lines around each hit (capped at 10) — context lines carry context: true, so a neighbour is never mistaken for a match",
          },
          before: { type: "number", description: "asymmetric context: lines BEFORE each hit (wins over context)" },
          after: { type: "number", description: "asymmetric context: lines AFTER each hit (wins over context)" },
          include: { type: "string", description: "filename glob, e.g. **/*.ts — the search filters files itself; no listing pipe needed" },
          count_only: { type: "boolean", description: "per-file match counts instead of match lines" },
        },
        required: ["query", "intent"],
      },
      // The PATH scope carries the root selector here, for the same reason.
      handler: (args) =>
        model.search(String(args.query), {
          ...(args.path !== undefined ? { path: String(args.path) } : {}),
          ...(args.ref !== undefined ? { ref: String(args.ref) } : {}),
          ...(args.ignore_case === true ? { ignore_case: true } : {}),
          ...(args.limit !== undefined ? { limit: Number(args.limit) } : {}),
          ...(args.context !== undefined ? { context: Number(args.context) } : {}),
          ...(args.before !== undefined ? { before: Number(args.before) } : {}),
          ...(args.after !== undefined ? { after: Number(args.after) } : {}),
          ...(args.include !== undefined ? { include: String(args.include) } : {}),
          ...(args.count_only === true ? { count_only: true } : {}),
        }),
    },
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
        // THE DISCIPLINE LADDER (engine/discipline.ts): a command doing a lane
        // tool's job runs once with a warning, then refuses. Judged BEFORE the
        // spawn, so a blocked category costs nothing to block.
        // REFUSED AT THE BOUNDARY, NOT ANNOTATED AFTER (owner ruling
        // 2026-08-16). The lane already warned about this and the warning did
        // not work: an agent shaped output through Select-String IN THIS
        // ITERATION, while building the fix for it, and got exit 1 with empty
        // stdout. A warning that has failed twice is evidence about warnings.
        //
        // WHY IT HAPPENS SO OFTEN is the part worth answering, and the remedy
        // answers it: the pipe is reached for when the raw output is expected
        // to be long, so the refusal names the verb that handles length.
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
        // A TEST RUN NEVER OUTLIVES ITS SESSION (found 2026-08-02: two
        // orphaned workers held a folder lock for four hours). Children run
        // in the job registry — whole-tree killed on timeout, reaped at
        // shutdown, visible to se_run {jobs: true}.
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
        // The battery: EARNED, not habitual. The gate computes the scoped
        // remedy from the diff since the last green battery.
        // THE SWEEP RIDES THE DECISION, NEVER A VERB (owner ruling 2026-08-16).
        // A verb an agent can call is a verb an agent will call, and the whole
        // reason this check left the write is that it costs too much to run per
        // write. `decideScope` already reads the diff; when that diff is mostly
        // DOCUMENTS it says so, and the sweep runs with the tests.
        //
        // IT REPORTS AND NEVER DECIDES THE VERDICT HERE. The sweep BLOCKS at
        // sweep-consistency's own exit, which is the state whose job is
        // clearing it. Riding a test run, it is news.
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
        // THE QUESTION IS CHECKED BEFORE THE HANDOFF, on purpose. A refusal
        // raised inside the async body becomes the JOB's verdict, so a call
        // that could never run would still answer with a handle and fail
        // quietly a second later (found by verdictlog.test.ts, 2026-08-13).
        // THE ENGINE DECIDES WHAT RUNS (owner ruling 2026-08-16). The agent
        // asked a question; this reads what changed and picks the scope.
        //
        // WHAT THIS REPLACED. Two refusals guarded the scope from opposite
        // sides — one refused the battery toward a scoped run, the other
        // refused scoped runs toward the battery — and on 2026-08-16 they
        // closed on each other at i6's sixth build chunk. Each remedy was the
        // other refusal, and no test call was legal at all.
        //
        // THE CAUSE WAS THE AGENT CHOOSING AND THE ENGINE GRADING THE CHOICE.
        // Two graders with different subjects eventually disagree, and the
        // agent standing between them has no move. One decider has nothing to
        // disagree with.
        //
        // DECIDED BEFORE THE HANDOFF, because a refusal raised inside the
        // async body becomes the JOB's verdict — the call would answer with a
        // handle and fail quietly a second later.
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
              new CallLog(seDir(projectRoot)).append({
                tool: "se_test_verdict",
                args: { job: id, battery },
                ok: value.ok === true,
                outcome: "result",
                duration_ms: Date.now() - entry.started,
                response: {
                  ok: value.ok,
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
                args: { job: id, battery },
                ok: false,
                outcome: "rejected",
                duration_ms: Date.now() - entry.started,
                response: entry.verdict,
              });
            } catch {
              // bookkeeping never kills the engine
            }
          },
        );
        testVerdicts.set(id, entry);
        persistTestJob(se, id, entry);
        // A SCOPED RUN ANSWERS THE CALLER THAT ASKED (i11 2026-08-16).
        //
        // MEASURED THE DAY BEFORE THIS LANDED: 494 se_test calls produced 66
        // verdicts. About 428 asked only whether a job had finished, and a
        // fifty-second battery cost ten calls to watch.
        //
        // THE JOB MACHINERY STAYS UNDER IT. The verdict is still persisted and
        // still logged, so `{job}` keeps working and nothing that reads a job
        // by id has to change — the caller simply stops having to.
        //
        // THE BATTERY STILL HANDS OFF, and that is not an oversight. It is the
        // engine's to fire at verification, where nobody is waiting on the
        // answer, and blocking a caller for fifty seconds buys nothing.
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

    {
      name: "se_web_fetch",
      title: "se.web.fetch",
      description: "Fetch a URL as readable text (HTML reduced). Large pages page through offset; truncation is always declared.",
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string" },
          offset: { type: "number", description: "char offset for paging a large page" },
        },
        required: ["url"],
      },
      handler: (args) => webFetch(String(args.url), args.offset !== undefined ? { offset: Number(args.offset) } : {}),
    },
    {
      name: "se_web_search",
      title: "se.web.search",
      description:
        "Web search (provider-backed; needs SE_BRAVE_API_KEY on the server — refuses with setup instructions when unconfigured).",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          count: { type: "number", default: 8 },
        },
        required: ["query"],
      },
      handler: (args) => webSearch(String(args.query), args.count !== undefined ? Number(args.count) : 8),
    },
    {
      name: "se_note",
      title: "se.note",
      description:
        "Capture a stray — an idea, a bug, a better way — without leaving the state (contract rule 4). Machine-local (.se/notes.jsonl), never committed; joins the mirror's log feed; drained at a retro, later. CAPTURING IS MEANT TO BE CHEAP: give it a title, judge the priority yourself, and keep walking. Never ask the person what a stray is worth.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string", description: "the body — leave it out when the title already says it" },
          title: { type: "string", description: "one line naming the stray; taken from the first line of text when absent" },
          priority: {
            type: "string",
            enum: ["must", "should", "could"],
            description: "MoSCoW. YOU judge it, never the person. Defaults to could.",
          },
        },
      },
      handler: (args) => {
        const title = args.title !== undefined ? String(args.title) : "";
        const text = args.text !== undefined ? String(args.text) : title;
        if (text.trim() === "") {
          throw new Rejection({
            clause: CLAUSES.REQUIRED_ARGS,
            expected: "text, or a title standing in for it",
            got: "neither",
            remedy: {
              tool: "se_note",
              args: { title: "<one line>", priority: "could" },
              note: "a title alone is a legal note — the body is what you add when one line is not enough",
            },
            source: "engine/tools.ts se_note",
          });
        }
        refuseProseWall("se_note", "text", text);
        return appendNote(seDir(projectRoot), text, "agent", title, args.priority as Priority | undefined);
      },
    },
    {
      name: "se_lint",
      title: "se.lint",
      description:
        "The VOICE LINT, on demand: mechanical prose checks (walls of text, long sentences, comma chains, dash chains, missing pyramid structure) over a text, a markdown file, or a whole GLOB of them. Rule parameters are DATA (machines/lint/voice-lint.md) - edit thresholds without recompiling. Catches FORM, never meaning. Self-check your outputs before they ship; sweep a tree with glob before it ships.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string", description: "prose to lint, verbatim" },
          path: { type: "string", description: "a root-relative .md file to lint instead" },
          glob: { type: "string", description: "sweep every markdown file matching this glob, e.g. project/guidance/**/*.md" },
        },
      },
      handler: (args) => {
        // THE ROOT-PICKER TAKES A PATH, and se_lint called it with none.
        // That is the whole of the 2026-08-14 defect: laneRoot(rel) already
        // chose the right tree per path kind, and this handler asked for the
        // default instead, so `.se/...` resolved into whatever worktree was
        // bound. The per-path calls are below; this one is only for lintProse,
        // which reads configuration rather than the file under test.
        const root = rootOf(LINT_CONFIG);
        // THE SWEEP. Linting one file at a time is why nothing was ever
        // linted: the tool could only be pointed at prose somebody already
        // suspected. Only files WITH findings come back, so a clean tree
        // answers small, and anything dropped is named rather than implied.
        if (args.glob !== undefined) {
          const g = model.glob(String(args.glob));
          const md = g.files.filter((f) => f.endsWith(".md"));
          // A STATE NOTE KEEPS ITS PROSE IN THE FRONTMATTER. `guidance` is
          // read by an agent on every single visit, so it is the prose that
          // matters most - and the lint had never seen a word of it, because
          // lintProse strips frontmatter before it starts.
          const lintFile = (p: string): { path: string; count: number; findings: unknown[] } => {
            // ONE PASS, and every finding already carries the key it is in.
            // This used to lint the file, then lint `guidance` and `statement`
            // AGAIN as separate strings — two passes, duplicate findings, and
            // only the two keys somebody remembered to list. lintProse reads
            // every prose key now and tags each finding with its own.
            // THROUGH THE SEAM (i27 seam-sweep, 2026-08-14). This used to
            // call resolveInRoot with se_lint's own ambient root, so a lint
            // run inside a record resolved `.se/...` into the worktree while
            // the file lane served the same path from the machine root.
            // Neither answer said which. resolve() picks the store from what
            // the path IS, so both lanes now reach one tree.
            const at = resolveSeam(rootOf(p), p, "engine/tools.ts se_lint");
            const raw = readFileSync(at.abs, "utf8");
            const findings: unknown[] = lintProse(root, raw, p);
            return { path: p, count: findings.length, findings };
          };
          const files = md.map(lintFile).filter((f) => f.count > 0);
          return {
            glob: String(args.glob),
            swept: md.length,
            ...(md.length < g.files.length ? { skipped_not_markdown: g.files.length - md.length } : {}),
            ...(g.truncated ? { truncated: true, note: "the glob hit its cap - narrow it and sweep the rest" } : {}),
            clean: md.length - files.length,
            files,
            count: files.reduce((n, f) => n + f.count, 0),
            config: LINT_CONFIG,
          };
        }
        if (args.path !== undefined) {
          const p = String(args.path);
          if (!p.endsWith(".md")) {
            throw new Rejection({
              clause: CLAUSES.REQUIRED_ARGS,
              expected: "a prose file (.md) - the voice lint never reads code",
              got: p,
              remedy: { tool: "se_lint", args: { path: "<file>.md" }, note: "or pass text directly" },
              source: "engine/tools.ts se_lint",
            });
          }
          // THROUGH THE SEAM, and the answer NAMES ITS STORE. This is the
          // exact call that answered ENOENT against a worktree on 2026-08-14
          // while se_file_read served the same path from the machine root.
          const at = resolveSeam(rootOf(p), p, "engine/tools.ts se_lint");
          const findings = lintProse(root, readFileSync(at.abs, "utf8"), p);
          return { path: p, store: at.store, findings, count: findings.length, config: LINT_CONFIG };
        }
        if (typeof args.text === "string") {
          const findings = lintProse(root, args.text);
          return { findings, count: findings.length, config: LINT_CONFIG };
        }
        throw new Rejection({
          clause: CLAUSES.REQUIRED_ARGS,
          expected: "text, path OR glob",
          got: "none of them",
          remedy: {
            tool: "se_lint",
            args: { glob: "project/guidance/**/*.md" },
            note: "text lints one block, path one file, glob a whole tree",
          },
          source: "engine/tools.ts se_lint",
        });
      },
    },
    {
      name: "se_answer",
      title: "se.answer",
      description:
        "Record an answered question (kind 'aq' in the log): the person's question and your answer, verbatim. The voice rule: EVERY direct question answered in chat is ALSO recorded here — chat can be lost mid-turn, the log never loses it. The feed line shows the question; clicking it shows both.",
      inputSchema: {
        type: "object",
        properties: {
          question: { type: "string", description: "the question, short form — becomes the feed line" },
          answer: { type: "string", description: "the answer, complete — shown on click" },
        },
        required: ["question", "answer"],
      },
      handler: (args) => {
        refuseProseWall("se_answer", "answer", String(args.answer));
        return { recorded: "aq", question: String(args.question).slice(0, 90) };
      },
    },
    {
      name: "se_note_drain",
      title: "se.note.drain",
      description:
        "Mark a note drained with its disposition. done | obsolete are MECHANICAL — superseded, already built, ruled on since — and drain wherever this tool is legal, the front desk included. carried | backlog are JUDGMENT and belong to the retro, which is the only place with the whole picture. backlog PARKS the note: where is REQUIRED as its 'ready when …' re-entry condition, and a later migration re-drains it. Drained notes leave the inbox count and the pending feed. An unknown ref is refused.",
      inputSchema: {
        type: "object",
        properties: {
          ref: { type: "string", description: "the note's ref (note-…)" },
          disposition: { type: "string", description: "done | obsolete | carried | backlog" },
          where: { type: "string", description: "where it landed or lives on — backlog REQUIRES it: ready when …" },
        },
        required: ["ref", "disposition"],
      },
      handler: (args) =>
        drainNote(
          seDir(projectRoot),
          String(args.ref),
          String(args.disposition),
          args.where === undefined ? undefined : String(args.where),
          judgmentDrainAllowed(),
        ),
    },
    {
      name: "se_survey",
      title: "se.survey",
      description:
        "WHAT STANDS OPEN — one mechanical call: open expeditions, open iterations, pending notes, and parked backlog items with their ready-when. Everything that can be up is here, so there is only ever ONE inbox to understand. Notes and backlog list as title plus MoSCoW priority, highest first; read any one in full with se_log_query {ref}. The front desk and the retro open with it. The person asks the same question in the mirror, from the machine's header.",
      inputSchema: {
        type: "object",
        properties: {
          detail: {
            type: "string",
            enum: ["full", "brief"],
            description: "full adds every note's whole body. The default lists title and priority only.",
          },
          limit: { type: "number", description: "window the notes list; counts stay complete and the result says what remains" },
          offset: { type: "number", description: "how many notes to skip — 0 is the oldest" },
        },
      },
      handler: (args) => ({
        ...survey(projectRoot, {
          ...(args.detail !== undefined ? { detail: String(args.detail) as "full" | "brief" } : {}),
          ...(args.limit !== undefined ? { limit: Number(args.limit) } : {}),
          ...(args.offset !== undefined ? { offset: Number(args.offset) } : {}),
        }),
        // THE DOORS RIDE THE SURVEY. The desk used to peek every idle door
        // in one tick call; the peek retired with the tick, and the survey
        // is where the desk already looks first — so the vocabulary the
        // advice needs arrives with the same call that lists the work.
        doors: doors(),
      }),
    },
    {
      name: "se_log_query",
      title: "se.log.query",
      description:
        "Query the call log (your own trail): filter by tool/ok/since/text, group_by a field, or fetch a se_run ref's full output. Pages NEWEST FIRST — offset 0 is the newest window, and the result says how many `older` records stand behind it.",
      inputSchema: {
        type: "object",
        properties: {
          ref: { type: "string", description: "fetch one record in full by ref" },
          filter: {
            type: "object",
            description:
              "{tool?, ok?, since?, text?, min_ms?} — since: an ISO timestamp, or 'last_retro' (everything after the previous retro, which is the newest carried/backlog drain — the desk cannot make those). text: a case-insensitive substring over the whole record, for finding a TOPIC without reading every hit. min_ms: only records at least this slow — the slowness mine over every door, one-second rule and all",
          },
          group_by: { type: "string", description: "e.g. 'tool' or 'outcome'" },
          limit: { type: "number", default: 20 },
          offset: { type: "number", description: "how many records back from the newest to start — 0 is the newest window" },
        },
      },
      handler: (args) => {
        const log = new CallLog(seDir(projectRoot));
        if (args.ref !== undefined) {
          const rec = log.find(String(args.ref));
          // A NOTE REF RESOLVES HERE TOO. Notes reference each other
          // constantly, and the referenced one is usually DRAINED, so the
          // survey cannot show it. This is already the by-ref lookup; making
          // it answer for notes costs no new tool and no new vocabulary.
          if (rec === undefined) {
            const note = readNotes(seDir(projectRoot)).find((n) => n.ref === String(args.ref));
            if (note !== undefined) return note;
          }
          if (rec === undefined) {
            throw new Rejection({
              clause: CLAUSES.REQUIRED_ARGS,
              expected: "an existing call ref, or a note ref",
              got: String(args.ref),
              remedy: { tool: "se_log_query", args: { limit: 20 }, note: "list recent calls to find the ref" },
              source: "engine/tools.ts se_log_query",
            });
          }
          return rec;
        }
        return log.query({
          ...(args.filter !== undefined ? { filter: args.filter as { tool?: string; ok?: boolean; since?: string } } : {}),
          ...(args.group_by !== undefined ? { group_by: String(args.group_by) } : {}),
          ...(args.limit !== undefined ? { limit: Number(args.limit) } : {}),
          ...(args.offset !== undefined ? { offset: Number(args.offset) } : {}),
        });
      },
    },
  ];
}

/** Build the server: session machine + tools + guards + the raw call log.
 *  Guard order: arg shape → THE STATE GATE → handler. Pass a Session to
 *  share it with another hand (the embedded mirror drives the SAME walk). */
/** THE PROSE-WALL LINT (owner law 2026-07-28): every HTML surface keeps
 *  line breaks — so long prose MUST carry them. An authored wall is refused
 *  at the tool boundary, mechanically. */
function refuseProseWall(tool: string, field: string, text: string): void {
  if (text.length <= 300 || text.includes("\n")) return;
  throw new Rejection({
    clause: CLAUSES.PROSE_WALL,
    expected: `${field} broken into lines — paragraphs and list lines survive every render`,
    got: `${text.length} chars without a single line break — renders as a wall`,
    remedy: {
      tool,
      args: { [field]: "<the same text with real line breaks>" },
      note: "shape it like prose: short paragraphs, one list item per line",
    },
    source: "engine/tools.ts prose-wall",
  });
}

// se_test's handed-off runs: the verdict outlives the CALL — recorded here,
// served by se_test {job}, whatever the client's timeout did.
// THE ON-CHANGE TYPECHECK (owner ruling 2026-08-03): a lane edit touching a
// .ts file kicks an incremental compile in the background, and while the
// tree is red every result carries typecheck_error. The EDIT itself is
// never refused — a two-file fix passes through a red middle; the
// pre-commit hook is where red blocks. Nothing here may throw.
const TYPECHECK: { running: boolean; dirty: boolean; report: string } = { running: false, dirty: false, report: "" };
function kickTypecheck(root: string): void {
  if (TYPECHECK.running) {
    TYPECHECK.dirty = true;
    return;
  }
  TYPECHECK.running = true;
  try {
    const child = spawn("npx", ["tsc", "-p", ".", "--pretty", "false"], {
      cwd: join(root, "project", "deliverable"),
      shell: true,
      windowsHide: true,
      stdio: ["ignore", "pipe", "ignore"],
    });
    let out = "";
    child.stdout?.setEncoding("utf8");
    child.stdout?.on("data", (c: string) => {
      out += c;
    });
    child.on("error", () => {
      TYPECHECK.running = false;
    });
    child.on("close", (code) => {
      TYPECHECK.report = code === 0 ? "" : out.trim().split("\n").slice(0, 8).join("\n");
      TYPECHECK.running = false;
      if (TYPECHECK.dirty) {
        TYPECHECK.dirty = false;
        kickTypecheck(root);
      }
    });
    child.unref();
  } catch {
    TYPECHECK.running = false;
  }
}
const EDIT_TOOLS = new Set(["se_file_write", "se_file_patch", "se_file_replace", "se_file_move"]);

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

/** THE VERDICT OUTLIVES THE CALL (found 2026-08-02: the battery outran
 *  the MCP client's timeout and the counts were lost). Past the
 *  handoff budget the caller gets a handle; the run carries on, the
 *  verdict is recorded, and {job} serves it. */
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

// `scopedFiles` IS GONE (owner ruling 2026-08-16). It turned the agent's
// `files` argument into a scope, and there is no such argument any more — the
// engine reads what changed and decides. `decideScope` in discipline.ts names
// the files, and they are already full paths.

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

export function buildServer(
  root: string,
  session = new Session(root),
  tollOpts: { windowMs?: number; now?: () => number } = {},
): McpServer {
  // WHERE AN OVERSIZED ANSWER SPILLS, so the bound can page rather than only
  // point. Machine-local and never committed.
  setAnswerSpill(seDir(root));
  // (a fresh Session fails fast on a misdrawn machine)
  const tools = [
    ...sessionTools(session),
    ...expeditionTools(session),
    ...coreTools(
      (rel) => session.laneRoot(rel),
      root,
      () => session.inRetro(),
      {
        path: Session.READING_PATH,
        build: () => session.buildReading(),
        credit: (offset, lines) => session.creditReading(offset, lines),
      },
      () => session.doors(),
      () => ({ session, root, lastPacket: undefined, mode: "manual" }),
      () => session.boundRecordId(),
    ),
  ];
  // WIRED HERE, NOT INSIDE coreTools. searchHelp needs the FULL assembled
  // catalog (session + expedition + core tools), which exists only once
  // the array above is built (dsp-help-search.md's own interface note).
  tools.push({
    name: "se_help",
    title: "se.help",
    description:
      "Search the lane's tools and guidance by plain words — ranked word-overlap over each tool's name/title/description and each guidance page's path/statement. A miss (zero matches) is appended to a durable ranked demand log; se_help {demands: true} reads that log back, grouped by shape, most-demanded first. Does not do synonym or stem matching, does not replace reading a tool's full schema, and does not search the codebase or the web — se_file_search and se_web_search do that.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "plain words — what you're trying to find" },
        demands: { type: "boolean", description: "true: return the ranked missing-tool demand log instead of searching" },
      },
    },
    handler: (args) => {
      if (args.demands === true) return { demands: rankDemand(root) };
      if (typeof args.query !== "string" || args.query.trim() === "") {
        throw new Rejection({
          clause: CLAUSES.REQUIRED_ARGS,
          expected: "se_help requires: query (or demands: true)",
          got: `received: ${Object.keys(args).join(", ") || "nothing"}`,
          remedy: {
            tool: "se_help",
            args: { query: "<plain words>" },
            note: "search with a query, or pass demands: true for the ranked miss log",
          },
          source: "engine/tools.ts se_help",
        });
      }
      return searchHelp(root, args.query, tools);
    },
  });
  // THE UPDATE FIELD — every lane tool accepts it: a decision-graph op
  // riding the call. Declared on every schema so harnesses send it as an
  // object (an undeclared property arrives as a JSON string — v2 lesson).
  const UPDATE_PROP = {
    type: "object",
    description:
      "decision-graph update riding this call — narrate as you work. {op: plan|fork|done|obsolete|revert|update, brief?, items?, node?}: plan {items} starts the state's checklist; fork {brief, items?} opens an unplanned branch where you are; done|obsolete|revert {node, brief} resolves a node — everything started gets resolved, silently abandoning is illegal; update {node, brief} says what you are doing ON an item — the node is REQUIRED while any item stands open, because an update that moves nothing on the checklist is narration, not progress (with nothing open, a bare update is right); defer {node, to} parks a point for the state that can do it — it arrives there as an open to-do. Every call answers with update_result, carrying the open node map and any nudge. A volunteered update resets the toll; when the toll lapses, the next call must carry one.",
  };
  for (const t of tools) (t.inputSchema.properties as Record<string, unknown>).update = UPDATE_PROP;
  const server = new McpServer(
    { name: "se-mcp", version: SE_VERSION },
    tools,
    requestContextAdapter({ workspaceId: `workspace-${contentHash(root)}` }),
  );
  const log = new CallLog(seDir(root));
  const toll = new Toll({ ...tollOpts, cadence: () => ({ minutes: session.narrationMinutes, calls: session.narrationCalls }) });

  // Session read buffer: live se_file_read results feed later tick proofs.
  // Reads at a git ref are intentionally excluded.
  server.addDecorator((tool, result) => {
    if (tool !== "se_file_read") return result;
    if (result === null || typeof result !== "object" || Array.isArray(result)) return result;
    const r = result as Record<string, unknown>;
    const remember = (o: Record<string, unknown>): void => {
      if (typeof o.path === "string" && typeof o.hash === "string") {
        session.rememberRead(o.path, o.hash, typeof o.ref === "string" ? o.ref : undefined);
      }
    };
    // A MULTI-READ IS STILL A READ. Only the single-path shape was
    // remembered, so a set fetched in one call proved nothing and every
    // later tick had to carry its hashes by hand.
    if (Array.isArray(r.files)) {
      for (const f of r.files) if (f !== null && typeof f === "object") remember(f as Record<string, unknown>);
      return result;
    }
    remember(r);
    return result;
  });

  // THE UPDATE RIDES FIRST — applied before any other verdict (the
  // narration stands even when the call itself is then refused), logged as
  // its own record, paying the toll. Stripped so handlers never see it.
  //
  // BUT A BAD UPDATE NEVER DESTROYS ITS CALL (owner ruling 2026-07-28).
  // Narration is commentary, and commentary that vetoes the act it comments
  // on has the causality backwards. A brief with one semicolon too many used
  // to reject the whole call and take the payload with it — a four-thousand
  // word answer, a four-file atomic patch, a finished note — all discarded
  // over the punctuation of a label riding alongside. Measured at the retro:
  // this mechanism caused 18 of 25 sampled refusals.
  //
  // The work lands. The complaint rides back on the result. And the toll goes
  // UNPAID, so the rule keeps its teeth — it just bites the narration now,
  // instead of the work.
  // METHOD CANNOT BE CHANGED FROM INSIDE A RECORD (owner ruling 2026-08-07).
  //
  // While a record is bound, laneRoot sends a METHOD write into that record's
  // worktree, and the fan-out pushes it from there to trunk. So editing
  // guidance or the engine while bound publishes the RECORD's copy over the
  // shared one. It happened twice in one afternoon, and the first time it ate
  // two lane verbs out of trunk's tool list.
  //
  // GUARDED AT DISPATCH, before the handler runs, so the whole call refuses
  // and nothing is half-written. A guard at the write sites would refuse
  // partway through a multi-file patch.
  const WRITE_TOOLS = new Set(["se_file_write", "se_file_patch", "se_file_replace", "se_file_delete", "se_file_move"]);
  // ANY WRITE CLEARS THE ROUTE MEMO. Which claims stand depends on the
  // evidence AND on the trace nodes that evidence references, so a node
  // repaired through the file lane can change the objective without any form
  // being touched.
  //
  // It wedged the walk on 2026-08-07: a broken node was fixed, the state went
  // green, and the router kept handing back the route to the state the walk
  // already stood in. Re-aiming could not shift it, because the key had not
  // changed either.
  //
  // Clearing here costs one recomputation after a write, which is precisely
  // when the answer may have moved.
  server.addGuard((tool) => {
    if (WRITE_TOOLS.has(tool)) session.forgetRoute();
  });
  // SE-C-134 STOOD HERE, and it is retired (owner ruling 2026-08-14).
  //
  // It refused a method write made from inside a record, because such a write
  // landed in the record's own worktree and then fanned out over trunk at the
  // merge. That really happened on 2026-08-07: it overwrote trunk's tool list
  // and deleted two lane verbs.
  //
  // THE REFUSAL IS REPLACED BY A RESOLUTION, never merely dropped. Shared
  // method now resolves to the MACHINE ROOT whatever tree is bound, in
  // session.laneRoot, which is what resolve.ts already said in storeFor. A
  // method write cannot land in a tree that does not own it, so there is
  // nothing left to refuse.
  //
  // WHAT IT COST WHILE IT STOOD: escape to the desk, edit, aim back, and a
  // 44-hop replay that timed out twice on the way in. Six times in one
  // session on 2026-08-14, and twice more the day it was removed.

  let updateComplaint: RejectionPayload | undefined;
  let updateRejection: Rejection | undefined;
  let updateResult: Record<string, unknown> | undefined;
  server.addGuard((tool, args) => {
    // EVERY EXTERNAL CALL IS A NEW DRAWING EPOCH — "the next call" is the
    // read-it-live law's unit, and pull alone was not enough: a gate check
    // on any other tool trusted a stamp from the previous call and went
    // stale for up to a second (caught by the battery, 2026-08-02).
    bumpDrawingEpoch();
    updateComplaint = undefined;
    updateRejection = undefined;
    updateResult = undefined;
    if (args.update === undefined) return;
    const raw = args.update;
    delete args.update;
    try {
      const { corrected, ...op } = parseUpdate(raw);
      const visit = session.currentVisit();
      const result = session.decisions.apply(visit, op);
      // BOTH HALVES CAN CORRECT AT ONCE — the parser (a chained brief) and
      // the apply (a closed node). Spreading would drop one silently.
      const notes = [(result as Record<string, unknown>).corrected, corrected].filter((c): c is string => typeof c === "string");
      updateResult = { ...(result as unknown as Record<string, unknown>), ...(notes.length > 0 ? { corrected: notes.join(" · ") } : {}) };
      log.append({ tool: "se_update", args: { via: tool, visit, ...op }, ok: true, outcome: "result", duration_ms: 0, response: result });
      toll.paid();
    } catch (e) {
      if (!(e instanceof Rejection)) throw e;
      updateRejection = e;
      updateComplaint = e.toJSON();
      log.append({
        tool: "se_update",
        args: { via: tool, refused: true },
        ok: false,
        outcome: "rejected",
        duration_ms: 0,
        response: updateComplaint,
      });
    }
  });

  // THE TOLL — armed after boot; one grace warning, then the refusal.
  // THE PAYMENT'S OWN REFUSAL OUTRANKS THE TOLL (note-c883db8c6e12): a call
  // that carried an update which failed to apply must hear what was wrong
  // with the payment — the bare toll clause sent five identical resends
  // into the same wall, live, on 2026-08-03.
  server.addGuard((tool, args) => {
    try {
      toll.check(session.isBooted(), tool, args);
    } catch (tollErr) {
      throw updateRejection ?? tollErr;
    }
  });

  // The grace warning rides the NEXT successful result (never a refusal).
  server.addDecorator((_tool, result) => {
    const w = toll.takeWarning();
    if (w === undefined || typeof result !== "object" || result === null || Array.isArray(result)) return result;
    return { ...(result as Record<string, unknown>), toll_warning: w };
  });

  // THE ON-CHANGE TYPECHECK'S REPORT rides every result while the tree is red.
  server.addDecorator((_tool, result) => {
    if (TYPECHECK.report === "" || typeof result !== "object" || result === null || Array.isArray(result)) return result;
    return { ...(result as Record<string, unknown>), typecheck_error: TYPECHECK.report };
  });

  // AND SO DOES THE ACCEPTED ONE (note-792c32b5425e item 5; the hole it
  // left was found live on 2026-07-29). The update's answer went only to
  // the LOG. So the node ids needed to resolve anything were invisible
  // unless you deliberately named a node that does not exist and read the
  // refusal — and the checklist nudge fired TEN times into a void, seen by
  // nobody, including the agent it was nudging.
  //
  // A guard nobody can hear is not a guard. It rides the result now.
  server.addDecorator((_tool, result) => {
    const u = updateResult;
    updateResult = undefined;
    if (u === undefined || typeof result !== "object" || result === null || Array.isArray(result)) return result;
    return { ...(result as Record<string, unknown>), update_result: u };
  });

  // The refused update rides home on the call it could not stop.
  server.addDecorator((_tool, result) => {
    const c = updateComplaint;
    updateComplaint = undefined;
    if (c === undefined || typeof result !== "object" || result === null || Array.isArray(result)) return result;
    return {
      ...(result as Record<string, unknown>),
      update_refused: {
        ...c,
        note: "THE CALL WENT THROUGH — this update did not. Carry a corrected one on your next call; the toll is unpaid until you do.",
      },
    };
  });

  // THE REPAIRED ARGUMENT NAME rides home on the call it saved.
  server.addDecorator((_tool, result) => {
    const r = argRepairs;
    argRepairs = undefined;
    if (r === undefined || typeof result !== "object" || result === null || Array.isArray(result)) return result;
    return { ...(result as Record<string, unknown>), arg_repaired: r };
  });

  // R8 + unknown-args: the declared shape is the accepted one (whitelist).
  const shapes = new Map(
    tools.map((t) => [
      t.name,
      {
        required: (t.inputSchema.required as string[] | undefined) ?? [],
        known: Object.keys((t.inputSchema.properties as Record<string, unknown>) ?? {}),
      },
    ]),
  );
  server.addGuard((tool, args) => {
    const shape = shapes.get(tool);
    if (shape === undefined) return;
    repairArgNames(tool, args, shape.known);
    // ABSENT means the key was not sent. NULL IS A VALUE (base_hash: null creates).
    const missing = shape.required.filter((k) => !(k in args) || args[k] === undefined);
    if (missing.length > 0) {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: `${tool} requires: ${shape.required.join(", ")}`,
        got: `missing: ${missing.join(", ")}${Object.keys(args).length > 0 ? ` (received: ${Object.keys(args).join(", ")})` : " (no arguments)"}`,
        remedy: {
          tool,
          args: Object.fromEntries(missing.map((k) => [k, "<value>"])),
          note: `this tool accepts: ${shape.known.join(", ")}`,
        },
        source: "engine/tools.ts required-args",
      });
    }
    const unknown = Object.keys(args).filter((k) => !shape.known.includes(k));
    if (unknown.length > 0) {
      throw new Rejection({
        clause: CLAUSES.UNKNOWN_ARGS,
        expected: `only: ${shape.known.join(", ")}`,
        got: `unknown argument${unknown.length > 1 ? "s" : ""}: ${unknown.join(", ")}`,
        remedy: {
          tool,
          args: {},
          note: unknown
            .map((k) => {
              const could = candidateArgs(k, args, shape.known);
              return could.length === 0 ? k : `${k} — did you mean ${could.join(" or ")}?`;
            })
            .join(" · "),
        },
        source: "engine/tools.ts unknown-args",
      });
    }
  });

  // THE STATE GATE — what is legal now is decided by the machine, not the
  // model. Runs after the shape guard so a malformed call is named as
  // malformed, not as illegal-in-state.
  server.addGuard((tool) => session.gate(tool));

  // §9 — the single call path logs everything. se_run keeps its full output.
  server.addObserver((rec) => {
    log.append({
      tool: rec.tool,
      args: rec.args,
      ok: rec.ok,
      outcome: rec.outcome,
      duration_ms: rec.duration_ms,
      response: rec.tool === "se_run" ? rec.response : capJson(rec.response),
    });
    if (rec.ok && EDIT_TOOLS.has(rec.tool) && JSON.stringify(rec.args ?? {}).includes(".ts")) kickTypecheck(root);
  });

  return server;
}

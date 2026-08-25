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
import { join } from "node:path";
import { benchmarkBind, benchmarkEnd } from "./benchmark.ts";
import { setAnswerSpill } from "./bound.ts";
import { CallLog, type CallPart, UNREPORTED } from "./calllog.ts";
import { parseUpdate } from "./decisions.ts";
import { CLAUSES, Rejection, type RejectionPayload } from "./errors.ts";
import { contentHash } from "./hash.ts";
import { rankDemand, searchHelp } from "./help.ts";
import { capJson } from "./jsonio.ts";
import { bumpDrawingEpoch } from "./machines/compile.ts";
import { McpServer, requestContextAdapter, type ToolDef } from "./mcp.ts";
import { ModelFileSystem } from "./model-fs.ts";
import { openPanel } from "./panel.ts";
import { seDir } from "./paths.ts";
import { produceProject, produceVehicle } from "./produce.ts";
import type { MirrorState } from "./render.ts";
import { noteAlive, runToCompletion, workAccount } from "./run.ts";
import { requiredDependsOn } from "./seed.ts";
import { type AmendOp, Session } from "./session.ts";
import { Toll } from "./toll.ts";
import { deskTools } from "./tools-desk.ts";
import type { ReadingHook } from "./tools-file.ts";
import { fileTools } from "./tools-file.ts";
import { queryTools } from "./tools-query.ts";
import { runTools } from "./tools-run.ts";
import { laneAge, SE_VERSION } from "./version.ts";

/** THE TICK — the machinery's one tool, legal in every state. */
export function sessionTools(session: Session): ToolDef[] {
  return [
    {
      name: "se_pull",
      title: "se.pull",
      description:
        'THE PULL — your only verb. Pull, do what comes back, pull again.\n\nThe machine owns the walk. You never name a target, a path or a state. Blocking is an instruction, not an error.\n\nFOUR ANSWERS, and `pull` names which one you got.\n\n- read — the document rides in `document`, and `prove` asks three fill-in-the-blank probes. Answer all three in one string: form: {"read": "..."}. Quote generously: the check is containment, and punctuation is not a word.\n- fill — the form rides in `forms`. Return it as form: {"<section>": "<text>"}. `submit: true` stamps it. `bless: true` or `bless: false` is the thumb on a gate. Neither key saves it unstamped, on purpose. A save clears an existing signature, so re-submit after any edit. The same form back with no problems means the bless is owed.\n- do — the happy path was walked for you, to the next branching point. `here` is where you landed. Doors ride in `options`; answer form: {"choice": "<to>"} only where a routed goal needs one.\n- wait — no work left, or the next step outweighs the dial. Say which step waits, then stop.\n\nA genuinely illegal call still refuses typed. Narrate with `update`; its own rules ride on that field.',
      inputSchema: {
        type: "object",
        properties: {
          form: {
            type: "object",
            description:
              'the form the LAST pull handed you. A reading proof {"read": "..."}, evidence {"<section>": "<text>", "submit": true}, or an offered choice {"choice": "<to>"} — a list where work fans out. Which one is never your call.',
          },
          escape: {
            type: "string",
            description:
              "step OUT with this reason, landing at the FRONT DESK where the person routes. Use it when the person says stop, when the walk is MECHANICALLY stuck, or when earlier work no longer stands. A question is not an escape: ask where you stand and stop. Boot cannot be escaped.",
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
              "light this surface instead of opening the panel, and leave it lit until the next ping: a card id (its title from deliverable/views/cards.md, slugged — e.g. state-machine, chat, log, details), the widget a card shows (machine, terminal), a drawn state id, or an element id",
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
        "Reload the engine onto the current sources — legal WHEREVER THE WALK STANDS. Canary-guarded: a tree that does not load is refused and the running engine survives. The reload reboots the walk (boot re-proves the engine green). Swaps NEVER fire on their own — this call, from either hand, is the only trigger.",
      inputSchema: { type: "object", properties: {} },
      handler: () => session.requestReload(),
    },
    // see dsp-write-guard.md#two-scripts-that-were-only-ever-reachable-through-the
    {
      name: "se_prompt_place",
      title: "se.prompt.place",
      description:
        "Re-project the prompt layer and project-owned skills from guidance/ into every supported harness path. Preflight names this script as its remedy when a projection is stale.",
      inputSchema: { type: "object", properties: {} },
      handler: async () =>
        runToCompletion(session.workRoot(), "node --experimental-strip-types deliverable/engine/bin/place-prompt-layer.ts"),
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
          `node --experimental-strip-types deliverable/engine/bin/format-vault.ts${args.check === true ? " --check" : ""}`,
          {},
        ),
    },
    // THE TWO PRODUCING ACTS, AS LANE VERBS (dsp-the-producing-acts).
    //
    // THE SHIPPED EXPORT IS A SCRIPT THE JAIL NEVER SEES, and its guards are
    // hand-written checks that nothing else inherits. Reaching the acts through
    // the lane makes them logged, refused before they half-produce, and bounded
    // by the tree they are producing — which is what a button can be built on.
    {
      name: "se_produce_vehicle",
      title: "se.produce.vehicle",
      description:
        "MAKE A VEHICLE — a complete independent copy of this system under a new name, in a repository of its own. It copies the tree, leaves this tree's own records at home, writes the new name once, records the identity it came from, and makes one commit. IT REACHES THE ORIGINAL BY NO MECHANISM AT ALL: the upstream file names an identity and a version, never an address, so there is nothing to fetch from and nothing to push to. REFUSES BEFORE WRITING ANYTHING if the destination is not empty, or a name or abbreviation is missing — there is no fallback to this product's own name, because a forgotten argument would ship it to somebody else under ours.",
      inputSchema: {
        type: "object",
        properties: {
          dest: { type: "string", description: "an EMPTY folder to produce into, or one that does not exist yet" },
          name: { type: "string", description: "what to call it, e.g. 'Blue Heron'" },
          abbr: { type: "string", description: "two or three letters, e.g. BH" },
        },
        required: ["dest", "name", "abbr"],
      },
      handler: async (args) =>
        produceVehicle(
          session.workRoot(),
          { dest: String(args.dest), name: String(args.name), abbr: String(args.abbr) },
          "se_produce_vehicle",
        ),
    },
    {
      name: "se_produce_project",
      title: "se.produce.project",
      description:
        "MAKE A PROJECT THIS SYSTEM DRIVES — a tree for work that is not the system's own, carrying none of the method and one record saying which copy drives it. The record names an identity and a version, NEVER a path, so moving either tree changes nothing. A tree with no such record is not a driven project, and the system says so rather than guessing. REFUSES BEFORE WRITING ANYTHING if the destination is not empty or the name is missing.",
      inputSchema: {
        type: "object",
        properties: {
          dest: { type: "string", description: "an EMPTY folder to produce into, or one that does not exist yet" },
          name: { type: "string", description: "what to call the project" },
        },
        required: ["dest", "name"],
      },
      handler: async (args) =>
        produceProject(session.workRoot(), { dest: String(args.dest), name: String(args.name) }, "se_produce_project"),
    },
    {
      name: "se_aim",
      title: "se.aim",
      description:
        "AIM THE WALK at a state AND BE CARRIED THERE, in this one call. The machine draws the route and walks every hop whose conditions already pass, stopping only where something is genuinely owed — so a state that is already green is walked THROUGH, never landed on, and re-entering a long record costs ONE call rather than a pull per state. Name any state in the machine you stand in, or a fully qualified one like iterations/i1/write-requirements. GOING IS THE DEFAULT (owner ruling 2026-08-20): re-aiming one state at a time relitigates hops the machine would have walked through, and going is as safe as pulling — the sweep still refuses whatever the conditions and the dial refuse. The answer says whether it ARRIVED; stopped short, it stands whole on the state that owes something, never between two. IT ALSO SAYS WHAT IT COST: `swept_ms` names each hop and its milliseconds, and `visited` says how many states the search looked at. Read those rather than timing the call yourself.",
      inputSchema: {
        type: "object",
        properties: {
          to: { type: "string", description: "the state to aim at — the route is drawn to it and walked in this call" },
          go: {
            type: "boolean",
            description:
              "DEFAULT TRUE — the machine walks the route in this call. Pass false to only set the direction and leave the walking to the next pull; that is almost never what you want.",
          },
        },
        required: ["to"],
      },
      handler: async (args) => {
        // A BARE AIM DRAWS AND DOES NOT WALK. The drawing answers whether the
        // target is reachable; the sweep is what pointing must not pay for.
        // see req-aiming-returns-before-the-walking-starts
        const aimed = session.setTarget(String(args.to));
        if (args.go === false) return aimed;
        // req-a-clear-jump-is-one-call: the caller named the target, and going
        // is the default — see guidance/walking.md's jump rule — so the sweep
        // runs here rather than waiting for a pull. The sweep is time-bounded,
        // so this answers whether or not the whole route fits. go: false opts
        // out for the rare call that only sets direction.
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
        "Fix a submitted form without reopening it. Patch fields with ops:[{field, old_string, new_string}], the shape se_file_patch takes.\n\nFor a correction that does not change what the claim says: a renamed reference, a moved path, a typo. The signature stays, and the amend is recorded on the file.\n\nEvery check still runs. An amend that breaks one is refused, the file is put back untouched, and se_reopen is named instead.",
      inputSchema: {
        type: "object",
        properties: {
          state: { type: "string", description: "the state whose submitted form is being corrected" },
          ops: {
            type: "array",
            description:
              "patch a field in place: {field, old_string, new_string, all?}. old_string must match EXACTLY ONCE or the op refuses. all: true replaces every occurrence. Ops chain.",
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
              "rewrite fields WHOLE, as {field: text}. Prefer ops for a small correction. A fills entry wins over an op on the same field.",
          },
          reason: { type: "string", description: "what was wrong — one line, and the file keeps it" },
          machine: { type: "string", description: "which machine the state belongs to — needed from outside it, e.g. i1" },
          chain: {
            type: "boolean",
            description:
              "NOT IMPLEMENTED, accepted and ignored. Documented rather than removed so nobody rebuilds it from the same wrong premise. See note-380d789f6f85.",
          },
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
          args.chain === true,
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
        "Seed an expedition: kind (spike | fix | explore), goal, and depends_on — the ids it WAITS FOR, which is the container's DAG and the only thing stopping two agents being handed the same files. An empty list is legal and states that it waits for nothing; omitting the key refuses, because a silence and a decision must not be the same bytes on disk. The seed mints a record folder on trunk and nothing else (i34): no branch and no push. It stands in the expeditions container at once — entering there binds it.",
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
        "Seed an iteration: goal, rough vision, input refs, and depends_on — the ids it WAITS FOR, which is the container's DAG and the only thing stopping two agents being handed the same files. An empty list is legal and states that it waits for nothing; omitting the key refuses, because a silence and a decision must not be the same bytes on disk. Naming another open iteration draws the edge dep -> this, so the drawing shows the real shape (independent ones side by side, dependent ones in series) AND the walk refuses to enter this one until that dependency leaves the open set. The seed mints a record folder on trunk and nothing else (i34): no branch and no push. It stands in the iterations container in M0 — the retro onboards, the kickoff proposes a size, and the bless pins the rest. No size is asked at the seed.",
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
      name: "se_park",
      title: "se.park",
      description:
        "SET THE OPEN RECORD ASIDE, so another can be entered. One engine walks one record; wanting two at once means a second checkout.\n\nIT IS NOT A VERDICT. Shipping would claim gates that never happened and abandoning would say the work is no longer wanted. Parking says neither: entering the record again resumes it exactly as it was, with every signature standing.\n\nTHE REASON IS RECORDED on the record itself, so the archive shows why it was set down.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "the record to set aside; omit to park whichever one is held" },
          why: { type: "string", description: "why it is being set down, in one line" },
        },
        required: ["why"],
      },
      handler: (args) => session.recordPark(args.id === undefined ? undefined : String(args.id), String(args.why)),
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

// see dsp-lane-door.md#rootof-takes-the-path-because-one-lane-serves-two

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
/** Every field an array argument's items declare, mapped to the argument that
 *  holds them — so an unknown top-level key can be told where it does belong. */
function nestedFields(properties: Record<string, unknown> | undefined): Map<string, string> {
  const out = new Map<string, string>();
  for (const [arg, spec] of Object.entries(properties ?? {})) {
    const items = (spec as { items?: { properties?: Record<string, unknown> } }).items;
    for (const field of Object.keys(items?.properties ?? {})) if (!out.has(field)) out.set(field, arg);
  }
  return out;
}

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

export function coreTools(
  rootOf: (rel?: string) => string,
  projectRoot: string,
  judgmentDrainAllowed: () => boolean = () => true,
  reading?: ReadingHook,
  doors: () => Record<string, unknown>[] = () => [],
  mirror?: () => MirrorState,
  /** WHICH RECORD IS BOUND, for the minted_in stamp. The walk is asked, never
   *  a path. Defaults to nothing, which stamps nothing, exactly as writing
   *  outside a record always did. */
  boundRecord: () => string | undefined = () => undefined,
  /** WHERE THE WALK STANDS, threaded to runTools so a spawned job can be
   *  stamped with its milestone at registration without the caller declaring
   *  one. */
  positionOf: () => string = () => "",
  // `whereNow` IS DELETED (i6). It existed for one caller: the battery refusal
  // that asked WHERE the walk stood before deciding whether an agent-initiated
  // battery was legal. The owner's ruling moved that decision into the engine
  // — the agent asks for a test and `decideScope` reads what CHANGED — so the
  // position stopped being an input and the parameter stopped being read.
): ToolDef[] {
  const model = new ModelFileSystem(rootOf, boundRecord);
  return [
    {
      name: "se_benchmark",
      title: "se.benchmark",
      description:
        "OPEN OR CLOSE A BENCHMARK RUN. A run re-walks an ARCHIVED iteration from the commit before that iteration started, so what the machine costs can be measured against the walk that really happened.\n\nName an iteration, or name none and the one benchmarked longest ago is taken. Runs cycle rather than repeat.\n\nA RUN BINDS OR IT REFUSES, once, at the earliest point the cause is knowable: no iteration, no rewind point, an empty tree, or a failed positive control. It never binds and then refuses per request.\n\n{stop: true} ends the open run and records WHERE IT ACTUALLY ENDED. A run that died still leaves a result.\n\nIT MEASURES PROCESS OVERHEAD UNDER OBSERVATION, never production behaviour and never the quality of a decision: the agent is told it is walking a benchmark. Never compare two single runs. Report a median over at least three, with the spread.",
      inputSchema: {
        type: "object",
        properties: {
          iteration: {
            type: "string",
            description: "the archived iteration to re-walk \u2014 omit it and the one benchmarked longest ago is taken",
          },
          stop_at: {
            type: "string",
            description:
              "where the run should stop \u2014 the WHOLE WALK is the default, and a stop point is a narrowing somebody asked for",
          },
          stop: {
            type: "boolean",
            description: "end the open run and record where it actually ended",
          },
          ended_at: {
            type: "string",
            description: "with stop: the state the run actually ended in, recorded even when it equals stop_at",
          },
        },
      },
      handler: (args) => {
        if (args.stop === true) return benchmarkEnd(projectRoot, args.ended_at === undefined ? "" : String(args.ended_at));
        return benchmarkBind(projectRoot, {
          ...(args.iteration === undefined ? {} : { iteration: String(args.iteration) }),
          ...(args.stop_at === undefined ? {} : { stop_at: String(args.stop_at) }),
        }) as unknown as Record<string, unknown>;
      },
    },

    ...fileTools(rootOf, model, reading),
    ...runTools(rootOf, projectRoot, reading, mirror, positionOf),
    ...deskTools(rootOf, projectRoot, model, judgmentDrainAllowed, reading, doors, mirror),
    ...queryTools(rootOf),
  ];
}

// see dsp-lane-door.md#setests-handed-off-runs
const TYPECHECK: { running: boolean; dirty: boolean; report: string } = { running: false, dirty: false, report: "" };
function kickTypecheck(root: string): void {
  if (TYPECHECK.running) {
    TYPECHECK.dirty = true;
    return;
  }
  TYPECHECK.running = true;
  try {
    const child = spawn("npx", ["tsc", "-p", ".", "--pretty", "false"], {
      cwd: join(root, "deliverable"),
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
      () => session.currentState(),
    ),
  ];
  tools.push({
    name: "se_stop",
    title: "se.stop",
    description:
      "FORCE A STOP THE TOOTH REFUSED, on the record.\n\nWHEN TO REACH FOR IT. The stop hook blocked your turn and you judge that one of the sanctioned stops genuinely applies. Say which one, and why, and stop again.\n\nWHY IT IS A CALL AND NOT A SENTENCE. The hook cannot read your message — it reads the call log. Saying which stop applies in chat proved nothing to it, and the retry flag the harness sets proved nothing either, because you did not choose it.\n\nONE FORCE RELEASES ONE STOP. The next se_pull spends it, so this is a decision rather than a switch you leave on.\n\nIT DOES NOT MOVE THE WALK. The walk stands exactly where it stood; only the turn ends.\n\nNOT AN ESCAPE. se_pull {escape} lands the walk at the front desk because you are mechanically stuck. This ends a turn and changes nothing.",
    inputSchema: {
      type: "object",
      properties: {
        because: { type: "string", description: "which sanctioned stop applies, and why — one line" },
      },
      required: ["because"],
    },
    handler: (args) => {
      const because = typeof args.because === "string" ? args.because.trim() : "";
      if (because === "") {
        throw new Rejection({
          clause: CLAUSES.REQUIRED_ARGS,
          expected: "se_stop requires: because — which sanctioned stop applies, and why",
          got: `received: ${Object.keys(args).join(", ") || "nothing"}`,
          remedy: {
            tool: "se_stop",
            args: { because: "<which sanctioned stop, and why>" },
            note: "an unreasoned force is the thing this replaces — the reason is the whole point",
          },
          source: "engine/tools.ts se_stop",
        });
      }
      return {
        forced: because,
        note: "the next stop is released once. A pull spends this, so force again if you pull first.",
      };
    },
  });
  // WIRED HERE, NOT INSIDE coreTools. searchHelp needs the FULL assembled
  // catalog (session + expedition + core tools), which exists only once
  // the array above is built (dsp-help-search.md's own interface note).
  tools.push({
    name: "se_help",
    title: "se.help",
    description:
      "Search the lane's tools and guidance by plain words.\n\nWHAT IS SEARCHED. Every tool's name, title and full description. Every guidance page, INCLUDING METHOD CARDS AND THE REFUSALS PAGE, split at its own headings — so an answer names the section, not just the file. Asking about one refusal clause lands on that clause.\n\nHOW IT RANKS. BM25, the same ranker the coupling proposer uses. A word appearing everywhere counts for almost nothing; a rare one counts for a lot. A name match outranks the same word buried in prose.\n\nWHEN IT SAYS NOTHING. An answer must cover most of your words AND share at least one uncommon word with you. Coincidence on common words is a miss, not a match.\n\nA MISS IS RECORDED. It lands in a durable demand log; se_help {demands: true} reads that back, grouped by shape, most-demanded first.\n\nWHAT IT IS NOT. No synonyms and no stemming. Not a substitute for a tool's full schema. Not a code or web search — se_file_search and se_web_search do that.",
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
  const UPDATE_FULL = {
    type: "object",
    description:
      'NARRATE AS YOU WORK — a decision-graph op riding this call. Every lane tool takes it.\n\nWHAT TO SEND, and each op is one line:\n  - plan {items} — start the state\'s checklist. Send this BEFORE your first edit of any multi-step work.\n  - update {node, brief} — say what you are doing ON an item. The node is REQUIRED while any item stands open; with nothing open, a bare update is right.\n  - done | obsolete | revert {node, brief} — resolve a node. Everything started gets resolved. Abandoning one silently is illegal.\n  - fork {brief, items?} — an unplanned branch opens where you stand, and the current item cannot continue until it is done. Scope that merely GREW is another plan, not a fork.\n  - defer {node, to} — park a point for the state that can do it. It arrives there as an open to-do.\n\nTHE FIRST ONE IS ALWAYS A PLAN. Example: update: {op: "plan", items: ["read the record", "fill the gate", "submit"]}.\n\nTHE BRIEF IS ONE LINE, 90 characters, one thing.\n\nEvery call answers with `update_result`, carrying the open node map and any nudge. A volunteered update resets the toll; when the toll lapses, the next call must carry one.',
  };
  // THE PROSE RIDES ONCE, ON se_pull. Stamping it on every tool made the same
  // 1,206 characters half of the entire tool surface. What the v2 lesson above
  // needs is the DECLARATION on every schema, never the prose, so every other
  // tool carries a pointer instead and the typing is untouched.
  const UPDATE_REF = {
    type: "object",
    description: "Narration op riding this call: {op, brief?, items?, node?}. Ops and rules: see se_pull.",
  };
  // WHICH HAND IS CALLING — req-every-call-records-the-part-its-caller-played.
  // It rides every lane tool for the same reason `update` does: the answer is
  // about the CALL rather than about any one verb, and a coordinate a caller
  // can only supply on some verbs is a coordinate the log cannot be grouped by.
  const AS_PROP = {
    type: "string",
    enum: ["owner", "walker", "guide", "reviewer", "surface"],
    description:
      "WHICH PART YOU ARE PLAYING. Omit it and the record says `walker`, which is right for the hand holding the session and making the daily calls.\n\nSAY `guide` WHEN YOU ARE THE HAND THAT WAS ASKED. A guide is delegated one step — a question, a comparison, a decision the walker will not take alone — and it says so, because a default of `guide` would let the strong hand's work hide in the weak hand's count.\n\nTHE VALUE IS RECORDED AS A CLAIM. Nothing here can check it: one dispatcher serves every agent, so the lane cannot tell two hands apart on its own.",
  };
  const RELAYED_BY_PROP = {
    type: "string",
    enum: ["owner", "walker", "guide", "reviewer", "surface"],
    description:
      "WHO IS FILING WORK SOMEBODY ELSE DID. Send `as` naming the AUTHOR and this naming yourself.\n\nUSE IT WHENEVER YOU CARRY A DELEGATE'S ANSWER BACK. A guide that works the lane itself needs neither key. A walker that types a guide's judgment into a form needs both, or the record says the walker decided what the guide decided.\n\nIT MAY NOT EQUAL `as`. A record where the author and the relayer agree is a contradiction rather than a redundancy, and it is refused.",
  };
  const NAMED_DRIVER_PROP = {
    type: "string",
    description:
      "THE STRENGTH THIS STEP WAS TOLD IT NEEDS, as the machine published it. Send it back on the calls you make while walking that step, so the record can compare what was named against what answered without reconstructing either side.\n\nSENDING IT ARMS THE ASYMMETRY. A record carrying a named driver and no reason takes a mark saying a reason was owed and not given.",
  };
  const WENT_WEAKER_PROP = {
    type: "boolean",
    description:
      "SAY SO WHEN A WEAKER HAND THAN NAMED WALKED THIS STEP. Nothing here can work it out: `named_driver` is a rung and `answered_by` is a model name, and no mapping between them exists in this tree.\n\nSENDING IT WITHOUT `weaker_reason` MARKS THE RECORD `unreasoned`. A stronger hand than named needs no argument, so leaving this off is the ordinary case and costs nothing.",
  };
  const WEAKER_REASON_PROP = {
    type: "string",
    description:
      "WHY A WEAKER HAND WALKED THIS STEP. A stronger hand than named needs no argument; a weaker one needs this sentence — req-a-weaker-driver-than-named-owes-a-recorded-reason.\n\nIT IS MARKED, NEVER REFUSED. Omitting it does not stop the call; it stamps the record `unreasoned`, so a walk that talked itself into staying cheap is visible instead of indistinguishable.",
  };
  const ANSWERED_BY_PROP = {
    type: "string",
    description:
      "WHAT MODEL ACTUALLY SERVED THIS CALL, not what was asked for — the two differ in practice and the difference is the interesting case.\n\nOMIT IT AND THE RECORD SAYS `unreported`, which is a declared absence rather than a missing field.\n\nTHE VALUE IS RECORDED AS A CLAIM. The transport hands the engine a client name and no model, so the only party who knows is the party being measured.",
  };
  for (const t of tools) {
    const props = t.inputSchema.properties as Record<string, unknown>;
    props.update = t.name === "se_pull" ? UPDATE_FULL : UPDATE_REF;
    props.as = AS_PROP;
    props.relayed_by = RELAYED_BY_PROP;
    props.answered_by = ANSWERED_BY_PROP;
    props.named_driver = NAMED_DRIVER_PROP;
    props.weaker_reason = WEAKER_REASON_PROP;
    props.went_weaker = WENT_WEAKER_PROP;
  }
  const server = new McpServer(
    { name: "se-mcp", version: SE_VERSION },
    tools,
    requestContextAdapter({ workspaceId: `workspace-${contentHash(root)}` }),
  );
  server.setAnswerSpillDir(seDir(root));
  const log = new CallLog(seDir(root));
  const toll = new Toll({
    ...tollOpts,
    cadence: () => ({ minutes: session.narrationMinutes, calls: session.narrationCalls }),
    openNodes: () => session.decisions.openNodeIds(),
  });

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

  // The update rides first and is stripped before the handler. see dsp-lane-door.md#a-bad-update-never-destroys-its-call
  const WRITE_TOOLS = new Set(["se_file_write", "se_file_patch", "se_file_replace", "se_file_delete", "se_file_move"]);
  // see dsp-lane-door.md#any-write-clears-the-route-memo
  server.addGuard((tool) => {
    if (WRITE_TOOLS.has(tool)) session.forgetRoute();
  });
  // see dsp-lane-door.md#method-cannot-be-changed-from-inside-a-record

  let updateComplaint: RejectionPayload | undefined;
  let updateRejection: Rejection | undefined;
  let updateResult: Record<string, unknown> | undefined;
  server.addGuard((tool, args) => {
    // see dsp-lane-door.md#every-external-call-is-a-new-drawing-epoch
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
      log.append({
        tool: "se_update",
        args: { via: tool, visit, ...op },
        actor: "agent",
        // THE CALL'S OWN COORDINATES, NOT THE UPDATE PAYLOAD'S. This read
        // `raw` — the {op, node, brief} object — so an `se_update` record took
        // its part and its answering model out of a place they never appear.
        // Every one of them said `walker` and `unreported` however the caller
        // declared itself, and a coordinate placed INSIDE the update object
        // reached the record while bypassing the vocabulary guard entirely.
        // `se_update` is the second most common tool in the log.
        //
        // FOUND BY A RED TEAM AT i38's implementation gate, by probing rather
        // than reading: `as: "guide"` on the call, `walker` on the record.
        ...whichHand(session, args),
        ok: true,
        outcome: "result",
        duration_ms: 0,
        response: result,
      });
      toll.paid();
      // A DELEGATED HAND'S CHECKLIST IS ITS PROGRESS BAR. A `plan` says how many
      // steps there are; a resolution says one landed. That is the only
      // countable thing a spawned hand ever emits, and the work table's
      // estimate is built from it.
      //
      // THE GUIDE'S OWN UPDATES ARE EXCLUDED ON PURPOSE. This session is not a
      // background job, so counting its narration would advance whichever hand
      // happened to be newest and report its manager's pace as its own.
      const counted = whichHand(session, args).part;
      if (counted === "walker" || counted === "reviewer" || counted === "researcher") {
        const items = (op as { items?: unknown }).items;
        const said = (op as { brief?: unknown }).brief;
        noteAlive(
          (op as { op?: string }).op,
          Array.isArray(items) ? items.length : undefined,
          counted,
          typeof said === "string" ? said : undefined,
        );
      }
    } catch (e) {
      if (!(e instanceof Rejection)) throw e;
      updateRejection = e;
      updateComplaint = e.toJSON();
      log.append({
        tool: "se_update",
        args: { via: tool, refused: true },
        actor: "agent",
        ...whichHand(session, args),
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
  // into the same wall, live,.
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

  // NOTES SINCE THE WALK LAST MOVED — see dsp-narration.md#the-toll for the
  // sibling idea. A pull that answers resets it; anything else leaves it be,
  // because a note taken between two real acts is the verb working.
  //
  // WHY A BANNER AND NOT A REFUSAL. Capturing a stray is meant to be cheap and
  // must never be the thing that fails, or the thought is lost. What the loop
  // needs is to be TOLD, once, that it is in one.
  let notesSinceMove = 0;
  server.addDecorator((tool, result) => {
    if (tool === "se_pull") {
      notesSinceMove = 0;
      return result;
    }
    if (tool !== "se_note") return result;
    notesSinceMove += 1;
    if (notesSinceMove < 5) return result;
    if (typeof result !== "object" || result === null || Array.isArray(result)) return result;
    const banner =
      notesSinceMove >= 10
        ? `${notesSinceMove} notes and the walk has not moved. This is a loop, and notes are not the way out of it. Pull. If the pull refuses, its remedy is the next call — not another note.`
        : `${notesSinceMove} notes since the walk last moved. A note is not a move: se_pull is. Capture the stray, then pull.`;
    return { ...(result as Record<string, unknown>), banner };
  });

  // THE LANE SAYS HOW OLD IT IS, ONCE, ON A PULL.
  //
  // The process loaded the engine at start and Node cached it. Every engine
  // change a walk makes is invisible to that same walk, and nothing said so —
  // a box was measured serving 5.0.0 out of a tree that said 6.0.0 all day.
  //
  // ONE COMPARISON, AND IT ONLY EVER PROVES THE BAD CASE. A differing version
  // means stale for certain; a matching one means nothing, because most engine
  // edits never touch the manifest. Said once: a banner on every call is
  // furniture within the hour.
  //
  // THE SLIDERS COMING UP AT THEIR DEFAULTS is the other thing a first pull
  // should say. The settings store is stamped with the shim's session token and
  // restores only on a match — a reload keeps the sliders, a fresh start takes
  // the defaults, deliberately. What was missing is anyone saying so: a dial at
  // default reads exactly like a dial the person set low, and the refusal it
  // later produces says the hand is too small rather than that it was reset.
  // Four calls went into auditing a correct form for want of this sentence.
  //
  // BOTH RIDE ONE KEY, so they are joined. Two decorators each setting
  // `banner` would mean the second silently ate the first.
  let ageAnnounced = false;
  server.addDecorator((tool, result) => {
    if (tool !== "se_pull") return result;
    if (typeof result !== "object" || result === null || Array.isArray(result)) return result;
    const notices: string[] = [];
    const age = laneAge();
    if (age.stale && !ageAnnounced) {
      ageAnnounced = true;
      notices.push(
        // A BANNER SAYS WHAT TO DO, NOT WHY THE MECHANISM WORKS. This one used
        // to explain Node's module cache, what a green battery does and does
        // not prove, and how the canary load behaves. None of that is
        // actionable, and the reader is trying to start work.
        `THE RUNNING LANE IS OLDER THAN THE CODE ON DISK. It serves ${age.served}; the tree is at ${age.on_disk}. Engine changes since then are invisible here, including any this walk made. Run se_reload at idle to restart it onto these sources.`,
      );
    }
    // THE STALE-SETTINGS BANNER IS STRUCK (owner). It explained an
    // earlier lane, a settings store and a design decision, to a person who
    // had just opened the system and wanted to work. A banner is for something
    // the reader must ACT on, and there was nothing to act on.
    //
    // The flag is still taken so it does not accumulate.
    session.takeStaleSettings();
    if (notices.length === 0) return result;
    return { ...(result as Record<string, unknown>), banner: notices.join("\n\n") };
  });

  // THE ON-CHANGE TYPECHECK'S REPORT rides every result while the tree is red.
  server.addDecorator((_tool, result) => {
    if (TYPECHECK.report === "" || typeof result !== "object" || result === null || Array.isArray(result)) return result;
    return { ...(result as Record<string, unknown>), typecheck_error: TYPECHECK.report };
  });

  // THE ACCOUNT RIDES BESIDE THE ANSWER, never replacing it. The caller asked
  // for something and gets it unchanged; `work` is a second field.
  // An EMPTY ACCOUNT IS AN EMPTY LIST, never an absent field — absent cannot be
  // told apart from a build that never emitted one.
  // see dsp-the-work-account.md#interface
  // AND IT RIDES A REFUSAL TOO — the one answer where a caller most needs to
  // know a judgment is still in flight, because the condition that refused it
  // is often the very check still running. It reads and spends nothing, which
  // is what makes it safe to run there.
  server.addDecorator(
    (_tool, result) => {
      if (typeof result !== "object" || result === null || Array.isArray(result)) return result;
      return { ...(result as Record<string, unknown>), work: workAccount(root) };
    },
    { onRefusal: true },
  );

  // see dsp-write-guard.md#and-so-does-the-accepted-one
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
        // WHERE A KEY BELONGS, when it does not belong at the top. An array
        // argument's items declare their own fields, and a caller carrying a
        // habit from a sibling verb puts one of those beside the array
        // instead of inside it. Measured on the i15 walk: se_file_patch was
        // called with a top-level `path`, which is exactly right for
        // se_file_read and se_file_write and wrong here. The refusal named
        // the key and not the place, so the fix was still a guess.
        nested: nestedFields(t.inputSchema.properties as Record<string, unknown> | undefined),
      },
    ]),
  );
  // THE HAND A CALLER DECLARES IS CHECKED HERE AND NOT AT THE LOG.
  //
  // WHY IT MOVED. `CallLog.append` refuses a part outside the closed
  // vocabulary, which is right — but the dispatch's log hook catches and
  // discards whatever the append throws, because a log hook must never break
  // dispatch. So a call carrying `as: "sorcerer"` was ANSWERED NORMALLY and
  // never reached calls.jsonl. Refusing the CALL is correct; losing the RECORD
  // is not, and req-every-call-logged is unconditional.
  //
  // FOUND BY A FRESH-EYES TESTER AT i38's verification, by probing the lane
  // rather than by reading the check — the case that was supposed to hold this
  // asserted on `append` directly, and the property is false one layer up.
  server.addGuard((tool, args) => {
    for (const key of ["as", "relayed_by"] as const) {
      const v = args[key];
      if (v === undefined) continue;
      if (typeof v !== "string" || !PART_WORDS.has(v)) {
        throw new Rejection({
          clause: CLAUSES.UNKNOWN_ARGS,
          expected: `${key} is one of: ${[...PART_WORDS].join(", ")}`,
          got: `${key}: ${JSON.stringify(v)}`,
          remedy: {
            tool,
            args: { [key]: "walker" },
            note: "omit it and the record says `walker`, which is right for the hand holding the session",
          },
          source: "engine/tools.ts which-hand",
        });
      }
    }
    // THE COMPARISON IS ON THE RESOLVED PARTS, NOT THE RAW ARGUMENTS. It read
    // `args.relayed_by === args.as`, and `as` is undefined when the caller
    // omits it — so `relayed_by: "walker"` with no `as` passed the guard, the
    // part defaulted to `walker`, and the log's own rule then threw inside the
    // observer. The dispatch swallows an observer's throw, so the record
    // vanished. On a REFUSED call it took the refusal record with it, which is
    // exactly the defect this guard was added to close.
    //
    // FOUND BY A RED TEAM AT i38's implementation gate.
    const partNow = typeof args.as === "string" ? args.as : "walker";
    if (args.relayed_by !== undefined && args.relayed_by === partNow) {
      throw new Rejection({
        clause: CLAUSES.UNKNOWN_ARGS,
        expected: "relayed_by to name a DIFFERENT part from the one filing — it says who FILED work somebody else authored",
        got: `both are ${JSON.stringify(partNow)}${args.as === undefined ? " (`as` omitted, so the part is `walker`)" : ""}`,
        remedy: {
          tool,
          args: {},
          note: 'a guide filing its own work needs neither key; a walker relaying a guide\'s work sends as: "guide", relayed_by: "walker"',
        },
        source: "engine/tools.ts which-hand",
      });
    }
  });

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
              const inside = shape.nested.get(k);
              if (inside !== undefined) return `${k} belongs INSIDE each ${inside}, not beside it — send ${inside}: [{ ${k}: ..., ... }]`;
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
  server.addGuard((tool, args) => session.gate(tool, args));

  /** WHICH HAND MADE THIS CALL, AND ON WHAT — dsp-the-three-coordinates-on-a-call.
   *
   *  THE STATE IS AN OBSERVATION. The server knows where the walk stands, so it
   *  writes it and nothing downstream infers it.
   *
   *  THE OTHER TWO ARE CLAIMS AND THE RECORD MARKS THEM. The transport hands the
   *  engine a client name and no model, and one dispatcher serves every agent, so
   *  neither the answering model nor the part played is visible from here.
   *
   *  THE DEFAULT PART IS THE WALKER, and that is a position rather than a
   *  convenience. The hand holding the session IS the walker by definition; a
   *  GUIDE is a hand that was asked for one step, and it says so. A default of
   *  `guide` would let the strong hand's work hide in the weak hand's count,
   *  which is the failure this coordinate exists to make visible.
   *
   *  RELAYED WORK NAMES ITS AUTHOR AND ITS RELAYER. Where the walker files work
   *  a guide authored, `part` is the guide's and `relayed_by` is the walker's —
   *  raid-risk-a-relayed-judgment-is-filed-under-the-hand-that-relayed-it. */
  const PART_WORDS: ReadonlySet<string> = new Set<CallPart>(["owner", "walker", "guide", "reviewer", "surface"]);

  function whichHand(
    session: Session,
    args: unknown,
  ): {
    state: string;
    part: CallPart;
    answered_by: string;
    relayed_by?: CallPart;
    named_driver?: string;
    went_weaker?: boolean;
    weaker_reason?: string;
  } {
    const a = (args ?? {}) as Record<string, unknown>;
    // THE LOG NEVER REFUSES A RECORD IT IS ASKED TO WRITE. The guard above has
    // already refused any call carrying a part outside the vocabulary — and a
    // REFUSED call is still observed, so this runs for it too. Passing the bad
    // value through to `append` would throw inside the log hook, the dispatch
    // would swallow it, and the refusal record would vanish. Losing the record
    // of a refusal is the same defect as losing the record of a call.
    //
    // SO AN UNKNOWN VALUE FALLS BACK, AND THE CLAIM IS STILL VISIBLE: the raw
    // arguments ride the same record, so a reader sees both what was declared
    // and what the record settled on.
    const word = (v: unknown): CallPart | undefined => (typeof v === "string" && PART_WORDS.has(v) ? (v as CallPart) : undefined);
    const declared = word(a.as);
    const part: CallPart = declared ?? "walker";
    // COMPARED AGAINST THE RESOLVED PART, not the declared one. With `as`
    // omitted, `declared` is undefined and every relay looked distinct from
    // it — so a `relayed_by: "walker"` produced a record whose relayer WAS its
    // author, which the log refuses, inside the hook that must never throw.
    const relayed = word(a.relayed_by) === part ? undefined : word(a.relayed_by);
    const named = typeof a.named_driver === "string" && a.named_driver !== "" ? a.named_driver : undefined;
    // THE REASON ONLY MEANS ANYTHING BESIDE A NAMED STRENGTH. Carried alone it
    // is a sentence about nothing, and it would suppress the `unreasoned` mark
    // on a record that never named a driver to be weaker than.
    // A BLANK REASON IS NOT A REASON. `" "` passed a `!== ""` test and
    // suppressed the mark, which is the smallest possible way to owe a
    // sentence and give none.
    const said = typeof a.weaker_reason === "string" ? a.weaker_reason.trim() : "";
    const why = said !== "" ? said : undefined;
    // THE MARK IS ABOUT GOING WEAKER, AND ONLY THE CALLER KNOWS. `named_driver`
    // is a rung and `answered_by` is a model name; nothing in this tree maps
    // one to the other, so "weaker" is not computable here.
    //
    // IT USED TO FIRE ON ANY NAMED DRIVER WITH NO REASON, which marked a step
    // walked at or above its named strength identically to one that went below
    // it — and the schema tells callers to send `named_driver` on every call.
    // A mark that fires on nearly everything counts nothing. Found by a
    // fresh-eyes tester at i38's verification.
    // `went_weaker: true` IS A COMPLETE STATEMENT ON ITS OWN. This required a
    // `named_driver` beside it, and a caller who said in as many words that a
    // weaker hand walked the step, while omitting the echo of the rung, left a
    // record carrying no trace of it at all — which is the outcome the
    // requirement's own breaks_if_removed describes.
    const weaker = a.went_weaker === true;
    return {
      state: session.currentState(),
      part,
      answered_by: typeof a.answered_by === "string" ? a.answered_by : UNREPORTED,
      ...(relayed !== undefined ? { relayed_by: relayed } : {}),
      ...(named !== undefined ? { named_driver: named } : {}),
      ...(weaker ? { went_weaker: true } : {}),
      ...(why !== undefined ? { weaker_reason: why } : {}),
    };
  }

  // §9 — the single call path logs everything. se_run keeps its full output.
  server.addObserver((rec) => {
    const hand = whichHand(session, rec.args);
    log.append({
      tool: rec.tool,
      args: rec.args,
      actor: "agent",
      // WHERE THE CALL LANDED, stamped rather than inferred. The observer fires
      // AFTER the handler, so for a pull that moved the walk this is the
      // DESTINATION — which is the attribution wanted: the call that did the
      // work of arriving belongs to what it arrived at. A refusal is stamped
      // before any move, because the guards throw ahead of the handler.
      // see dsp-call-log.md#the-walk-position-is-stamped-not-inferred
      where: session.active(),
      hands: session.hands(),
      ...hand,
      ok: rec.ok,
      outcome: rec.outcome,
      duration_ms: rec.duration_ms,
      // THE LOG IS A TRAIL, NOT AN ARCHIVE. Only se_run keeps its output whole,
      // because that is the one a caller comes back for. Everything else is
      // capped here — so the cut says so, rather than sending a reader to the
      // very file they are already reading.
      response: rec.tool === "se_run" ? rec.response : capJson(rec.response, 500),
    });
    // A DELEGATED HAND'S NARRATION IS ITS PROGRESS REPORT. A call that
    // carried an update just proved a walking hand is still walking, so it
    // refreshes the newest running agent job — the only cure for `statusOf`
    // reading a busy hand's silence as idle.
    // A GUIDE, THE OWNER OR THE SURFACE NEVER REFRESH ANYTHING: narrating
    // ABOUT a walker is not the walker itself narrating.
    if ((updateResult !== undefined || updateComplaint !== undefined) && (hand.part === "walker" || hand.part === "reviewer")) {
      noteAlive();
    }
    if (rec.ok && EDIT_TOOLS.has(rec.tool) && JSON.stringify(rec.args ?? {}).includes(".ts")) kickTypecheck(root);
  });

  return server;
}

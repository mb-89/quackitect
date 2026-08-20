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
import { CallLog } from "./calllog.ts";
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
import { runToCompletion } from "./run.ts";
import { requiredDependsOn } from "./seed.ts";
import { type AmendOp, Session } from "./session.ts";
import { Toll } from "./toll.ts";
import { deskTools } from "./tools-desk.ts";
import type { ReadingHook } from "./tools-file.ts";
import { fileTools } from "./tools-file.ts";
import { queryTools } from "./tools-query.ts";
import { runTools } from "./tools-run.ts";
import { SE_VERSION } from "./version.ts";

/** THE TICK — the machinery's one tool, legal in every state. */
export function sessionTools(session: Session): ToolDef[] {
  return [
    {
      name: "se_pull",
      title: "se.pull",
      description:
        'THE PULL — your ONLY verb. Pull, do what comes back, pull again.\n\nThe machine owns every decision about the walk. You never name a target, never name a path, never ask which state you are in, and never ask which tools are legal.\n\nBLOCKING IS AN INSTRUCTION, NOT AN ERROR. A pull does not refuse a walk that cannot move yet — it tells you what to do about it.\n\nFOUR ANSWERS, and `pull` names which one you got.\n\nREAD — a document rides in `document`, and `prove` asks THREE FILL-IN-THE-BLANK QUESTIONS about it. Each quotes a run of words and wants the FOUR WORDS THAT FOLLOW it. Answer all three in one string: form: {"read": "<the answers>"}.\n  - QUOTE GENEROUSLY. The check asks whether your answer CONTAINS the words it wants, never whether it matches them exactly. A whole sentence around each anchor passes; a clipped four-word count often misses.\n  - PUNCTUATION IS NOT A WORD. A dash, a bullet or a bare quote mark sitting between two words is skipped when the engine counts. That is the usual reason a careful answer fails.\n  - Case and spacing are ignored. A wrong answer names the probes it missed and serves the same document again.\n\nFILL — the machine BUILT the form and handed it to you in `forms`. Fill every required section and return it on the NEXT pull as form: {"<section>": "<text>"}.\n  - THERE IS NO SUBMIT VERB, AND THERE IS A SUBMIT FLAG. Three keys are ACTS, not sections: `submit: true` stamps it (every check runs, then it signs); `bless: true` or `bless: false` is the thumb on a gate; a fill carrying neither is saved and deliberately left unstamped, so you can finish it later.\n  - A FORM YOU MEAN TO FINISH CARRIES `submit: true`. Without it the fields land, nothing signs, and the same form comes back looking untouched — which reads like a refusal and is not one.\n  - A SAVE CLEARS AN EXISTING SIGNATURE. A changed claim is no longer the claim that was signed, so re-submit after any edit, however small.\n  - `refused.problems` NAMES YOUR OWN WORK: sections still empty or still failing. Do those.\n  - THE SAME FORM BACK WITH NO PROBLEMS MEANS THE BLESS IS OWED. Every section stands and nothing you can type will move it. Say which gate waits and stop, unless the dial puts the thumb in your hand.\n  - All three keys in one pull is legal.\n\nDO — the happy path was WALKED for you, every hop to the next branching point in one call. `here` is where you landed, with its guidance. Where the road split, the doors ride along in `options`: answer form: {"choice": "<to>"} only when a routed goal needs that door. A LIST is legal where work fans out — the first is walked, the rest come back as `not_walked`. A choice exists ONLY where one was offered. A `do` that did not move says so, and names what would move it.\n\nWAIT — the machine is out of work, or the next step weighs more than the session autonomy. Say plainly WHICH step waits, then STOP. The dial alone cannot wake you; the person must message you after moving it.\n\nNARRATE AS YOU WORK. Every call takes an `update`. Ride one on any pull that changes something, starting with a plan before your first edit in a state.\n\nA genuinely illegal call still refuses typed — a choice outside the offer, a form nothing asked for.',
      inputSchema: {
        type: "object",
        properties: {
          form: {
            type: "object",
            description:
              'the filled form the LAST pull handed you. A reading proof: {"read": "<your answers to all three probes, in one string>"}. Evidence: {"<section>": "<text>", ..., "submit": true}. An offered choice: {"choice": "<to>"} — or a list, where the work fans out. Which one is never your call: a proof while a document is owed, evidence while a step demands it, a choice only where one was offered.',
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
        "Reload the engine onto the current sources — legal only with the walk at idle. Canary-guarded: a tree that does not load is refused and the running engine survives. The reload reboots the walk (boot re-proves the engine green). Swaps NEVER fire on their own — this call, from either hand, is the only trigger.",
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
          chain: {
            type: "boolean",
            description:
              "NOT IMPLEMENTED — accepted and ignored, and it is documented that way rather than removed so nobody rebuilds it from the same wrong premise. It was written when an amend re-greyed the chain below it, to re-freshen that chain in one act. The owner reversed that on 2026-08-17: an amendment does not re-grey, so there is normally nothing to re-freshen and this argument has no work to do. WHAT IS STILL WANTED, if anything, is a bulk RE-SIGN after a genuine reopen — a different act on a different trigger. See note-380d789f6f85 and note-fc18d2775583.",
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
        "OPEN OR CLOSE A BENCHMARK RUN. A run re-walks an ARCHIVED iteration from the commit before that iteration started, so what the machine costs can be measured against the walk that really happened. Name an iteration, or name none and the one benchmarked longest ago is taken \u2014 runs CYCLE rather than repeating, and the reports folder is the only scheduler state there is. A run BINDS OR IT REFUSES, once, at the earliest point the cause is knowable: no iteration, no rewind point, an empty tree, or a failed positive control. It never binds and then refuses per request, because a report full of refusals reads as a machine failure rather than as a guard. {stop: true} ends the open run and records WHERE IT ACTUALLY ENDED, which is the number this whole mechanism exists to collect \u2014 a run that died still leaves a result. WHAT IT MEASURES IS PROCESS OVERHEAD UNDER OBSERVATION, never production behaviour and never the quality of any decision: the agent is TOLD it is walking a benchmark. Never compare two single runs \u2014 report a median over at least three with the spread beside it.",
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
    ...runTools(rootOf, projectRoot, reading, mirror),
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
      'NARRATE AS YOU WORK — a decision-graph op riding this call. Every lane tool takes it.\n\nWHAT TO SEND, and each op is one line:\n  - plan {items} — start the state\'s checklist. Send this BEFORE your first edit of any multi-step work.\n  - update {node, brief} — say what you are doing ON an item. The node is REQUIRED while any item stands open; with nothing open, a bare update is right.\n  - done | obsolete | revert {node, brief} — resolve a node. Everything started gets resolved. Abandoning one silently is illegal.\n  - fork {brief, items?} — an unplanned branch opens where you stand, and the current item cannot continue until it is done. Scope that merely GREW is another plan, not a fork.\n  - defer {node, to} — park a point for the state that can do it. It arrives there as an open to-do.\n\nTHE FIRST ONE IS ALWAYS A PLAN. Example: update: {op: "plan", items: ["read the record", "fill the gate", "submit"]}.\n\nTHE BRIEF IS ONE LINE, 90 characters, one thing.\n\nEvery call answers with `update_result`, carrying the open node map and any nudge. A volunteered update resets the toll; when the toll lapses, the next call must carry one.',
  };
  for (const t of tools) (t.inputSchema.properties as Record<string, unknown>).update = UPDATE_PROP;
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
        ok: true,
        outcome: "result",
        duration_ms: 0,
        response: result,
      });
      toll.paid();
    } catch (e) {
      if (!(e instanceof Rejection)) throw e;
      updateRejection = e;
      updateComplaint = e.toJSON();
      log.append({
        tool: "se_update",
        args: { via: tool, refused: true },
        actor: "agent",
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

  // THE ON-CHANGE TYPECHECK'S REPORT rides every result while the tree is red.
  server.addDecorator((_tool, result) => {
    if (TYPECHECK.report === "" || typeof result !== "object" || result === null || Array.isArray(result)) return result;
    return { ...(result as Record<string, unknown>), typecheck_error: TYPECHECK.report };
  });

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

  // §9 — the single call path logs everything. se_run keeps its full output.
  server.addObserver((rec) => {
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
      ok: rec.ok,
      outcome: rec.outcome,
      duration_ms: rec.duration_ms,
      // THE LOG IS A TRAIL, NOT AN ARCHIVE. Only se_run keeps its output whole,
      // because that is the one a caller comes back for. Everything else is
      // capped here — so the cut says so, rather than sending a reader to the
      // very file they are already reading.
      response:
        rec.tool === "se_run"
          ? rec.response
          : capJson(
              rec.response,
              500,
              "cut from the LOG's copy — the caller received this answer whole, and only se_run's output is kept in full",
            ),
    });
    if (rec.ok && EDIT_TOOLS.has(rec.tool) && JSON.stringify(rec.args ?? {}).includes(".ts")) kickTypecheck(root);
  });

  return server;
}

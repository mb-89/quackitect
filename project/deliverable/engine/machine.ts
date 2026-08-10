// The state machine (§6, P4 §10). `next` is computable, not heuristic.
// A policy IS a machine; tailoring is removing transitions.
//
// Schema rules held here:
// - Edge roles declared, never inferred: normal | alternative | fallback |
//   recovery | approval | error.
// - Failure kinds never conflated: Rejected (never retry) · Failed (opens
//   fallbacks) · Errored (retry with backoff).
// - Priority total: authored > fallback > escape > ask-human.
// - Extended state: counters as variables, guards over them.
// - Escape records which guard was exhausted.
// - Re-entry declared per machine; default restart.
// - filled_by: agent | engine — engine-filled states declare their command
//   on the state; mechanical states fill, never bless.

export type EdgeRole = "normal" | "alternative" | "fallback" | "recovery" | "approval" | "error";

/**
 * WHAT A FIELD IS, not only what it is called.
 *
 * Every field was prose, and "filled" meant the text was not empty, so a
 * single full stop satisfied every required field in the system. A type lets
 * the engine check the SHAPE rather than the length.
 *
 * `derived` is the one that changes who answers: the engine computes it and
 * refuses a hand-written value, because those are exactly the claims an agent
 * would fabricate — they sound like work and cost nothing to assert.
 */
export type EvidenceType = "claim" | "table" | "prose" | "list" | "verdict" | "files" | "derived" | "matrix" | "run_ref";

export interface EvidenceField {
  name: string;
  description: string;
  required: boolean;
  /** What shape the answer takes. Absent means prose, where every field began. */
  type?: EvidenceType;
  /** One or two lines telling whoever fills it what belongs in it. */
  guidance?: string;
  /** THE COLUMNS. For `table`, plain headings. For `node-table`, the
   *  FRONTMATTER KEYS on the listed nodes — each becomes an editable cell,
   *  read from the node and written back to it (owner ruling 2026-08-07).
   *
   *  WHY THE NODE AND NOT THE FORM. A probe result belongs to the assumption,
   *  not to whichever iteration happened to run it. Written in both places it
   *  is two copies of one fact, and one of them goes stale. The register's
   *  own law already says this: the nodes are the truth, the table is a view. */
  columns?: string[];
  /** COVERAGE IS MUTUAL. Naming an item type here makes two things checkable
   *  at once: every reference in this field refines one of that type, and
   *  every standing node of that type is refined by one of them. */
  covers?: string;
  /** The field's template (machines/forms/templates/<name>.md). Absent
   *  means free-form; every referenced template is a read input. */
  template?: string;
  /** WHICH ITEM TYPE the references must be, for a field that points at
   *  standing artifacts. The value names an item template
   *  (machines/items/<of>.md), and every referenced node must declare that
   *  same type. Absent means any typed node resolves. */
  of?: string;
  /** THE TEMPLATE'S ARGUMENTS — templates stay generic, the field makes
   *  them concrete. options/passing feed choice-rationale; items feeds
   *  per-item (the literal "$inbox" resolves to the live pending notes). */
  options?: string[];
  items?: string[];
  passing?: string[];
  /** WHICH CHOICES OWE A REASON (owner ruling 2026-08-08). Absent means ALL
   *  of them, which is what a gate verdict wants. A finder's `applies` names
   *  only the skip: saying yes needs no essay, saying no does. */
  rationale_for?: string[];
  /** WHAT TO TYPE IN EACH COLUMN, one line per column, in the column order.
   *  A header of single words leaves the filler guessing, and a guess is
   *  exactly what the cell-count check cannot catch. */
  column_help?: string[];
  /** WHICH COLUMNS ARE CONSTRAINED TO A KNOWN SET, as column name to the
   *  sources its cells come from. A cell so named holds a member of that set
   *  and nothing else, so the editor offers a CHOOSER rather than a text box.
   *
   *  SEVERAL SOURCES ARE ALLOWED, and a literal rides beside a live one: a
   *  column offering `[$clusters, the environment, the user, nobody]` is
   *  complete without being free.
   *
   *  WHY IT IS A CONSTRAINT AND NOT A CONVENTION. A pairwise judgment naming
   *  something outside the pool compares an axis against a non-axis, and the
   *  weight computed from it is arithmetic over a typo. */
  picks?: Record<string, string[]>;
  /** WHICH PICKED COLUMNS STILL TAKE SOMETHING ELSE (owner ruling
   *  2026-08-08: "this should just show me all the clusters, and I can only
   *  choose clusters").
   *
   *  A PICK IS CLOSED BY DEFAULT, because that is what a known set means. A
   *  column named here is the exception: the offer is help, and typing past
   *  it is legal. The comparison cards need it — their cells hold an id PLUS
   *  a reason, and a closed chooser would forbid the reason. */
  pick_free?: string[];
  /** HOW MANY ROWS A PAGE SHOWS. A field over a live register is as long as
   *  the register, and a table nobody can page through is a table nobody
   *  fills. Absent means all rows at once, which is right for a short one. */
  page_size?: number;
  /** WHERE A LIST CELL'S FILE HALF LIVES. An entry in the address grammar
   *  (`file :: case`) links its file, joined to this base. Absent means no
   *  link. */
  link_base?: string;
  /** WHICH RELATION A COMPARISON CARD WALKS — `order` or `equivalence`. It
   *  decides what may be inferred from an answer, and that decides how many
   *  questions the card ever puts. */
  relation?: string;
  /** THE FRONTMATTER KEY a card's answers land in, on the node itself. */
  writes?: string;
  /** ANOTHER FIELD IN THIS STATE THAT THIS ONE IS DERIVED FROM.
   *
   *  A derived field asks for nothing. It reads the named field, computes,
   *  and shows the answer — so the answer cannot disagree with what it was
   *  computed from, which is what a second typed copy always eventually does
   *  (owner report 2026-08-08, on a Pareto front typed beside its scores). */
  reads?: string;
  /** An optional second key, where the card also wants a sentence. */
  reason?: string;
}

/**
 * THE STANDARD REVIEW ROUNDS — ported from v2, which ported them from v1's
 * milestone-review guide. Every gate carries these in addition to its own
 * acceptance items, and THE COMPILER adds them so that no row author can
 * forget one.
 *
 * They live HERE, in the schema, because there are TWO compilers and a
 * constant owned by one of them reaches only half the gates. That is not
 * hypothetical: this list sat in machines/compile.ts and was appended on the
 * canvas path alone, so the ten gates a real iteration walks carried none of
 * it — the same shape as the failure v2 recorded, where the rounds were
 * doctrine from the day they were written, no evidence form ever collected
 * them, and consequently NOT ONE was filled in any gate of any iteration.
 */
// A CHOICE CARRIES ITS REASON. `rationale_for` names the options that owe
// one; absent means all of them, which is what a verdict wants.
export const STANDARD_ROUNDS: EvidenceField[] = [
  {
    name: "round_0_verify",
    description:
      "ROUND 0 — VERIFY: built it right. Each named check with its verdict. Open what the evidence points at; a bless is not proof.",
    required: true,
    template: "per-item",
    items: ["evidence vs claims", "types", "lint", "tests"],
  },
  {
    name: "round_1_validate",
    description:
      "ROUND 1 — VALIDATE: built the right thing. The RESULT against the goal and the frame — each named question answered. PRIOR ART IS A COMPARISON, NOT A CITATION (owner, 2026-08-06): name systems people ACTUALLY USE, say what each does better, and say what ours sheds. Naming the book a shape came from proves only that it was borrowed. If the comparison was not made, say so — an unmade comparison is a finding, never a blank.",
    required: true,
    template: "per-item",
    items: ["exercised against the goal", "missing", "wrong", "out of scope", "prior art"],
  },
  // A ROUND THAT ONLY EVER PASSES IS DECORATION. Round 1's `missing` and
  // round 2's kill-criterion are the two places a gate can actually die, and
  // both are worthless when filled with findings nobody would act on. A
  // finding padded in to make the list look longer is worse than a short
  // list: it teaches the reader to skim (owner, 2026-08-06, striking
  // "fourteen stories is an arbitrary number" from a live gate).
  {
    name: "round_2_red_team",
    description:
      "ROUND 2 — RED TEAM: attack the result before endorsing it. STEELMAN FIRST: argue the OPPOSING case at its strongest, the way its best advocate would. Only then attack. Name the KILL-CRITERION — what would have to be true for this to be the wrong call — and look for it.",
    required: true,
    template: "findings",
  },
  // ASKED AT EVERY GATE, SO NOTHING IS DROPPED (owner ruling 2026-08-06).
  // A review is where somebody has just looked hard at the work, which is the
  // moment a risk or an assumption is most visible and least likely to be
  // written down. Waiting for the state that owns the register is how an
  // entry is lost. NONE IS A LEGAL ANSWER and most gates will give it; the
  // cost of asking is one line, and the cost of not asking is an assumption
  // nobody records until it breaks.
  {
    name: "raid_additions",
    description:
      "Anything this review adds to the RAID register, as raid node references — a risk, an assumption, an issue, a dependency. Look especially for ASSUMPTIONS: something this milestone is treating as true without having established it. `none` is a legal answer.",
    required: true,
    template: "refs",
  },
  {
    name: "verdict",
    description: "The gate's ruling with its rationale. An override is logged WITH its dissent, never as a clean pass.",
    required: true,
    template: "choice-with-rationale",
    options: ["pass", "pass with overrides", "fail"],
    passing: ["pass", "pass with overrides"],
  },
];

export interface EdgeDecl {
  to: string;
  role: EdgeRole;
  /** Guard over extended state, e.g. "attempts < 3". Absent = always open. */
  guard?: string;
}

export interface StateDecl {
  id: string;
  /** start and end are MECHANICAL states every machine has: start is where
   *  the machinery enters (auto-advanced), end closes the machine (terminal).
   *  Nothing machine-specific belongs in them. */
  kind: "work" | "gate" | "terminal" | "start" | "end" | "join";
  /** THE BUSBAR (owner ruling 2026-08-06): this state's inputs meet at an
   *  AND bar. The bar is passed only when EVERY state feeding it is done,
   *  and the state cannot submit before then.
   *
   *  IT IS THE ONLY AND-MECHANISM (owner ruling 2026-08-08). The kernel's
   *  activation rule, the submit check and the drawing all read THIS field.
   *  `state_kind: join` is drawing vocabulary the compiler turns into a bar.
   *  There is no second word and no second place it is enforced.
   *
   *  THE BAR IS AUTHORED, NOT INFERRED. It is an element of the state
   *  machine, drawn by whoever writes the row. The engine never decides
   *  where one belongs.
   *
   *  ITS ABSENCE IS THE OR, and that is the default. A state with several
   *  inputs and no bar above it moves on the first input that arrives. No
   *  vocabulary says this — the missing bar already does.
   *
   *  NOT A GATE THING. A gate is one state that happens to carry a bar.
   *  Work states carry them too. The engine used to key the whole rule off
   *  kind === "gate", which gave every work state an accidental OR. */
  busbar?: boolean;
  /** Diagram grouping, e.g. "boot" — presentation metadata, no run-time meaning. */
  group?: string;
  /** AUTHORED meaning, or empty (owner ruling 2026-07-28): a statement
   *  exists only when it says something the id does not ("In doubt, go
   *  here."). The mirror renders it small under the node's name; filler
   *  like "The retro machine." is struck, never generated. */
  statement: string;
  /** Optional: a human might fill a state too (owner ruling — v3 drops the requirement). */
  filled_by?: "agent" | "engine";
  /** Declared on the state, never invented at run time (engine-filled only). */
  command?: string;
  /** Pillar 1 — the method slice for this step, inlined. */
  guidance: string;
  /** The evidence form `submit` must satisfy (shape check; review checks quality). */
  evidence_form: EvidenceField[];
  /** A nested machine: a ledger machine id, or "iteration" — the iteration may provide its own. */
  submachine?: string;
  /** SCXML-style state contract (owner ruling 2026-07-26): authored on the
   *  NOTE, evaluated as the transition's cond. Each is a DICTIONARY:
   *  key = a condition TYPE (defined by its note in machines/conditions/),
   *  value = the type's arguments. All keys must hold. Absent = always. */
  entry?: Record<string, string[]>;
  exit?: Record<string, string[]>;
  /** Tags join states to guidance (the pull system's tag rule). */
  tags?: string[];
  /** WHY the state exists — one authored line, shown on its evidence form. */
  motivation?: string;
  /** Declared do-inputs beyond the reading ("Do the survey | …"). */
  inputs?: { label: string; description: string }[];
  /** The concrete slash-name of the form's Follow-up box. */
  follow_up_label?: string;
  /** HUMAN INVOLVEMENT (owner ruling 2026-07-26): the weight of the
   *  decision to ENTER this state, 0.01 (mechanical) .. 1 (killer). The
   *  agent may enter only when priority <= the session threshold; the
   *  human always may. Required on every state. */
  priority: number;
  /** v3 — THE STATE GATE: the LEGAL TOOLS while this state is active
   *  (legal STATES are the machine's edges — this is only about tools).
   *  ["all"] opens the whole lane. Enforced at dispatch, not advisory. */
  legal_tools?: string[];
  /** Legal ONLY while the state's exit script stands red (repair mode). */
  repair_tools?: string[];
  /** Set when the state IS another machine's state, by reference — a mirror
   *  is a reference, never a copy (owner law 2026-08-04). Anything asking
   *  WHICH state this is must follow it, not the id. */
  same_as?: string;
  edges: EdgeDecl[];
}

export interface MachineDecl {
  id: string;
  reentry: "restart" | "resume";
  initial: string;
  states: StateDecl[];
}

export interface MachineInstance {
  machine: string;
  iteration: string;
  current: string;
  /** The token set: every concurrently active state. Absent = [current] (adoption). */
  active?: string[];
  /** Fired edges awaiting consumption by a join, as "from->to" keys. */
  fired?: string[];
  /** Which session holds which active state. */
  claims?: Record<string, string>;
  /** An engine-filled state's background run awaiting completion. */
  pending_run?: { state: string; ref: string };
  /** Extended state: counters as variables. */
  counters: Record<string, number>;
  // "superseded" and "reopened" (i12): a reopen must be representable IN the
  // record, not by deleting it. A superseded fill happened and did not survive
  // review; erasing it would make a reopen indistinguishable from work that was
  // never done, which is exactly the history a reader needs most.
  // "paused" writes no more (one escape since 2026-08-02) — old records keep it
  history: {
    state: string;
    outcome: "filled" | "failed" | "escaped" | "paused" | "abandoned" | "superseded" | "reopened";
    evidence?: string;
    at: string;
  }[];
  /** Escape records which guard was exhausted. */
  escapes: { state: string; exhausted_guard: string; at: string }[];
  status: "open" | "closed" | "abandoned";
}

/** Load-time checks: every state reaches a terminal; edges point at states. */
export function validateMachine(m: MachineDecl): void {
  const byId = new Map(m.states.map((s) => [s.id, s]));
  if (!byId.has(m.initial)) throw new Error(`${m.id}: initial state ${m.initial} undeclared`);
  for (const s of m.states) {
    for (const e of s.edges) {
      if (!byId.has(e.to)) throw new Error(`${m.id}: ${s.id} -> ${e.to} points at an undeclared state`);
    }
    if (s.filled_by === "engine" && !s.command) throw new Error(`${m.id}: ${s.id} is engine-filled but declares no command`);
  }
  // Reverse reachability from terminals.
  const reachesTerminal = new Set(m.states.filter((s) => s.kind === "terminal" || s.kind === "end").map((s) => s.id));
  if (reachesTerminal.size === 0) throw new Error(`${m.id}: no terminal state`);
  let grew = true;
  while (grew) {
    grew = false;
    for (const s of m.states) {
      if (reachesTerminal.has(s.id)) continue;
      if (s.edges.some((e) => reachesTerminal.has(e.to))) {
        reachesTerminal.add(s.id);
        grew = true;
      }
    }
  }
  const dead = m.states.filter((s) => !reachesTerminal.has(s.id));
  if (dead.length > 0) throw new Error(`${m.id}: no path to a terminal from: ${dead.map((s) => s.id).join(", ")}`);
}

/** Guards are a fixed tiny language: `<counter> <op> <int>`. */
export function evalGuard(guard: string | undefined, counters: Record<string, number>): boolean {
  if (!guard) return true;
  const m = guard.match(/^([a-z_]+)\s*(<|<=|>|>=|==)\s*(\d+)$/);
  if (!m) throw new Error(`unparseable guard: ${guard}`);
  const v = counters[m[1]] ?? 0;
  const n = Number(m[3]);
  switch (m[2]) {
    case "<":
      return v < n;
    case "<=":
      return v <= n;
    case ">":
      return v > n;
    case ">=":
      return v >= n;
    default:
      return v === n;
  }
}

export type StepOutcome = "filled" | "failed";

/**
 * REOPEN (i12). Specified in twelve ledger nodes — meth-gate-review's verdict
 * ("reopen with named states and reasons"), fold_back's ripple, the refine
 * track — and implemented in NONE of them until now: the word "reopen" did not
 * appear anywhere in the engine. So a gate could VOTE to reopen and the machine
 * could not act on it, which made "reopen" a synonym for "carry on".
 *
 * Semantics, from meth-gate-review: "A reopen names states; the executor
 * re-activates them and their downstream cone. Reopen edges are never drawn."
 * So the cone is computed from the graph rather than authored, and no edge is
 * added to represent going backwards.
 *
 * THE RECORD IS NOT DELETED. Prior fills in the cone are marked `superseded`
 * rather than removed: the evidence files stay on disk and in the history, so
 * a reader can see what was claimed the first time and that it was reopened.
 * Erasing them would make a reopen indistinguishable from work never done.
 */
/** THE INPUT ROLES. A fallback is the guard-failure path and a recovery edge
 *  points back the way it came, so neither is an input. The drawing uses the
 *  same rule for its busbars, and the two must never disagree — a person
 *  reading a bar is reading a promise the engine has to keep. */
const INPUT_ROLES = new Set(["normal", "approval"]);

/** THE CLAIM-BEARING FEEDERS of a state, looking THROUGH states that carry no
 *  claim of their own (owner ruling 2026-08-07).
 *
 *  This is the ripple, computed instead of written. Green stops at the first
 *  input that is not green, and a mark on a file is not needed to say so.
 *
 *  TRANSPARENT STATES ARE LOOKED THROUGH, never gated on. `start` and plain
 *  waypoints carry no evidence form, so they can never be green — gating on
 *  them would grey the entire machine. The question is the first input that
 *  COULD be green and is not. */
export function claimFeeders(m: MachineDecl, id: string, claimful: Set<string>): string[] {
  const out = new Set<string>();
  const walked = new Set<string>([id]);
  const queue = [id];
  while (queue.length > 0) {
    const target = queue.pop() as string;
    for (const p of m.states) {
      if (!p.edges.some((e) => e.to === target && INPUT_ROLES.has(e.role ?? "normal"))) continue;
      if (claimful.has(p.id)) {
        out.add(p.id);
        continue;
      }
      // A cycle through transparent states must not spin. Seen once is enough.
      if (walked.has(p.id)) continue;
      walked.add(p.id);
      queue.push(p.id);
    }
  }
  return [...out];
}

/** The downstream cone: everything reachable from the named states. Anything
 *  downstream was derived from what is being reopened, so it cannot stand. */
export function downstreamCone(m: MachineDecl, stateIds: string[]): Set<string> {
  const cone = new Set<string>(stateIds);
  let grew = true;
  while (grew) {
    grew = false;
    for (const s of m.states) {
      if (!cone.has(s.id)) continue;
      for (const e of s.edges) {
        if (!cone.has(e.to)) {
          cone.add(e.to);
          grew = true;
        }
      }
    }
  }
  return cone;
}

// RE-ARM THE JOINS FROM OUTSIDE. A state in the cone may be an AND-join fed
// by states that are NOT being reopened and remain done. Their edges fired
// once and were CONSUMED when the join first activated, so after a reopen
// that fuel is gone and nothing will ever produce it again — the walk
// reaches the join and stops dead, with no error and no legal move.
//
// Found the first time reopen was used in anger: gate_inputs is a three-way
// join (draw_context, map_stakeholders, generalize_use_cases). Reopening
// write_stories re-walked one of the three; the other two stayed correctly
// done, and the gate became unreachable.
//
// So: for every edge crossing INTO the cone from a source outside it, put
// the fuel back if that source is still filled. Not if it is superseded —
// then it is being re-walked and will fire on its own.
function rearmJoinsInto(m: MachineDecl, inst: MachineInstance, cone: Set<string>, stateIds: string[]): void {
  inst.fired ??= [];
  const fired = inst.fired;
  const stillDone = new Set(inst.history.filter((h) => h.outcome === "filled" && !cone.has(h.state)).map((h) => h.state));
  for (const src of m.states) {
    if (cone.has(src.id) || !stillDone.has(src.id)) continue;
    for (const e of src.edges) {
      if (!cone.has(e.to)) continue;
      if (e.role !== "normal" && e.role !== "approval") continue;
      // NOT into a state this reopen is activating directly. Fuel exists to
      // activate something later; these states are being activated NOW. Left
      // in place it sits until the state COMPLETES, then re-activates it —
      // so the reopened state fills, re-opens, fills, re-opens, and the walk
      // never moves. Observed on the second live reopen.
      if (stateIds.includes(e.to)) continue;
      const key = `${src.id}->${e.to}`;
      if (!fired.includes(key)) fired.push(key);
    }
  }
}

/** A BRANCHING POINT is a state with more than one way out (owner design
 *  2026-08-07). The owner calls it a waypoint; this file already uses that
 *  word for a claim-less transparent state, so the new idea takes the plainer
 *  name and the two stay distinguishable.
 *
 *  It matters because a fan hands out ONE leg. Whoever walks it reaches the
 *  end and the drawing offers nothing: the other legs are behind them, and
 *  the join above wants them all. */
export function branchingPoints(m: MachineDecl): string[] {
  return m.states.filter((s) => s.edges.filter((e) => INPUT_ROLES.has(e.role ?? "normal")).length > 1).map((s) => s.id);
}

/** AND or OR, and the difference decides whether you may come back.
 *
 *  AND means every leg must be walked, so the walk MUST be able to return to
 *  the branching point and take another. The tell is a busbar above: a join
 *  that collects every input.
 *
 *  OR means one leg is the answer. At an OR the branching point is where a
 *  DECISION was made, and returning would un-make it. So there is no jump
 *  back, and the legs not taken are recorded as not_walked. */
export function branchKind(m: MachineDecl, id: string): "and" | "or" {
  const s = m.states.find((x) => x.id === id);
  if (s === undefined) return "or";
  const legs = s.edges.filter((e) => INPUT_ROLES.has(e.role ?? "normal")).map((e) => e.to);
  if (legs.length < 2) return "or";
  // Reachable from EVERY leg, and a busbar OVER SEVERAL INPUTS. That is the
  // join that wants them all, and its existence is what makes the branch an
  // AND.
  //
  // THE INPUT COUNT IS LOAD-BEARING (found 2026-08-08, putting the bar on the
  // shared end note). Reachability alone says nothing: a machine's END is
  // downstream of every leg BY CONSTRUCTION, so any bar on it would turn
  // every branch in every machine into an AND — including idle's doors, where
  // taking one is a decision and the others are never walked.
  //
  // A bar over ONE input synchronises nothing. It is a bar over TWO that says
  // the legs below it are all required.
  const inbound = (id: string): number =>
    m.states.filter((p) => p.edges.some((e) => e.to === id && INPUT_ROLES.has(e.role ?? "normal"))).length;
  const cones = legs.map((l) => downstreamCone(m, [l]));
  return m.states.some((x) => x.busbar === true && inbound(x.id) >= 2 && cones.every((c) => c.has(x.id))) ? "and" : "or";
}

/** THE BRANCHING POINT TO RETURN TO, or none.
 *
 *  Answers one question: standing at `from`, wanting `to`, is there an AND
 *  branching point behind me that reaches it? The nearest one wins, because a
 *  return should undo as little of the walk as possible.
 *
 *  An OR branch is never offered. A walk does not get to re-decide by walking
 *  backwards. */
export function branchToReturnTo(m: MachineDecl, from: string, to: string): string | undefined {
  // ALREADY THERE IS NOT A REASON TO GO BACK. The router only asks when the
  // two differ, but a function that would answer "return to the fan" for
  // "reach where you are standing" is wrong on its own terms.
  if (from === to) return undefined;
  const reaches = (a: string, b: string): boolean => downstreamCone(m, [a]).has(b);
  const candidates = branchingPoints(m).filter((b) => b !== from && reaches(b, from) && reaches(b, to) && branchKind(m, b) === "and");
  if (candidates.length === 0) return undefined;
  // NEAREST MEANS FEWEST STATES BETWEEN IT AND HERE. A branch whose cone is
  // smaller sits closer to the walk, so it undoes less.
  return candidates.sort((a, b) => downstreamCone(m, [a]).size - downstreamCone(m, [b]).size)[0];
}

export function reopenStates(
  m: MachineDecl,
  inst: MachineInstance,
  stateIds: string[],
  reason: string,
  now: string,
): { reopened: string[]; cone: string[]; superseded: number } {
  for (const id of stateIds) {
    if (!m.states.some((s) => s.id === id)) throw new Error(`reopenStates: undeclared state ${id}`);
  }
  const cone = downstreamCone(m, stateIds);

  // Un-fire every edge leaving the cone, so joins re-arm instead of firing on
  // fuel left over from the walk being replaced.
  inst.fired = (inst.fired ?? []).filter((key) => !cone.has(key.split("->")[0]));
  rearmJoinsInto(m, inst, cone, stateIds);

  // Supersede prior fills in the cone — kept, not erased.
  let superseded = 0;
  for (const h of inst.history) {
    if (h.outcome === "filled" && cone.has(h.state)) {
      (h as { outcome: string }).outcome = "superseded";
      superseded++;
    }
  }

  inst.history.push({ state: stateIds.join(","), outcome: "reopened", evidence: reason.slice(0, 300), at: now });
  inst.active = [...stateIds];
  inst.current = stateIds[0];
  inst.status = "open"; // a reopen revives a closed instance by construction
  if (inst.claims !== undefined) for (const id of cone) delete inst.claims[id];
  return { reopened: [...stateIds], cone: [...cone], superseded };
}

/** The token set with adoption: an instance without active[] reads as [current]. */
export function activeStates(inst: MachineInstance): string[] {
  return inst.active ?? [inst.current];
}

/** Every state whose LATEST history outcome is `filled` — the green set.
 *
 *  Latest-wins matters: a state filled, superseded and re-walked appears three
 *  times. Only the last entry says whether it stands NOW. A reopen writes
 *  `reopened` or `superseded`, which takes the state back out of this set. */
export function settledStates(inst: MachineInstance): Set<string> {
  const last: Record<string, string> = {};
  for (const h of inst.history) last[h.state] = h.outcome;
  return new Set(Object.keys(last).filter((s) => last[s] === "filled"));
}

/** Fire the completing state's matching outbound edges: AND-join fuel for
 *  normal/approval, direct activation for the OR paths. */
function fireOutbound(
  m: MachineDecl,
  inst: MachineInstance,
  state: StateDecl,
  roles: EdgeRole[],
  only: string | undefined,
  active: string[],
  activated: string[],
): void {
  for (const e of state.edges) {
    if (only !== undefined && e.to !== only) continue;
    if (!roles.includes(e.role)) continue;
    if (!evalGuard(e.guard, inst.counters)) continue;
    if (e.role === "normal" || e.role === "approval") {
      // AND-join fuel: the key waits until every required inbound fired.
      const key = `${state.id}->${e.to}`;
      if (!inst.fired!.includes(key)) inst.fired!.push(key);
    } else if (!active.includes(e.to) && !activated.includes(e.to)) {
      // OR paths (alternative, recovery, fallback, error): activate directly.
      activated.push(e.to);
      const target = m.states.find((s) => s.id === e.to)!;
      if (target.kind === "terminal" || target.kind === "end") inst.status = "closed";
    }
  }
}

/** Activate every successor whose required inbound edges have all fired,
 *  consuming the fuel. */
function activatePowered(
  m: MachineDecl,
  inst: MachineInstance,
  active: string[],
  activated: string[],
  /** The states standing GREEN on their evidence, fetched only if a bar is
   *  short an edge. It reads evidence files, so it is never paid up front. */
  green?: () => Set<string>,
): void {
  // Fuel into an ACTIVE state is absorbed — one token per state, a second
  // trigger during activity never re-runs it later.
  inst.fired = inst.fired!.filter((k) => !active.includes(k.split("->")[1]));
  const settled = settledStates(inst);
  // GREEN IS GREEN, WHOEVER WALKED IT (owner ruling 2026-08-09). A state whose
  // evidence stands owes nothing. Nothing records this instance having walked
  // over it, and nothing needs to.
  //
  // Two sources, and the second is the one that survives. History says THIS
  // instance filled it, which a reload or a re-entry wipes. The evidence says
  // it stands at all, which outlives every one of those.
  let byEvidence: Set<string> | undefined;
  const standsGreen = (id: string): boolean => {
    if (settled.has(id)) return true;
    byEvidence ??= green?.() ?? new Set<string>();
    return byEvidence.has(id);
  };
  for (const s of m.states) {
    if (active.includes(s.id) || activated.includes(s.id)) continue;
    // Inbound counted: normal and approval edges (alternatives activate
    // directly above). FAN-IN IS OR (owner ruling 2026-07-28): any fired
    // inbound activates a plain state — what a person naturally draws.
    //
    // THE BUSBAR IS THE ONLY SYNCHRONISER (owner ruling 2026-08-08). It waits
    // for EVERY inbound edge — the drawn AND of the formalisms: the UML join
    // bar, the BPMN parallel gateway, the Petri transition.
    //
    // IT USED TO READ kind === "join" HERE while the rigor matrix read
    // `busbar`, so a drawn machine and a compiled one meant one thing in two
    // words and enforced it in two places. A matrix row's bar was checked at
    // SUBMIT and never at activation; a drawn join was checked at activation
    // and had no submit rule. Same idea, two mechanisms, nothing making them
    // agree.
    //
    // `state_kind: join` survives as DRAWING vocabulary: the compiler turns it
    // into a busbar, and nothing at run time reads it.
    //
    // DEDUPED, because two edges from one source to one state are ONE
    // inbound. Counted twice, a busbar could never reach its own total.
    const inbound = [
      ...new Set(
        m.states.flatMap((src) =>
          src.edges.filter((e) => e.to === s.id && (e.role === "normal" || e.role === "approval")).map(() => `${src.id}->${s.id}`),
        ),
      ),
    ];
    if (inbound.length === 0) continue;
    const fired = inbound.filter((k) => inst.fired?.includes(k));
    // NOTHING ARRIVED, NOTHING ACTIVATES. A token has to reach the state on
    // one of its inbound edges. This is also what stops the green rule below
    // from re-activating a done join every time anything, anywhere, completes.
    if (fired.length === 0) continue;
    // A GREEN BRANCH SATISFIES ITS EDGE (owner ruling 2026-08-09). A busbar
    // waits for every inbound edge. An edge whose source already stands filled
    // has nothing left to deliver — the work is done, and its fuel was
    // consumed the last time the join ran.
    //
    // WITHOUT THIS A THREE-WAY JOIN IS UNREACHABLE by a single token. Walking
    // one branch fires one edge; reaching a sibling routes BACK through the
    // fork, which re-walks the branch and clears the fuel. Measured in
    // iteration one on 2026-08-09: all three branches walked, gate still shut,
    // and stepping out to re-enter reset the count to zero.
    //
    // rearmJoinsInto solves the same problem for a reopen, by putting fuel
    // back. This solves it for a plain walk, by not demanding it.
    if (s.busbar === true && inbound.some((k) => !fired.includes(k) && !standsGreen(k.split("->")[0]))) continue;
    inst.fired = inst.fired?.filter((k) => !inbound.includes(k)); // consume
    activated.push(s.id);
    if (s.kind === "terminal" || s.kind === "end") inst.status = "closed";
  }
}

/**
 * The token op: complete one active state, fire its matching outbound
 * edges, activate every successor whose required inbound edges have ALL
 * fired (consuming them), and keep `current` as the first-token alias.
 */
export function completeState(
  m: MachineDecl,
  inst: MachineInstance,
  stateId: string,
  outcome: StepOutcome,
  now: string,
  /** Fire only the edge to this state. */
  only?: string,
  /** The green set, lazily — a bar counts a green source as satisfied. */
  green?: () => Set<string>,
): { activated: string[] } {
  const state = m.states.find((s) => s.id === stateId);
  if (!state) throw new Error(`completeState: undeclared state ${stateId}`);
  let active = activeStates(inst).slice();
  if (!active.includes(stateId)) throw new Error(`completeState: ${stateId} is not active`);
  active = active.filter((s) => s !== stateId);
  if (inst.claims) delete inst.claims[stateId];
  const roles: EdgeRole[] = outcome === "filled" ? ["normal", "alternative", "approval", "recovery"] : ["fallback", "error"];
  inst.fired ??= [];
  const activated: string[] = [];
  fireOutbound(m, inst, state, roles, only, active, activated);
  activatePowered(m, inst, active, activated, green);
  inst.active = [...active, ...activated];
  inst.current = inst.active[0] ?? stateId;
  void now;
  return { activated };
}

/** One authored-or-fallback hop, token-synced; true when it moved. */
function tryMove(m: MachineDecl, inst: MachineInstance, state: StateDecl, roles: EdgeRole[]): boolean {
  for (const e of state.edges) {
    if (!roles.includes(e.role)) continue;
    if (!evalGuard(e.guard, inst.counters)) continue;
    inst.current = e.to;
    // Token sync: an instance running the token model swaps the moving
    // token too — current and active[] never drift apart.
    if (inst.active) {
      inst.active = inst.active.filter((s) => s !== state.id);
      if (!inst.active.includes(e.to)) inst.active.push(e.to);
      if (inst.claims) delete inst.claims[state.id];
    }
    const next = m.states.find((s) => s.id === e.to)!;
    if (next.kind === "terminal" || next.kind === "end") inst.status = "closed";
    return true;
  }
  return false;
}

/**
 * Advance the instance after a step outcome. Priority is total:
 * authored (normal/alternative/approval) > fallback/recovery > escape.
 * Returns the escape record when every guard is exhausted.
 */
export function advance(m: MachineDecl, inst: MachineInstance, outcome: StepOutcome, now: string): { moved: boolean; escaped?: string } {
  const state = m.states.find((s) => s.id === inst.current);
  if (!state) throw new Error(`instance at undeclared state ${inst.current}`);
  // recovery fires on FILLED: a successful repair returns into the verifying
  // state. Failure opens fallbacks and error paths.
  const authored: EdgeRole[] = outcome === "filled" ? ["normal", "alternative", "approval"] : [];
  const fallback: EdgeRole[] = outcome === "filled" ? ["recovery"] : ["fallback", "error"];
  if (tryMove(m, inst, state, authored) || tryMove(m, inst, state, fallback)) return { moved: true };
  // Escape to parent (implicit). Single flat machine at bootstrap: escape
  // closes nothing — it records the exhausted guard and asks the human.
  const guards =
    state.edges
      .filter((e) => e.guard)
      .map((e) => e.guard!)
      .join("; ") || "(no guarded edges)";
  inst.escapes.push({ state: state.id, exhausted_guard: guards, at: now });
  return { moved: false, escaped: guards };
}

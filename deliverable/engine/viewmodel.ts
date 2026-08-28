// see dsp-the-computed-view.md
//
// THE RESOLVER. Every fact about the walk that reaches a person is computed
// here, once, and handed over whole. Nothing in this file emits markup, a
// class name or a colour — the surface does that, and only that.
//
// THESE FUNCTIONS CAME OUT OF render.ts. They are the model half of what the
// renderer used to do in one pass, and moving them is what makes the surface
// a repeater rather than a second source of answers.

import { type CanvasData, loadCanvas } from "./canvas.ts";
import type { MachineDecl } from "./machine.ts";
import { compileMachineCached, resolveRef } from "./machines/compile.ts";
import type { MirrorState, StateMeta } from "./render.ts";
import { loadLevels } from "./scale.ts";
import { mainMachinePath } from "./session.ts";
import type { WidgetKind } from "./widget-kinds.ts";
import { bucketOf } from "./workoffer.ts";
import { BACKLOG, BACKLOG_IS_DRAWN_AT, isSettled, type ReadCredit, readAllWork } from "./workstore.ts";

/** What the surface is being asked for. */
export interface Intent {
  /** Which widget, or the whole page when absent. */
  widget?: WidgetKind;
  /** Which machine is on screen. Absent means the one the walk is in. */
  view?: string;
  /** Where a phase timing goes. The caller owns the clock; this only reports. */
  onPhase?: (phase: string) => void;
}

/** THE ONE ANSWER. Every fact the surface shows about the walk comes from here.
 *
 *  IT EMITS NOTHING. No markup, no class name, no colour. What comes back is
 *  data, and the surface's only job is to draw it.
 *
 *  THE SEVEN SOURCES ARE ASKED, NEVER PUSHED FROM. The account, the walk
 *  engine, the record store, the holding pen, the front desk, the method
 *  compiler and the engine delta each answer when this call asks them. */
export function view(m: MirrorState, intent: Intent = {}) {
  const phase = intent.onPhase ?? ((): void => {});
  const info = m.session.describe() as { active: string[]; status: string };
  // READ FROM machines/scale.md rather than compiled in, so an owner edit
  // shows on the next reload.
  const levels = loadLevels(m.root);
  const walkMachine = m.session.currentMachine();
  const { decl, canvas } = viewedMachine(m, intent.view ?? walkMachine.id);
  const viewingWalk = decl.id === walkMachine.id;
  phase("session");

  let drawing: ReturnType<typeof drawingFor> | undefined;
  let states: Record<string, unknown> = {};
  let comment = "";
  if (intent.widget !== "trace") {
    drawing = drawingFor(m, decl, info, viewingWalk, phase);
    phase("machine.sets");
    const archived = decl.states.some((state) => state.tags?.includes("archive-record"))
      ? (m.session.expeditionList() as { archive: { id: string }[] }).archive
      : [];
    states = stateDetails(m, decl, drawing.done, archived);
    comment = (canvas.nodes ?? []).find((node) => node.type === "text")?.text ?? "";
    phase("machine.states");
  }

  const packet = intent.widget === "trace" ? { legal_tools: [] } : m.session.packet();
  phase("packet");
  const checkedDocs = m.session.humanCheckedPaths();
  phase("checked_docs");

  return {
    target: m.session.target,
    /** WHERE THE WALK IS AIMED, split so the surface can draw a button.
     *
     *  THE SURFACE DERIVES NOTHING FROM THE PATH. Working out which machine a
     *  qualified target sits in is a fact about the walk, so it is answered
     *  here rather than by splitting a string in a template. */
    aim: aimOf(m.session.target, walkMachine.id),
    /** WHICH MACHINE THE WALK IS IN, which is not always the one on screen. */
    walkMachineId: walkMachine.id,
    describe: info,
    packet,
    lastPacket: m.lastPacket ?? null,
    states,
    comment,
    viewingWalk,
    viewed: { id: decl.id, reentry: decl.reentry, initial: decl.initial, states: decl.states.map((s) => s.id) },
    history: (m.session.instance.history ?? []).slice(-20),
    levels,
    // EVERY DOC THE READER HAS CHECKED AT ITS CURRENT VERSION. A condition
    // names docs that are not always in the state's own pulled list, so this
    // is the session's list rather than a per-state one.
    checkedDocs,
    // THE BAR IS A PANEL AND THE PANEL IS A SPEC. These are its values;
    // nothing here decides how a control looks.
    panel: {
      rungs: levels,
      autonomy: m.session.autonomy,
      ints: { narration_minutes: m.session.narrationMinutes, narration_calls: m.session.narrationCalls },
    },
    decl,
    canvas,
    drawing,
  };
}

/** The model of the machine picture: which states are where, and what colour
 *  each one earns. Sets of ids and paint classes — never markup. */
function drawingFor(
  m: MirrorState,
  decl: MachineDecl,
  info: { active: string[]; status: string },
  viewingWalk: boolean,
  onPhase?: (name: string) => void,
) {
  const { leafActive, done, paint, subIds, openIds, meta } = drawingSets(m, decl, info, viewingWalk, onPhase);
  const marks: RouteMarks | undefined = routeMarksFor(m, decl);
  // A BUSBAR IS A GATE SEVERAL STATES FEED. Two feeders or more, or it is an
  // ordinary edge and drawing a bar for it would invent a structure.
  const INPUT_ROLES = new Set(["normal", "approval"]);
  const busbars = decl.states
    .filter((gate) => gate.busbar === true)
    .map((gate) => ({
      into: gate.id,
      feeders: decl.states
        .filter((parent) => parent.edges.some((edge) => edge.to === gate.id && INPUT_ROLES.has(edge.role ?? "normal")))
        .map((parent) => parent.id),
    }))
    .filter((bar) => bar.feeders.length >= 2);
  return { leafActive, done, paint, subIds, openIds, meta, busbars, marks };
}

/** Split a target into the parts a clickable chip needs.
 *
 *  AN EMPTY TARGET IS EMPTY, and it never means the front desk. Nothing routed
 *  is a real state of the walk, and the absence of the chip says it. */
function aimOf(target: string, mainId: string): { path: string; machine: string; leaf: string } | undefined {
  if (target === "") return undefined;
  const parts = target.split("/");
  const leaf = parts.pop() ?? target;
  // A BARE STATE BELONGS TO THE MAIN MACHINE. A qualified one names its own
  // machine in the segment before the leaf.
  return { path: target, machine: parts.length === 0 ? mainId : parts[parts.length - 1], leaf };
}

/** The whole model, named by what produces it. */
export type ViewModel = ReturnType<typeof view>;

/** SUSPECT BEATS DONE. The claim was filed and it still stands on disk. What
 *  it answered has moved, so the state is not green — it is a lapsed pass,
 *  and the drawing has to say so before anybody trusts the colour.
 *
 *  ONE WORD FOR ONE IDEA. The trace graph marks a node standing on moved
 *  ground with the same word and the same style. A reader who learns the mark
 *  once reads it everywhere. */
/** ONE PLACE DECIDES WHAT A GREEN MEANS. Three rules said it and three test
 *  files enforced parts of them, so nobody could say which parts were covered.
 *  see dsp-mirror-render.md#one-decider-says-which-kind-of-green-it-is */
export function statePaint(
  sid: string,
  activeIds: Set<string>,
  doneIds: Set<string>,
  meta: Record<string, StateMeta>,
): { cls: string; marks: string[] } {
  const m = meta[sid];
  // SUSPECT BEATS EVERY GREEN. A colour standing on moved ground is no longer
  // earned, and the drawing says so before anybody trusts it.
  if (activeIds.has(sid)) return { cls: "state active", marks: [] };
  if (m?.suspect === true) return { cls: "state suspect", marks: [] };
  if (!doneIds.has(sid)) return { cls: "state", marks: [] };
  // A GREEN OVER OWED WORK IS ILLEGAL. Green says the state was passed. Work
  // still owed at it says it was not, so the drawing must not claim it — and
  // neither may anything downstream, which could only have been reached
  // THROUGH it.
  //
  // PENDING IS THE EXCEPTION, and it is the only one. A pending piece does not
  // block, so it never takes a green away.
  // see dsp-mirror-render.md#green-is-refused-over-owed-work
  if (m?.work_owed === true) return { cls: "state owed", marks: [] };
  // A LAW-PROVEN GREEN SIGNED NOTHING. It rides the same green — a pass is a
  // pass — and carries its own word, so the two are told apart at a glance.
  const cls = m?.law_proven === true ? "state done proven" : "state done";
  return { cls, marks: m?.blessed === true ? ["bless"] : [] };
}

/** Resolve a viewable machine by id: main itself, or one of its subs. */
export function viewedMachine(m: MirrorState, view: string | undefined): { decl: MachineDecl; canvas: CanvasData } {
  const mainPath = mainMachinePath(m.root);
  if (view === undefined || view === m.session.machine.id) {
    return { decl: m.session.machine, canvas: loadCanvas(mainPath) };
  }
  const subState = m.session.machine.states.find((s) => s.submachine !== undefined && s.id === view);
  if (subState === undefined) {
    // Nested generated machines (archive decades) are viewable too.
    const nested = m.session.viewFor(view);
    return nested ?? { decl: m.session.machine, canvas: loadCanvas(mainPath) };
  }
  // Generated machines serve their own drawing (continue_expedition).
  const generated = m.session.generatedView(subState.id);
  if (generated !== undefined) return generated;
  const path = resolveRef(m.root, mainPath, subState.submachine!);
  // CACHED, and live all the same. compileMachineCached memoises against the
  // CONTENT of every file the compile read, so an edited canvas or state note
  // recompiles on the next render and an untouched one does not. The mirror
  // re-renders on every poll, and recompiling the machine each time cost a
  // full second per render — paid by the VS Code panel, not just the tests.
  return { decl: compileMachineCached(m.root, path), canvas: loadCanvas(path) };
}

/** The per-state detail objects the page's data island carries. */
export function stateDetails(m: MirrorState, decl: MachineDecl, done: Set<string>, archived: { id: string }[]): Record<string, unknown> {
  const states: Record<string, unknown> = {};
  for (const s of decl.states) {
    states[s.id] = {
      id: s.id,
      kind: s.kind,
      statement: s.statement,
      guidance: s.guidance,
      priority: s.priority,
      // A state with evidence fields IS its form — the details render it.
      has_form: s.evidence_form.length > 0,
      legal_tools: s.legal_tools ?? [],
      ...(s.submachine !== undefined ? { submachine: s.submachine } : {}),
      ...(s.entry !== undefined ? { entry: m.session.conditionStatus(decl, s, "enter") } : {}),
      ...(s.exit !== undefined ? { exit: m.session.conditionStatus(decl, s, "leave") } : {}),
      exit_met: m.session.conditionMet(decl, s, "leave"),
      was_filled: done.has(s.id),
      // An archive-record state carries ITS closed record for the detail.
      ...(s.tags?.includes("archive-record")
        ? { archive_record: archived.find((e) => e.id === s.id || e.id.startsWith(`${s.id}-`)) ?? null }
        : {}),
      ...(s.exit?.script !== undefined || s.entry?.script !== undefined ? { script: m.session.scriptStatus(decl, s) } : {}),
      pulled: m.session.pulled(decl, s),
      next: s.edges.map((e) => stateEdgeDetail(m, decl, e)),
    };
  }
  return states;
}

/** Highlights follow the WALK; the view may be elsewhere.
 *
 *  IT REPORTS ITS OWN PARTS. This one call was 1163.6 ms of a 1190.2 ms render
 *, and the whole rest of the render was under 27 ms. A single
 *  total says which call to look at and nothing about where inside it the time
 *  goes, so the parts are named and timed the same way the render's are. */
/** A state's buckets, counted. `below` carries the same set summed over
 *  everything inside this state's submachine.
 *
 *  THERE IS NO DONE BUBBLE ON THE DRAWING (owner). A finished piece of work is
 *  not actionable, and a count of it on every state is noise on the one surface
 *  whose whole job is showing what is owed. The editor's own filter is where
 *  dones are read, and `bucketOf` still answers `done` for it there. */
interface Buckets {
  in: number;
  pending: number;
  out: number;
  below: { in: number; pending: number; out: number };
}

function noBuckets(): Buckets {
  return { in: 0, pending: 0, out: 0, below: { in: 0, pending: 0, out: 0 } };
}

/** WHICH BUCKET ONE PIECE OF WORK FALLS INTO.
 *
 *  DONE IS A FILTER OVER STATUS, NEVER A PLACE. A finished piece stays in the
 *  bucket it was worked in and leaves that bucket's count by being filtered
 *  here, not by moving. */
// see workoffer.ts bucketOf — one decider, so the drawing and the editor can
// never disagree about which bucket a piece of work sits in.

/** What one state carries, with an absent state carrying nothing. */
function countAt(byState: Map<string, Buckets>, id: string): Buckets {
  return byState.get(id) ?? noBuckets();
}

/** EVERY STATE A GREEN WOULD BE A LIE ON.
 *
 *  A state that still owes work was not passed, so it cannot be green. Neither
 *  can anything after it: the only way to reach a downstream state is through
 *  this one, so its green rests on a passage that did not happen.
 *
 *  PENDING IS NOT COUNTED. A pending piece does not block, so it never takes a
 *  green away — the owner's one exception.
 *
 *  THE CLOSURE IS FORWARD AND CYCLE-SAFE. A machine with a loop in it would
 *  otherwise never finish this walk.
 *  see dsp-mirror-render.md#green-is-refused-over-owed-work */
function greenRefused(decl: MachineDecl, owedHere: Map<string, Buckets>): Set<string> {
  const owing = new Set<string>();
  for (const s of decl.states) {
    const b = countAt(owedHere, s.id);
    if (owesBlocking(b)) owing.add(s.id);
  }
  return withDownstream(decl, owing);
}

/** DOES THIS STATE HOLD WORK THAT BLOCKS?
 *
 *  PENDING IS THE ONE EXCEPTION AND IT IS NAMED HERE rather than left as an
 *  omission from a sum. It is not an argument to this function, so it cannot
 *  reach the decision at all.
 *  see dsp-mirror-render.md#pending-is-the-one-exception */
export function owesBlocking(b: { in: number; out: number; below: { in: number; out: number } }): boolean {
  return b.in + b.out + b.below.in + b.below.out > 0;
}

/** THE SEEDS AND EVERYTHING REACHABLE FROM THEM, following the edges forward.
 *
 *  THE SEEDS ARE IN THE ANSWER. A state that owes work is itself the first
 *  thing that cannot be green, so the closure includes where it started.
 *
 *  CYCLE-SAFE. A state already in the answer is never queued again, so a
 *  machine with a loop in it finishes. */
export function withDownstream(decl: MachineDecl, seeds: Set<string>): Set<string> {
  const out = new Set(seeds);
  const queue = [...seeds];
  const byId = new Map(decl.states.map((s) => [s.id, s]));
  while (queue.length > 0) {
    const here = byId.get(queue.pop() ?? "");
    if (here === undefined) continue;
    for (const e of here.edges) {
      if (out.has(e.to)) continue;
      out.add(e.to);
      queue.push(e.to);
    }
  }
  return out;
}

/** WHAT EACH STATE OWES, counted once for the whole drawing.
 *
 *  ONE READ, NEVER ONE PER BOX. A per-state read would sweep the record's work
 *  folder once for every state on the canvas.
 *
 *  THE MATCH IS ON THE TAIL OF THE POSITION. A work item records the full
 *  position it was minted at, and the drawing knows a state by its bare id, so
 *  the two are joined on the last segment rather than on a prefix either side
 *  would have to guess at.
 *
 *  IT READS EVERY HOME, not the record the walk happens to stand in. Two
 *  iterations with open work both draw their counts, and the desk draws the
 *  backlog's. */
/** THE NUMBER A RECORD IS DRAWN BY, given the folder it is placed by.
 *
 *  `i23-judgment-the-ui-sitting-cut-the-html-mir` is drawn as `i23`. Empty for
 *  anything that is not a record folder, so a state name passes through
 *  untouched.
 *
 *  IT IS EXPORTED SO A TEST CAN HOLD THE TWO VOCABULARIES TOGETHER. The defect
 *  this closes was not a wrong rule — it was two correct names that never met,
 *  and only a test naming both can catch that coming back. */
export function recordAlias(place: string): string {
  return /^(i\d+)-/.exec(place)?.[1] ?? "";
}

/** THE CONTAINERS A PLACE SITS INSIDE, where the nesting is not written as a
 *  path.
 *
 *  A RECORD SITS IN THE ITERATIONS CONTAINER. Its place is the folder name and
 *  carries no slash, so no path-splitting rule can find the container above it.
 *  Naming it here is what makes a roll-up work for a slot the drawing nests and
 *  the store does not.
 *
 *  THE BACKLOG IS NOT LISTED, on purpose. It is drawn AT the front desk rather
 *  than inside it, so its count is already the desk's OWN. Adding it here would
 *  count the same items twice on one box. */
export function containersOf(place: string): string[] {
  return recordAlias(place) === "" ? [] : ["iterations"];
}

function workByState(root: string, isRead: ReadCredit): Map<string, Buckets> {
  const out = new Map<string, Buckets>();
  for (const item of readAllWork(root, isRead).items) {
    // A FINISHED PIECE NEVER REACHES THE DRAWING. Skipping it here rather than
    // at the render is what makes the absence structural: no later surface can
    // draw a bubble for a count that was never taken.
    if (isSettled(item)) continue;
    const segments = item.place.split("/").filter((s) => s !== "");
    // THE BACKLOG IS THE FRONT DESK'S PENDING BUCKET (owner). It is not a
    // position, so it has no state of its own — and filing it under its own
    // name put the count against a state nothing draws.
    const tail = segments[segments.length - 1] ?? "";
    const own = item.place === BACKLOG ? BACKLOG_IS_DRAWN_AT : tail;
    if (own === "") continue;
    // A RECORD IS DRAWN BY ITS NUMBER AND PLACED BY ITS WHOLE NAME.
    //
    // The iterations container names its boxes `i23`. A work item placed on
    // that record carries `i23-judgment-the-ui-sitting-cut-the-html-mir`,
    // because that is the folder. The two never met, so every count on a
    // seeded record was computed and nothing drew it.
    //
    // MEASURED 2026-08-28, and the owner found it rather than a test: 299
    // items were routed onto 34 records, all of them seeded, and the
    // container showed none of it.
    //
    // THE ALIAS IS FILED BESIDE THE FULL NAME, never instead of it. The work
    // editor groups by the whole place and the drawing knows the number, so
    // both readers get the name they already use.
    const short = recordAlias(own);
    // `bucketOf` still answers `done` — the editor's filter needs it. The
    // narrow is what keeps that answer out of the drawing's own type.
    const where = bucketOf(item);
    if (where === "done") continue;
    const at = out.get(own) ?? noBuckets();
    at[where] += 1;
    out.set(own, at);
    if (short !== "") {
      const alias = out.get(short) ?? noBuckets();
      alias[where] += 1;
      out.set(short, alias);
    }
    // A MACHINE COUNTS WHAT IS BENEATH IT TOO, and shows it as the second half
    // of `18 + 4`. A piece of work inside a submachine is invisible from above
    // without this, which is the whole reason the pill has a plus in it.
    //
    // EVERY ANCESTOR SEGMENT, not only the immediate parent: a machine two
    // levels up still owes what its grandchildren hold.
    // see dsp-mirror-render.md#a-state-wears-its-buckets
    // A CONTAINER IS AN ANCESTOR TOO, and a path is not the only way to be one.
    //
    // The loop below finds ancestors by splitting the place on a slash. A
    // record place is ONE segment with no slash, so it has no ancestors by that
    // rule, and nothing ever reached the container that draws it. Measured
    // 2026-08-28: about 300 items sat on records and the iterations box wore no
    // pill at all.
    //
    // THE RULE IS THE OWNER'S AND IT IS WIDER THAN THIS CASE: the roll-up goes
    // for EVERY slot, not only for the ones a path happens to nest.
    for (const ancestor of [...segments.slice(0, -1), ...containersOf(item.place)]) {
      const up = out.get(ancestor) ?? noBuckets();
      up.below[where] += 1;
      out.set(ancestor, up);
    }
  }
  return out;
}

export function drawingSets(
  m: MirrorState,
  decl: MachineDecl,
  info: { active: string[] },
  viewingWalk: boolean,
  onPhase?: (name: string) => void,
): {
  leafActive: Set<string>;
  done: Set<string>;
  paint: Set<string>;
  subIds: Set<string>;
  openIds: Set<string>;
  meta: Record<string, StateMeta>;
} {
  const leafActive = viewingWalk ? new Set(info.active.map((a) => a.split("/").pop()!)) : new Set<string>();
  if (!viewingWalk && decl.id === m.session.machine.id) {
    // Viewing main while the walk is inside a sub: the sub state is the live one.
    leafActive.add(m.session.breadcrumb()[1]);
  }
  // RE-ENTRY RESETS: the drawing shows the LIVE
  // run only — a machine entered again starts gray; past passes live in
  // the record, not on the drawing.
  const phase = onPhase ?? ((): void => {});
  const run = m.session.viewRun(decl.id);
  const done = new Set(run.done.map((s) => s.split("/").pop()!));
  // An end state is never "filled" — it turns green when its machine completed.
  if (run.completed) for (const s of decl.states) if (s.kind === "end") done.add(s.id);
  // see dsp-mirror-render.md#only-record-backed-states-paint
  phase("sets.run");
  const paint = new Set(m.session.recordPaint(decl));
  phase("sets.paint");
  const blessed = new Set(m.session.blessedGates(decl, paint));
  phase("sets.blessed");
  const proven = new Set(m.session.lawProvenStates(decl));
  phase("sets.proven");
  // see dsp-mirror-render.md#drift-is-computed-on-the-way-to-the-screen
  const suspect = new Set(m.session.suspectStates(decl));
  phase("sets.suspect");
  const subIds = new Set(decl.states.filter((s) => s.submachine !== undefined).map((s) => s.id));
  // WHICH OF THEM CAN ACTUALLY BE OPENED. A seeded sub-machine has no drawing
  // until its authoring state has run, and asking the resolver is the only way
  // to know — the declaration alone says nothing about whether it exists.
  const openIds = new Set([...subIds].filter((id) => m.session.viewFor(id) !== undefined));
  phase("sets.open");
  // see dsp-mirror-render.md#a-walked-sub-machine-must-not-look-unstarted
  const rc = new Map<string, boolean>();
  if (decl.states.some((s) => s.kind === "end") && recordComplete(m, decl, rc, paint)) {
    for (const s of decl.states) if (s.kind === "end") paint.add(s.id);
  }
  phase("sets.complete");
  // THE READING CREDIT RIDES ALONG, so a token wanting a document already read
  // counts as done rather than owed. Nobody submits anything to close one.
  const owedHere = workByState(m.root, (p) => m.session.documentRead(p));
  const noGreen = greenRefused(decl, owedHere);
  phase("sets.work");
  const meta: Record<string, StateMeta> = {};
  for (const s of decl.states) {
    meta[s.id] = {
      // ALWAYS SET, NEVER CONDITIONAL. A zero is what says the bucket holds
      // nothing, and the drawing skips a bucket on zero — one decider, not two.
      //
      // PENDING IS ALWAYS ZERO TODAY, and that is honest rather than an
      // oversight: a pending bucket belongs to the backlog, and nothing yet
      // places work into one on a state.
      work_in: countAt(owedHere, s.id).in,
      work_pending: countAt(owedHere, s.id).pending,
      work_out: countAt(owedHere, s.id).out,
      work_below_in: countAt(owedHere, s.id).below.in,
      work_below_pending: countAt(owedHere, s.id).below.pending,
      work_below_out: countAt(owedHere, s.id).below.out,
      work_owed: noGreen.has(s.id),
      suspect: suspect.has(s.id),
      ...(blessed.has(s.id) ? { blessed: true } : {}),
      ...(proven.has(s.id) ? { law_proven: true } : {}),
      has_exit: s.exit !== undefined,
      exit_met: m.session.conditionMet(decl, s, "leave"),
      has_entry: s.entry !== undefined,
      entry_met: m.session.conditionMet(decl, s, "enter"),
      // The STATEMENT is the subtitle: authored
      // meaning renders small under the name; empty renders nothing.
      ...(s.statement !== "" && s.statement !== s.id ? { subtitle: s.statement } : {}),
    };
  }
  phase("sets.meta");
  return { leafActive, done, paint, subIds, openIds, meta };
}

// THE ROUTE, PROJECTED ONTO THIS DRAWING. A broken or unreachable target
// must never take the picture down with it, so the marks simply go
// missing and the machine still renders.
export function routeMarksFor(m: MirrorState, decl: MachineDecl): RouteMarks | undefined {
  try {
    const r = m.session.route(m.session.target);
    const prefix = decl.id === m.session.machine.id ? "" : m.session.viewChain(decl.id).slice(1).join("/");
    const { waypoints, path: hops } = routeOverlay(r.steps, prefix);
    const localOf = (q: string): string | undefined => {
      if (prefix === "") return q.split("/")[0];
      return q.startsWith(`${prefix}/`) ? q.slice(prefix.length + 1).split("/")[0] : undefined;
    };
    // The fan's legs, projected onto this drawing like every other mark.
    const fan: { from: string; to: string }[] = [];
    for (const f of r.fan ?? []) {
      const to = localOf(f.at);
      if (to === undefined) continue;
      for (const l of f.legs) {
        const from = localOf(l);
        if (from !== undefined && from !== to) fan.push({ from, to });
      }
    }
    const shutAt = r.stops_at === undefined ? undefined : localOf(r.stops_at.at);
    const rest = prefix === "" ? r.from : r.from.startsWith(`${prefix}/`) ? r.from.slice(prefix.length + 1) : undefined;
    return {
      waypoints,
      path: hops,
      ...(fan.length > 0 ? { fan } : {}),
      here: rest !== undefined && !rest.includes("/"),
      ...(r.found && localOf(r.target) !== undefined ? { target: localOf(r.target) } : {}),
      ...(shutAt !== undefined && r.stops_at !== undefined ? { blocked: { at: shutAt, why: r.stops_at.why } } : {}),
    };
  } catch {
    /* no route, no marks - the drawing stands either way */
    return undefined;
  }
}

/** see dsp-mirror-render.md#the-drawing-is-the-truth */
export function routeOverlay(
  steps: { from: string; to: string }[],
  /** The view's QUALIFIED chain below main ("" is main). A nested machine
   *  is "iterations/i1", never its bare leaf id — hops speak full chains. */
  prefix: string,
): { waypoints: Set<string>; path: string[] } {
  const local = (q: string): string | undefined => {
    if (prefix === "") return q.split("/")[0];
    if (!q.startsWith(`${prefix}/`)) return undefined;
    return q.slice(prefix.length + 1).split("/")[0];
  };
  const waypoints = new Set<string>();
  const path: string[] = [];
  const visit = (id: string): void => {
    if (path[path.length - 1] !== id) path.push(id);
  };
  for (const s of steps) {
    const a = local(s.from);
    const b = local(s.to);
    if (a === undefined || b === undefined) continue;
    visit(a);
    if (a === b) waypoints.add(a);
    else visit(b);
  }
  return { waypoints, path };
}

export interface RouteMarks {
  waypoints: Set<string>;
  /** The stops in order. The spline runs through their anchors. */
  path: string[];
  /** A bar's owed legs the path does not run through — each drawn as its
   *  own line into the bar, so the fan shows whole. */
  fan?: { from: string; to: string }[];
  /** The destination, if it is in this drawing. */
  target?: string;
  /** The walk STANDS in this drawing — the one view that draws the here-arrow. */
  here?: boolean;
  /** The hop the walk cannot pass, and why. Drawn as a road closure. */
  blocked?: { at: string; why: string };
}

export function stateEdgeDetail(
  m: MirrorState,
  decl: MachineDecl,
  e: MachineDecl["states"][number]["edges"][number],
): Record<string, unknown> {
  const t = decl.states.find((st) => st.id === e.to);
  const ready = t === undefined ? true : m.session.entryReadyHuman(decl, t);
  return {
    to: e.to,
    role: e.role,
    ...(e.guard !== undefined ? { guard: e.guard } : {}),
    ...(t !== undefined ? { kind: t.kind, statement: t.statement, priority: t.priority } : {}),
    // The human's ▶ lock: explicit entry conditions AND the pull —
    // every doc entering demands, checked at its current version. A
    // locked edge carries WHAT is missing (the tooltip names it).
    // ASKED ONCE. This ran entryReadyHuman twice per edge, and each
    // call walks the target's whole reading list.
    enter_met: ready,
    ...(t !== undefined && !ready ? { missing: m.session.entryMissingHuman(decl, t) } : {}),
  };
}

/** RECORD-COMPLETE, derived: every claimful state stands green, and every
 *  drawn sub-machine is record-complete in turn. A machine with nothing
 *  claimful anywhere proves nothing and stays incomplete, as does an
 *  unwalked branch's machine — a false grey, never a false green. Memoised
 *  per drawing; the memo doubles as the cycle guard. */
export function recordComplete(m: MirrorState, d: MachineDecl, rc: Map<string, boolean>, green?: Set<string>): boolean {
  const known = rc.get(d.id);
  if (known !== undefined) return known;
  rc.set(d.id, false); // a cycle proves nothing
  const g = green ?? new Set(m.session.recordPaint(d));
  let provable = false;
  for (const s of d.states) {
    const claimful = s.evidence_form.length > 0;
    if (claimful || s.submachine !== undefined) provable = true;
    if (claimful && !g.has(s.id)) return false;
    if (s.submachine !== undefined && !subComplete(m, s.id, rc)) return false;
  }
  rc.set(d.id, provable);
  return provable;
}

/** A container's derived green: its drawing resolves AND that machine is
 *  record-complete. A seeded sub-machine with no drawing yet proves nothing. */
export function subComplete(m: MirrorState, id: string, rc: Map<string, boolean>): boolean {
  const sub = m.session.viewFor(id);
  return sub !== undefined && recordComplete(m, sub.decl, rc);
}

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

/** What the surface is being asked for. */
export interface Intent {
  /** Which widget, or the whole page when absent. */
  widget?: "machine" | "details" | "log" | "terminal" | "table" | "trace";
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
 *  on 2026-08-23, and the whole rest of the render was under 27 ms. A single
 *  total says which call to look at and nothing about where inside it the time
 *  goes, so the parts are named and timed the same way the render's are. */
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
  // RE-ENTRY RESETS (owner ruling 2026-07-27): the drawing shows the LIVE
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
  const meta: Record<string, StateMeta> = {};
  for (const s of decl.states) {
    meta[s.id] = {
      suspect: suspect.has(s.id),
      ...(blessed.has(s.id) ? { blessed: true } : {}),
      ...(proven.has(s.id) ? { law_proven: true } : {}),
      has_exit: s.exit !== undefined,
      exit_met: m.session.conditionMet(decl, s, "leave"),
      has_entry: s.entry !== undefined,
      entry_met: m.session.conditionMet(decl, s, "enter"),
      // The STATEMENT is the subtitle (owner ruling 2026-07-28): authored
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

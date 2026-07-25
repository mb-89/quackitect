// The projection: one JSON snapshot of everything the board and the boot
// handover render. Pure — reads state that already exists, writes nothing.
// Board, handover and any future surface (phone) render THIS, never their
// own re-derivation (single source of truth).
import { closeSync, existsSync, openSync, readSync, readdirSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { Gate, type GrantRecord, type Offer } from "./gate.ts";
import { briefHtml } from "./brief.ts";
import { readJsonFile, stripBom } from "./jsonio.ts";
import { layout } from "./layout.ts";
import type { MachineDecl, MachineInstance } from "./machine.ts";
import { loadIterationMachine, loadMachine, loadSession, loadSystematic } from "./machines/load.ts";
import { loadModules, type ModuleStatus } from "./modules.ts";
import { openWorktrees } from "./worktree.ts";
import type { TollUpdate } from "./toll.ts";

export const BOARD_VERSION = "0.1.0";

export interface IterationView {
  id: string;
  status: string;
  current: string;
  goal?: string;
  /** Machine states in order, with what history says about each; planned entries carry plan steps and owner flags. */
  steps: { state: string; done: boolean; owner?: boolean }[];
  updated_at?: string;
  worked_on: boolean;
}

export interface CallLine {
  ts: string;
  tool: string;
  ok: boolean;
  detail: string;
  duration_ms?: number;
  /** The call's declared purpose, when its args carry one. */
  intent?: string;
  /** The request arguments — the log details render request then response. */
  request?: Record<string, unknown>;
  /** Rejection/error payload, or the success summary — the response direction. */
  response?: unknown;
}

export interface NoteLine {
  ref: string;
  text: string;
  at: string;
}

/** One machine on the stack: its states with live status, deepest last. */
export interface MachineFrame {
  id: string;
  /** The parent state this frame was seeded from (dive anchor). */
  seeded_from?: string;
  current: string;
  states: { id: string; kind: string; group?: string; status: "done" | "current" | "future"; row: number; substeps?: number; statement: string; guidance: string }[];
}

/**
 * Layout rows (longest path): states sharing a row are parallel branches
 * and render side by side. Only forward edges count — declaration order
 * breaks cycles (repair loops never inflate the layout) — and terminals
 * always sit below everything: the end renders at the end.
 */
export function stateRows(m: MachineDecl): Record<string, number> {
  const ord = new Map(m.states.map((s, i) => [s.id, i]));
  const row: Record<string, number> = {};
  for (const s of m.states) row[s.id] = 0;
  for (const s of m.states) {
    for (const e of s.edges) {
      if ((ord.get(e.to) ?? -1) <= ord.get(s.id)!) continue;
      if (row[e.to] < row[s.id] + 1) row[e.to] = row[s.id] + 1;
    }
  }
  const floor = Math.max(0, ...m.states.filter((s) => s.kind !== "terminal").map((s) => row[s.id]));
  for (const s of m.states) {
    if (s.kind === "terminal") row[s.id] = Math.max(row[s.id], floor + 1);
  }
  return row;
}

export interface ProjectionState {
  product: string;
  root: string;
  generated_at: string;
  board_version: string;
  /** Admission time of the current session (the lock's timestamp); scopes the call feed. */
  session_started: string | null;
  /** One tab per agent; the driving agent is mallard. Worktree streams
   *  (req-streams-visible) join with role="stream", carrying their root. */
  agents: { name: string; role: string; iteration?: string; root?: string }[];
  modules: ModuleStatus[];
  iterations: IterationView[];
  open_iteration: string | null;
  offer: (Offer & { card_html: string }) | null;
  heartbeat: (TollUpdate & { todo?: string[]; age_s: number }) | null;
  grants: GrantRecord[];
  last_verify: { ok: boolean; exit: number; at: string; iteration: string } | null;
  /** The session machine, plus the open iteration's machine nested below it. */
  machine_stack: MachineFrame[];
  calls: CallLine[];
  /** Private inbox (machine-local, drained at retros) — the board shows it, the repo never does. */
  notes: NoteLine[];
}

/** Tail up to maxBytes of a file without reading the whole thing. */
function tailText(path: string, maxBytes = 256 * 1024): string {
  if (!existsSync(path)) return "";
  const size = statSync(path).size;
  const start = Math.max(0, size - maxBytes);
  const fd = openSync(path, "r");
  try {
    const buf = Buffer.alloc(size - start);
    readSync(fd, buf, 0, buf.length, start);
    const text = buf.toString("utf8");
    // A mid-line start is likely when we cut in; drop the partial first line.
    return start === 0 ? stripBom(text) : text.slice(text.indexOf("\n") + 1);
  } finally {
    closeSync(fd);
  }
}

function jsonLines<T>(text: string): T[] {
  const out: T[] = [];
  for (const line of text.split("\n")) {
    if (line.trim() === "") continue;
    try {
      out.push(JSON.parse(stripBom(line)) as T);
    } catch {
      // a torn tail line is expected; skip silently
    }
  }
  return out;
}

const HEARTBEAT_FRESH_S = 15 * 60;

export function projectState(root: string): ProjectionState {
  const abs = resolve(root);
  const nameplate = layout.nameplatePath(abs);
  const product = existsSync(nameplate) ? readJsonFile<{ product?: string }>(nameplate).product ?? basename(abs) : basename(abs);

  const sysMachine = loadSystematic(abs);
  const sesMachine = loadSession(abs);

  const tollPath = join(layout.seDir(abs), "toll.json");
  type TollFile = { last_update_ts: number; last_update?: TollUpdate & { todo?: string[] } };
  const toll = existsSync(tollPath) ? readJsonFile<TollFile>(tollPath) : undefined;
  const heartbeat =
    toll?.last_update === undefined
      ? null
      : { ...toll.last_update, age_s: Math.round((Date.now() - toll.last_update_ts) / 1000) };

  const iterations: IterationView[] = [];
  let openIteration: string | null = null;
  let openRoot = abs; // where the open iteration lives — trunk, or its worktree.
  let openMachine: MachineDecl | null = null;
  const iterationsDir = layout.iterations(abs);
  let lastVerify: ProjectionState["last_verify"] = null;
  if (existsSync(iterationsDir)) {
    for (const entry of readdirSync(iterationsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const instPath = layout.instancePath(abs, entry.name);
      if (!existsSync(instPath)) continue;
      const inst = readJsonFile<MachineInstance>(instPath);
      if (inst.status === "open") openIteration = inst.iteration;
      const evidenceDir = layout.evidenceDir(abs, inst.iteration);
      let goal: string | undefined;
      if (existsSync(evidenceDir)) {
        for (const f of readdirSync(evidenceDir).sort()) {
          const ev = readJsonFile<{ state: string; at: string; payload: Record<string, unknown> }>(join(evidenceDir, f));
          if (ev.state === "declare_goal" && goal === undefined) goal = String(ev.payload.goal ?? "");
          if ((ev.state === "verify" || ev.state === "verification") && (lastVerify === null || ev.at > lastVerify.at)) {
            const exit = Number(ev.payload.exit ?? -1);
            lastVerify = { ok: exit === 0, exit, at: ev.at, iteration: inst.iteration };
          }
        }
      }
      const done = new Set(inst.history.filter((h) => h.outcome === "filled").map((h) => h.state));
      const updatedAt = inst.history.at(-1)?.at;
      // Each iteration renders against ITS machine (floor flag 1).
      const instMachine = inst.machine === sysMachine?.id ? sysMachine : loadMachine(abs, inst.machine);
      if (inst.status === "open") openMachine = instMachine;
      iterations.push({
        id: inst.iteration,
        status: inst.status,
        current: inst.current,
        ...(goal !== undefined ? { goal } : {}),
        steps:
          instMachine !== null
            ? instMachine.states.filter((s) => s.kind !== "terminal").map((s) => ({ state: s.id, done: done.has(s.id) }))
            : [...done].map((state) => ({ state, done: true })),
        ...(updatedAt !== undefined ? { updated_at: updatedAt } : {}),
        worked_on:
          inst.status === "open" && heartbeat !== null && heartbeat.age_s < HEARTBEAT_FRESH_S,
      });
    }
  }
  // Worktree-resident iterations render on the SAME board: their instance,
  // machine and evidence live under the worktree root, but the board is one
  // surface (the requirement i5b left unmet — a worktree iteration was invisible).
  for (const w of openWorktrees(abs)) {
    const wInstPath = layout.instancePath(w.root, w.iteration);
    if (!existsSync(wInstPath)) continue;
    let winst: MachineInstance;
    try {
      winst = readJsonFile<MachineInstance>(wInstPath);
    } catch {
      continue;
    }
    if (iterations.some((it) => it.id === winst.iteration)) continue;
    if (winst.status === "open") {
      openIteration = winst.iteration;
      openRoot = w.root;
    }
    let wgoal: string | undefined;
    const wEvidenceDir = layout.evidenceDir(w.root, winst.iteration);
    if (existsSync(wEvidenceDir)) {
      for (const f of readdirSync(wEvidenceDir).sort()) {
        const ev = readJsonFile<{ state: string; payload: Record<string, unknown> }>(join(wEvidenceDir, f));
        if (ev.state === "declare_goal" && wgoal === undefined) wgoal = String(ev.payload.goal ?? "");
      }
    }
    const wdone = new Set(winst.history.filter((h) => h.outcome === "filled").map((h) => h.state));
    const wMachine = winst.machine === sysMachine?.id ? sysMachine : loadMachine(w.root, winst.machine);
    if (winst.status === "open") openMachine = wMachine;
    iterations.push({
      id: winst.iteration,
      status: winst.status,
      current: winst.current,
      ...(wgoal !== undefined ? { goal: wgoal } : {}),
      steps:
        wMachine !== null
          ? wMachine.states.filter((s) => s.kind !== "terminal").map((s) => ({ state: s.id, done: wdone.has(s.id) }))
          : [...wdone].map((state) => ({ state, done: true })),
      ...(winst.history.at(-1)?.at !== undefined ? { updated_at: winst.history.at(-1)!.at } : {}),
      worked_on: winst.status === "open" && heartbeat !== null && heartbeat.age_s < HEARTBEAT_FRESH_S,
    });
  }
  const planPath = layout.planPath(abs);
  if (existsSync(planPath)) {
    type Plan = { iterations?: { id: string; goal?: string; steps?: { text: string; owner?: boolean }[] }[] };
    const plan = readJsonFile<Plan>(planPath);
    for (const p of plan.iterations ?? []) {
      if (existsSync(layout.instancePath(abs, p.id))) continue; // started: the real record wins
      iterations.push({
        id: p.id,
        status: "planned",
        current: "-",
        ...(p.goal !== undefined ? { goal: p.goal } : {}),
        steps: (p.steps ?? []).map((s) => ({ state: s.text, done: false, ...(s.owner === true ? { owner: true } : {}) })),
        worked_on: false,
      });
    }
  }
  const rank = (it: IterationView): number => (it.status === "open" ? 0 : it.status === "planned" ? 1 : 2);
  iterations.sort((a, b) => rank(a) - rank(b) || (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));

  const grants = jsonLines<GrantRecord>(tailText(layout.grantsPath(abs))).slice(-10).reverse();

  const sessionStarted = existsSync(layout.lockPath(abs))
    ? readJsonFile<{ at?: string }>(layout.lockPath(abs)).at ?? null
    : null;

  type RawCall = {
    ts: string;
    tool: string;
    ok: boolean;
    args?: Record<string, unknown>;
    duration_ms?: number;
    detail?: { outcome?: string; response?: unknown; response_summary?: string };
  };
  const calls = jsonLines<RawCall>(tailText(join(layout.seDir(abs), "calls.jsonl")))
    .filter((c) => sessionStarted === null || c.ts >= sessionStarted)
    .slice(-200)
    .reverse()
    .map((c) => {
      const intent = c.args?.intent ?? (c.args?.update as { current_step?: unknown } | undefined)?.current_step;
      const response = c.detail?.response ?? c.detail?.response_summary ?? (c.tool === "se.run" ? c.detail : undefined);
      return {
        ts: c.ts,
        tool: c.tool,
        ok: c.ok,
        detail: JSON.stringify(c.args ?? {}).slice(0, 300),
        ...(c.duration_ms !== undefined ? { duration_ms: c.duration_ms } : {}),
        ...(typeof intent === "string" ? { intent } : {}),
        ...(c.args !== undefined ? { request: c.args } : {}),
        ...(response !== undefined ? { response } : {}),
      };
    });

  const openView = iterations.find((it) => it.status === "open");
  const machineStack: MachineFrame[] = [];
  // A seeding state renders marked (double border, sub-step count).
  const substepsOf = (sub: string | undefined, stateId: string): number | undefined => {
    if (sub === undefined) return undefined;
    const decl =
      sub === "iteration"
        ? openView === undefined
          ? null
          : loadIterationMachine(openRoot, openView.id, stateId)
        : loadMachine(abs, sub.replace(/^se\.machine-/, ""));
    return decl === null ? undefined : decl.states.filter((s) => s.kind !== "terminal").length;
  };
  if (sesMachine !== null) {
    const nestedState = sesMachine.states.find((s) => s.submachine !== undefined)?.id ?? "idle";
    const sessionCurrent = openView !== undefined ? nestedState : sessionStarted !== null ? "idle" : "lock_on";
    const sessionIdx = sesMachine.states.findIndex((s) => s.id === sessionCurrent);
    const sesRows = stateRows(sesMachine);
    machineStack.push({
      id: sesMachine.id,
      current: sessionCurrent,
      states: sesMachine.states.map((s, i) => {
        const substeps = substepsOf(s.submachine, s.id);
        return {
          id: s.id,
          kind: s.kind,
          ...(s.group !== undefined ? { group: s.group } : {}),
          status: s.id === sessionCurrent ? ("current" as const) : i < sessionIdx ? ("done" as const) : ("future" as const),
          row: sesRows[s.id] ?? i,
          ...(substeps !== undefined ? { substeps } : {}),
          statement: s.statement,
          guidance: s.guidance,
        };
      }),
    });
  }
  if (openView !== undefined && openMachine !== null) {
    const filled = new Set(openView.steps.filter((st) => st.done).map((st) => st.state));
    // Every active token lights up, not only the first-token alias.
    const openInst = readJsonFile<MachineInstance>(layout.instancePath(openRoot, openView.id));
    const activeIter = new Set(openInst.active ?? [openInst.current]);
    const iterRows = stateRows(openMachine);
    const seededFrom = sesMachine?.states.find((s) => s.submachine !== undefined)?.id;
    machineStack.push({
      id: openMachine.id,
      ...(seededFrom !== undefined ? { seeded_from: seededFrom } : {}),
      current: openView.current,
      states: openMachine.states.map((s, i) => {
        const substeps = substepsOf(s.submachine, s.id);
        return {
          id: s.id,
          kind: s.kind,
          ...(s.group !== undefined ? { group: s.group } : {}),
          status: activeIter.has(s.id) ? ("current" as const) : filled.has(s.id) ? ("done" as const) : ("future" as const),
          row: iterRows[s.id] ?? i,
          ...(substeps !== undefined ? { substeps } : {}),
          statement: s.statement,
          guidance: s.guidance,
        };
      }),
    });
  }

  // Seeded sub-machines render as further frames: session > iteration >
  // chunks. Every EXISTING sub-instance stays on the stack — a completed
  // build's chunk record remains divable, not just the live one.
  if (openView !== undefined && openMachine !== null) {
    for (const st of openMachine.states) {
      if (st.submachine === undefined) continue;
      const subPath = join(layout.iterationDir(openRoot, openView.id), `sub-${st.id}.json`);
      if (!existsSync(subPath)) continue;
      const child = readJsonFile<MachineInstance>(subPath);
      const childDecl =
        st.submachine === "iteration"
          ? loadIterationMachine(openRoot, openView.id, st.id)
          : loadMachine(abs, st.submachine.replace(/^se\.machine-/, ""));
      if (childDecl === null) continue;
      const childDone = new Set(child.history.filter((h) => h.outcome === "filled").map((h) => h.state));
      const activeChild = new Set(child.status === "open" ? child.active ?? [child.current] : []);
      const childRows = stateRows(childDecl);
      machineStack.push({
        id: childDecl.id,
        seeded_from: st.id,
        current: child.current,
        states: childDecl.states.map((s, i) => {
          const substeps = substepsOf(s.submachine, s.id);
          return {
            id: s.id,
            kind: s.kind,
            ...(s.group !== undefined ? { group: s.group } : {}),
            status: activeChild.has(s.id) ? ("current" as const) : childDone.has(s.id) ? ("done" as const) : ("future" as const),
            row: childRows[s.id] ?? i,
            ...(substeps !== undefined ? { substeps } : {}),
            statement: s.statement,
            guidance: s.guidance,
          };
        }),
      });
    }
  }

  return {
    product,
    root: abs,
    generated_at: new Date().toISOString(),
    board_version: BOARD_VERSION,
    session_started: sessionStarted,
    // Tabs are per AGENT, not per worktree: the main agent working in a
    // worktree is still one agent. A worktree iteration shows in the iterations
    // list + state machine (above), never as its own tab. Separate-agent tabs
    // return when parallel agents land.
    agents: [{ name: "mallard", role: "main" }],
    modules: loadModules(abs),
    iterations,
    open_iteration: openIteration,
    // ONE CARD, rendered once (owner ruling 2026-07-25: "just take the same
    // card"). briefHtml is the single renderer - the board paints this markup,
    // and the phone's hosted page carries the same string inside its
    // ciphertext. Two copies of a decision card can drift; one cannot.
    offer: ((o) => (o === null ? null : { ...o, card_html: briefHtml(o) }))(new Gate(openRoot).current()),
    heartbeat,
    grants,
    last_verify: lastVerify,
    machine_stack: machineStack,
    calls,
    notes: liveNotes(abs).slice(-10).reverse(),
  };
}

/** The inbox minus drained notes: a disposition line retires its target. */
function liveNotes(abs: string): NoteLine[] {
  const lines = jsonLines<NoteLine & { drain_of?: string }>(tailText(layout.notesPath(abs)));
  const drained = new Set(lines.filter((l) => l.drain_of !== undefined).map((l) => l.drain_of));
  return lines.filter((l) => l.ref !== undefined && !drained.has(l.ref));
}

/** The boot handover, rendered from the projection — the file is dead. */
export function renderHandover(s: ProjectionState): string {
  const lines: string[] = [
    `# Handover — ${s.product}`,
    "",
    "Generated from live state at boot. Nothing here is hand-maintained.",
    "",
    "## Modules",
    ...s.modules.map((m) => `- ${m.id}: ${m.status} (${m.detail})`),
    "",
    "## Iterations",
    ...(s.iterations.length === 0 ? ["- none yet — se_loop_start opens the first"] : []),
    ...s.iterations.map((it) => {
      const goal = it.goal ? ` — ${it.goal.slice(0, 120)}` : "";
      return `- ${it.id}: ${it.status} at ${it.current}${goal}`;
    }),
    "",
  ];
  if (s.offer) {
    lines.push("## Pending offer", "", "A gate offer awaits adjudication:", "", "```", s.offer.brief, "```", "");
  }
  if (s.open_iteration) {
    lines.push(`## Next step`, "", `Iteration ${s.open_iteration} is open — se_loop_next continues it.`, "");
  } else {
    lines.push(`## Next step`, "", "No iteration open. se_loop_start begins the next one.", "");
  }
  if (s.last_verify) {
    lines.push(`Last verify: ${s.last_verify.ok ? "green" : "RED"} (exit ${s.last_verify.exit}, ${s.last_verify.iteration}).`, "");
  }
  return lines.join("\n");
}

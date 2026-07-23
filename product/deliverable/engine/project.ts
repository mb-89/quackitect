// The projection: one JSON snapshot of everything the board and the boot
// handover render. Pure — reads state that already exists, writes nothing.
// Board, handover and any future surface (phone) render THIS, never their
// own re-derivation (single source of truth).
import { closeSync, existsSync, openSync, readSync, readdirSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { Gate, type GrantRecord, type Offer } from "./gate.ts";
import { readJsonFile, stripBom } from "./jsonio.ts";
import { layout } from "./layout.ts";
import type { MachineInstance } from "./machine.ts";
import { systematic } from "./machines/systematic.ts";
import { loadModules, type ModuleStatus } from "./modules.ts";
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
  /** Rejection/error payload — the response direction of the feed. */
  response?: unknown;
}

export interface NoteLine {
  ref: string;
  text: string;
  at: string;
}

export interface ProjectionState {
  product: string;
  root: string;
  generated_at: string;
  board_version: string;
  /** Admission time of the current session (the lock's timestamp); scopes the call feed. */
  session_started: string | null;
  /** One tab per agent; names are duck species, the driving agent is mallard. */
  agents: { name: string; role: string }[];
  modules: ModuleStatus[];
  iterations: IterationView[];
  open_iteration: string | null;
  offer: Offer | null;
  heartbeat: (TollUpdate & { todo?: string[]; age_s: number }) | null;
  grants: GrantRecord[];
  last_verify: { ok: boolean; exit: number; at: string; iteration: string } | null;
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

  const tollPath = join(layout.seDir(abs), "toll.json");
  type TollFile = { last_update_ts: number; last_update?: TollUpdate & { todo?: string[] } };
  const toll = existsSync(tollPath) ? readJsonFile<TollFile>(tollPath) : undefined;
  const heartbeat =
    toll?.last_update === undefined
      ? null
      : { ...toll.last_update, age_s: Math.round((Date.now() - toll.last_update_ts) / 1000) };

  const iterations: IterationView[] = [];
  let openIteration: string | null = null;
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
          if (ev.state === "verify") {
            const exit = Number(ev.payload.exit ?? -1);
            lastVerify = { ok: exit === 0, exit, at: ev.at, iteration: inst.iteration };
          }
        }
      }
      const done = new Set(inst.history.filter((h) => h.outcome === "filled").map((h) => h.state));
      const updatedAt = inst.history.at(-1)?.at;
      iterations.push({
        id: inst.iteration,
        status: inst.status,
        current: inst.current,
        ...(goal !== undefined ? { goal } : {}),
        steps: systematic.states.filter((s) => s.kind !== "terminal").map((s) => ({ state: s.id, done: done.has(s.id) })),
        ...(updatedAt !== undefined ? { updated_at: updatedAt } : {}),
        worked_on:
          inst.status === "open" && heartbeat !== null && heartbeat.age_s < HEARTBEAT_FRESH_S,
      });
    }
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
    detail?: { outcome?: string; response?: unknown };
  };
  const calls = jsonLines<RawCall>(tailText(join(layout.seDir(abs), "calls.jsonl")))
    .filter((c) => sessionStarted === null || c.ts >= sessionStarted)
    .slice(-200)
    .reverse()
    .map((c) => {
      const intent = c.args?.intent ?? (c.args?.update as { current_step?: unknown } | undefined)?.current_step;
      return {
        ts: c.ts,
        tool: c.tool,
        ok: c.ok,
        detail: JSON.stringify(c.args ?? {}).slice(0, 300),
        ...(c.duration_ms !== undefined ? { duration_ms: c.duration_ms } : {}),
        ...(typeof intent === "string" ? { intent } : {}),
        ...(c.detail?.response !== undefined ? { response: c.detail.response } : {}),
      };
    });

  return {
    product,
    root: abs,
    generated_at: new Date().toISOString(),
    board_version: BOARD_VERSION,
    session_started: sessionStarted,
    agents: [{ name: "mallard", role: "main" }],
    modules: loadModules(abs),
    iterations,
    open_iteration: openIteration,
    offer: new Gate(abs).current(),
    heartbeat,
    grants,
    last_verify: lastVerify,
    calls,
    notes: jsonLines<NoteLine>(tailText(layout.notesPath(abs))).slice(-10).reverse(),
  };
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

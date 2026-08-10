// Iterations — planned work, SEEDED AS A FUNCTION (owner design
// 2026-07-27; reshaped 2026-08-04): a seed mints the record and its
// worktree, and the iteration stands VISIBLE in the iterations container
// from that moment — standing in M0: the retro onboards, the kickoff
// sizes. The kickoff's bless pins the blessed column and the machine
// grows IN PLACE. The walk is FLAT: milestones are groups on the states,
// never sub-machines; only seeded chunk machines dive.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { type CanvasData, type CanvasEdge, type CanvasElement, nodeSize } from "./canvas.ts";
import { CLAUSES, Rejection } from "./errors.ts";
import { buildArchive, type GeneratedMachine } from "./expmachine.ts";
import { type EvidenceField, type MachineDecl, type StateDecl, validateMachine } from "./machine.ts";
import { noteOf, parseStateNote, readNode } from "./notes.ts";
import { CHANGE_COLUMNS, type ChangeColumn, compileColumn, compileM0, readRigorMatrix, rigorMatrixContentHash } from "./rigor-matrix.ts";
import { bustBranchList, listBranches, slug, worktreesDir } from "./worktree.ts";

const SRC = "engine/iterations.ts";

function git(root: string, args: string[], what: string): string {
  const r = spawnSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  if (r.status !== 0) {
    throw new Rejection({
      clause: CLAUSES.NOT_CONFIGURED,
      expected: `git ${what} to succeed`,
      got: (r.stderr ?? "").trim().slice(0, 500) || `exit ${r.status}`,
      remedy: { tool: "se_git", args: { args: ["status"] }, note: "inspect the repository state" },
      source: SRC,
    });
  }
  return r.stdout ?? "";
}

export interface Iteration {
  id: string;
  branch: string;
  path: string;
  open: boolean;
}

export function itRecordRel(id: string): string {
  return `project/spec/iterations/${id}/record.md`;
}

export function readItRecord(root: string, it: Iteration): Record<string, unknown> | undefined {
  const rel = itRecordRel(it.id);
  if (it.open) {
    const abs = join(it.path, rel);
    if (!existsSync(abs)) return undefined;
    return noteOf(abs)?.frontmatter;
  }
  const merged = join(root, rel);
  if (existsSync(merged)) return noteOf(merged)?.frontmatter;
  const r = spawnSync("git", ["show", `${it.branch}:${rel}`], { cwd: root, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  if (r.status !== 0) return undefined;
  return parseStateNote(r.stdout).frontmatter;
}

/** Open = the worktree exists. Closed = branch it/* without one. */
export function itList(root: string): Iteration[] {
  const out: Iteration[] = [];
  const branches = listBranches(root, "it/*");
  for (const branch of branches) {
    const id = branch.slice("it/".length);
    const path = join(worktreesDir(root), id);
    out.push({ id, branch, path, open: existsSync(path) });
  }
  return out.sort((a, b) => Number(a.id.match(/^i(\d+)/)?.[1] ?? 0) - Number(b.id.match(/^i(\d+)/)?.[1] ?? 0));
}

/** THE SEED: goal + rough vision, plus context inputs (an expedition id,
 *  retro note refs). Mints the record on its own branch and worktree —
 *  the iteration stands in the container at once. */
export function itSeed(root: string, goal: string, vision: string, inputs: string[] = []): Iteration {
  if (goal.trim() === "" || vision.trim() === "") {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a goal AND a rough vision — the seed is a small form, not a slogan",
      got: goal.trim() === "" ? "an empty goal" : "an empty vision",
      remedy: {
        tool: "se_seed_iteration",
        args: { goal: "<what>", vision: "<roughly how / what done looks like>" },
        note: "inputs: [] may carry an expedition id or note refs",
      },
      source: SRC,
    });
  }
  const n =
    itList(root).reduce((max, it) => {
      const m = it.id.match(/^i(\d+)-/);
      return m ? Math.max(max, Number(m[1])) : max;
    }, 0) + 1;
  const id = `i${n}-${slug(goal)}`;
  const path = join(worktreesDir(root), id);
  mkdirSync(worktreesDir(root), { recursive: true });
  git(root, ["worktree", "add", path, "-b", `it/${id}`], "worktree add");
  // AFTER the branch exists, never before. Busting first only refills the
  // cache from the old listing, and the new iteration then stays invisible
  // for the length of the window.
  bustBranchList();
  const deliverable = join(path, "project", "deliverable");
  if (existsSync(join(deliverable, "package.json")) && !existsSync(join(deliverable, "node_modules"))) {
    spawnSync("npm", ["install", "--no-audit", "--no-fund"], { cwd: deliverable, stdio: "ignore", shell: process.platform === "win32" });
  }
  const recAbs = join(path, itRecordRel(id));
  mkdirSync(dirname(recAbs), { recursive: true });
  writeFileSync(
    recAbs,
    [
      "---",
      `id: ${id}`,
      "status: seeded",
      `opened: ${new Date().toISOString()}`,
      `goal: ${JSON.stringify(goal)}`,
      `vision: ${JSON.stringify(vision)}`,
      "inputs:",
      ...inputs.map((i) => `  - ${JSON.stringify(i)}`),
      "---",
      "",
      `# ${id}`,
      "",
      "## Goal",
      "",
      goal,
      "",
      "## Rough vision",
      "",
      vision,
      "",
      ...(inputs.length > 0 ? ["## Inputs", "", ...inputs.map((i) => `- ${i}`), ""] : []),
    ].join("\n"),
    "utf8",
  );
  git(path, ["add", "-A"], "add");
  git(path, ["commit", "-q", "-m", `iteration ${id}: seed`], "commit");
  return { id, branch: `it/${id}`, path, open: true };
}

export function itFind(root: string, id: string): Iteration {
  const it = itList(root).find((x) => x.id === id);
  if (it === undefined || !it.open) {
    const open = itList(root)
      .filter((x) => x.open)
      .map((x) => x.id);
    throw new Rejection({
      clause: CLAUSES.PATH_ESCAPE,
      expected: `an OPEN iteration: ${open.join(", ") || "(none — seed one first)"}`,
      got: id,
      remedy: {
        tool: "se_seed_iteration",
        args: { goal: "<what>", vision: "<roughly how>" },
        note: "the iterations container lists the seeded ones",
      },
      source: SRC,
    });
  }
  return it;
}

/** First entry stamps `started:` — from then on the needs-retro gate no
 *  longer holds this iteration (re-entering running work is never blocked). */
export function markStarted(_root: string, it: Iteration): void {
  const recAbs = join(it.path, itRecordRel(it.id));
  if (!existsSync(recAbs)) return;
  const raw = readFileSync(recAbs, "utf8");
  if (/^started: /m.test(raw)) return;
  writeFileSync(recAbs, raw.replace(/^status: seeded$/m, `status: open\nstarted: ${new Date().toISOString()}`), "utf8");
  git(it.path, ["add", "-A"], "add");
  git(it.path, ["commit", "-q", "-m", `iteration ${it.id}: started`], "commit");
}

export function itPinRel(id: string): string {
  return `project/spec/iterations/${id}/machines/seeded.json`;
}

export function itSeededRel(id: string, kind: string): string {
  return `project/spec/iterations/${id}/machines/${kind}.md`;
}

/** THE SEEDED MACHINE (owner design 2026-07-30): an authoring state writes
 *  the drawing as markdown data in the record (machines/<kind>.md), and the
 *  matching runs-state descends into its compilation — build-chunks, spikes
 *  and candidates all share this one shape. Each step's realization kind
 *  becomes a TAG on its state, so the existing tag-pull serves each builder
 *  its discipline's guidance. An absent or empty drawing is a TYPED
 *  REFUSAL, never a plain serve — unless it carries an explicit none with
 *  its reason, which passes the run state without ceremony. */
function chunkList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string" && v.trim() !== "") return v.split(",").map((s) => s.trim());
  return [];
}

export function generateSeeded(_root: string, it: Iteration, machineId: string, kind: string): GeneratedMachine {
  const abs = join(it.path, itSeededRel(it.id, kind));
  const scaffold =
    '---\nsteps:\n  - id: <step>\n    statement: "<what this step builds or settles>"\n    depends_on: []\n    realization: software\n---\n';
  if (!existsSync(abs)) {
    throw new Rejection({
      clause: CLAUSES.CONDITION_UNMET,
      expected: `a seeded drawing — the authoring state writes ${itSeededRel(it.id, kind)} (frontmatter steps: id, statement, depends_on, realization — or none: "<why nothing runs>")`,
      got: `no ${kind}.md in the iteration record — a run without visible steps is a defect`,
      remedy: {
        tool: "se_file_write",
        args: { path: itSeededRel(it.id, kind), content: scaffold, base_hash: null },
        note: "seed the drawing at the authoring state, then pull again",
      },
      source: SRC,
    });
  }
  const fm = parseStateNote(readFileSync(abs, "utf8")).frontmatter;
  const raw = Array.isArray(fm.steps) ? fm.steps : Array.isArray(fm.chunks) ? fm.chunks : [];
  interface Chunk {
    id: string;
    statement: string;
    depends_on: string[];
    realization: string;
  }
  const chunks: Chunk[] = raw.map((entry, i) => {
    const c = (entry ?? {}) as Record<string, unknown>;
    if (typeof c.id !== "string" || c.id.trim() === "") {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `step ${i + 1} declares an id`,
        got: "a step without an id",
        remedy: {
          tool: "se_file_read",
          args: { path: itSeededRel(it.id, kind) },
          note: "every step carries id, statement, depends_on, realization",
        },
        source: SRC,
      });
    }
    return {
      id: c.id,
      statement: typeof c.statement === "string" ? c.statement : "",
      depends_on: chunkList(c.depends_on),
      realization: typeof c.realization === "string" && c.realization !== "" ? c.realization : "software",
    };
  });
  if (chunks.length === 0) {
    // AN EXPLICIT NONE passes the run state without ceremony — zero spikes
    // is a normal outcome when the drawing says WHY (the explicit-absence law).
    if (typeof fm.none === "string" && fm.none.trim() !== "") {
      const decl: MachineDecl = {
        id: machineId,
        reentry: "resume",
        initial: "start",
        states: [
          {
            id: "start",
            kind: "start",
            statement: "",
            guidance: `Nothing was seeded, explicitly: ${fm.none}`,
            evidence_form: [],
            priority: 0.01,
            edges: [{ to: "end", role: "normal" }],
          },
          {
            id: "end",
            kind: "end",
            statement: "",
            guidance: "The explicit none is recorded — pull once more to return to the walk.",
            evidence_form: [],
            priority: 0.01,
            edges: [],
          },
        ],
      };
      validateMachine(decl);
      return { decl, canvas: pinnedCanvas(decl), expByState: {} };
    }
    throw new Rejection({
      clause: CLAUSES.CONDITION_UNMET,
      expected: 'at least one step in the drawing, or an explicit none: "<why nothing runs>"',
      got: `${kind}.md carries an empty steps list with no reason`,
      remedy: {
        tool: "se_file_patch",
        args: { ops: [{ path: itSeededRel(it.id, kind), old_string: "steps:", new_string: "steps:\n  - id: <step>" }] },
        note: "a run without visible steps is a defect — absence must say why",
      },
      source: SRC,
    });
  }
  const ids = new Set(chunks.map((c) => c.id));
  const start: StateDecl = {
    id: "start",
    kind: "start",
    statement: "",
    guidance: "The seeded chunk machine — the build plan as states, parallel where independent.",
    evidence_form: [],
    priority: 0.01,
    edges: [],
  };
  const states: StateDecl[] = [start];
  const dependents = new Set(chunks.flatMap((c) => c.depends_on));
  for (const c of chunks) {
    for (const d of c.depends_on) {
      if (!ids.has(d)) {
        throw new Rejection({
          clause: CLAUSES.CONDITION_UNMET,
          expected: `chunk ${c.id} depends on a declared chunk`,
          got: d,
          remedy: {
            tool: "se_file_read",
            args: { path: itSeededRel(it.id, kind) },
            note: "dependencies name chunk ids from the same drawing",
          },
          source: SRC,
        });
      }
    }
    if (c.depends_on.length === 0) start.edges.push({ to: c.id, role: "normal" });
    states.push({
      id: c.id,
      kind: "work",
      statement: c.statement,
      guidance: `A build chunk — realization: ${c.realization}. The tag pulls the discipline's guidance.`,
      evidence_form: [{ name: "built", description: "what was built and where — the commit or artifact", required: true }],
      priority: 0.2,
      tags: [`realization-${c.realization}`],
      edges: [
        ...chunks.filter((o) => o.depends_on.includes(c.id)).map((o) => ({ to: o.id, role: "normal" as const })),
        ...(dependents.has(c.id) ? [] : [{ to: "end", role: "normal" as const }]),
      ],
    });
  }
  // THE BAR SITS ON THE END, AND THERE IS NO JOIN PILL (owner ruling
  // 2026-08-09). A build is done when EVERY leaf step is, so plain fan-in
  // would be an OR — but the bar is a FIELD, not a state, so the end pill
  // carries it directly.
  //
  // THE SEPARATE JOIN WAS CEREMONY. It held no evidence, asked nothing and
  // did no work; it merged, which the bar already does. A pill a reader
  // cannot act on is a pill that teaches them to click past pills.
  states.push({
    id: "end",
    kind: "end",
    busbar: true,
    statement: "",
    guidance: "Every step is done — the machine is complete here. Pull once more to return to the walk.",
    evidence_form: [],
    priority: 0.01,
    edges: [],
  });
  const decl: MachineDecl = { id: machineId, reentry: "resume", initial: "start", states };
  validateMachine(decl);
  return { decl, canvas: pinnedCanvas(decl), expByState: {} };
}

/** The escalation ladder IS the column list — one source, so the two cannot
 *  drift apart. */
const SIZE_ORDER = CHANGE_COLUMNS as readonly string[];

/** THE PIN (owner verdicts 2026-07-30): the kickoff bless compiles the
 *  blessed change size from the LIVE rigor matrix and pins the machine into
 *  the record with its content hash. Rigor matrix edits reach the NEXT
 *  kickoff, never a running walk; drift stays silent until asked.
 *  Escalation = re-pinning with a LARGER size — monotonicity guarantees
 *  every filled state survives. De-escalation is refused: a prediction
 *  that proved too big is finished at its size. */
export function pinIteration(root: string, it: Iteration, changeSize: string): Record<string, unknown> {
  if (!(CHANGE_COLUMNS as readonly string[]).includes(changeSize)) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: `a change size: ${CHANGE_COLUMNS.join(" | ")}`,
      got: changeSize,
      remedy: { tool: "se_pull", args: {}, note: "the kickoff's change_size field carries the choice" },
      source: SRC,
    });
  }
  const pinAbs = join(it.path, itPinRel(it.id));
  let prev: ParsedPin | undefined;
  if (existsSync(pinAbs)) {
    prev = parsePin(readFileSync(pinAbs, "utf8"));
    const from = SIZE_ORDER.indexOf(String(prev.change_size));
    const to = SIZE_ORDER.indexOf(changeSize);
    if (to <= from) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `an ESCALATION — the pin stands at ${String(prev.change_size)}, and only a larger size re-opens it; a prediction that proved too big is finished at its size`,
        got: changeSize,
        remedy: { tool: "se_pull", args: {}, note: "walk the pinned machine as it stands" },
        source: SRC,
      });
    }
  }
  const rigorMatrix = readRigorMatrix(root);
  const machine = compileColumn(rigorMatrix, changeSize as ChangeColumn);
  const demands = demandsFor(rigorMatrix, changeSize as ChangeColumn);
  const reopened = movedDemands(prev?.demands ?? {}, demands);
  const pin = {
    change_size: changeSize,
    rigor_matrix_hash: rigorMatrixContentHash(root),
    pinned_at: new Date().toISOString(),
    ...(reopened.length > 0 ? { reopened } : {}),
    demands,
  };
  mkdirSync(dirname(pinAbs), { recursive: true });
  writeFileSync(pinAbs, JSON.stringify(pin, null, 2), "utf8");
  git(it.path, ["add", "-A"], "add");
  // BOOKKEEPING, NOT AUTHORED WORK: this commit lands a generated file. It
  // skips the hook because a fresh worktree carries no node_modules, so the
  // hook's typechecker dies and the pin refuses before the walk has had any
  // chance to install one.
  git(it.path, ["commit", "-q", "--no-verify", "-m", `iteration ${it.id}: pin ${changeSize}`], "commit");
  return {
    pinned: changeSize,
    rigor_matrix_hash: pin.rigor_matrix_hash,
    states: machine.states.length,
    ...(reopened.length > 0 ? { reopened } : {}),
  };
}

export interface StepDemand {
  applies: string;
  evidence: string;
}

/** THE DEMANDS LEDGER: what each applied step ASKS FOR at this column — the
 *  ordinal applies, plus the evidence spec. The pin stores it, and every
 *  later look recomputes it and compares. */
export function demandsFor(rigorMatrix: ReturnType<typeof readRigorMatrix>, changeSize: ChangeColumn): Record<string, StepDemand> {
  const demands: Record<string, StepDemand> = {};
  for (const row of rigorMatrix.rows) {
    const cell = rigorMatrix.cells.get(row.name)!.get(changeSize)!;
    if (cell.applies === "none") continue;
    demands[row.name] = { applies: cell.applies, evidence: demandOf(row.evidence_form) };
  }
  return demands;
}

/** WHAT A STEP ASKS FOR, with the prose stripped out.
 *
 *  A field's description and guidance TELL whoever fills it what belongs
 *  there. They do not change what belongs there. So rewording them must not
 *  reopen a step that already answered the question.
 *
 *  "Guidance-only wording never reopens" was the rule from the start and was
 *  never implemented: the whole field list was serialised, prose included.
 *  Linking a method card into one row's vision field reopened three
 *  milestones of passed work, which is how this was found.
 *
 *  Everything else IS the demand: the field's name, whether it is required,
 *  the shape of the answer, and the template and arguments that bound it. */
export function demandOf(fields: EvidenceField[]): string {
  return JSON.stringify(
    fields.map((f) => [
      f.name,
      f.required,
      f.type ?? "",
      f.columns ?? [],
      f.template ?? "",
      f.of ?? "",
      f.options ?? [],
      f.items ?? [],
      f.passing ?? [],
    ]),
  );
}

/** A PIN TAKEN BEFORE demandOf EXISTED stored the whole field list. Compare
 *  it through the same stripper, or changing the digest would reopen every
 *  step in every standing iteration exactly once — a migration nobody asked
 *  for, wearing the clothes of a real finding. */
function structural(evidence: string): string {
  try {
    const parsed: unknown = JSON.parse(evidence);
    if (Array.isArray(parsed) && parsed.every((f) => typeof f === "object" && f !== null && "name" in f)) {
      return demandOf(parsed as EvidenceField[]);
    }
  } catch {
    // not JSON at all — compare the raw strings
  }
  return evidence;
}

/** REOPEN (owner verdict 2026-07-30): a filled step survives only while its
 *  demand stands. applies stepped UP, or the evidence spec changed — the step
 *  reopens and its evidence is re-earned. Guidance-only wording never reopens,
 *  and a WEAKENED demand never does either: what was filed already covers it.
 *
 *  Only steps the previous ledger knew are compared. A step that did not exist
 *  then is not in the pinned machine, so there is nothing there to reopen. */
export function movedDemands(prev: Record<string, StepDemand>, now: Record<string, StepDemand>): string[] {
  return Object.keys(prev)
    .filter((id) => {
      const o = prev[id];
      const n = now[id];
      if (n === undefined) return false;
      if (o === undefined || (APPLIES_RANK[n.applies] ?? 0) > (APPLIES_RANK[o.applies] ?? 0)) return true;
      return structural(n.evidence) !== structural(o.evidence);
    })
    .sort();
}

/** THE PIN CATCHES UP WITH THE DEFINITION: the whole column is recompiled at
 *  the SAME size, and the ledger and the hash are re-taken with it.
 *
 *  THE MACHINE GOES TOO, and that is the point. A step reopens because what it
 *  ASKS FOR changed. Re-taking only the ledger would reopen the step and then
 *  hand back the OLD form — the walk re-earns evidence against the question we
 *  just decided no longer stands. Seen live: frame-delta's field became a
 *  reference list, the step reopened, and the form still offered free prose.
 *
 *  WITHOUT THE RE-TAKE IT NEVER TERMINATES. The step reopens, the agent
 *  re-earns it, the next pull finds the pin still stale and reopens it again.
 *
 *  IT IS NOT AN ESCALATION. The change size is untouched, so pinIteration's
 *  refusal to de-escalate has nothing to say here. */
export function repinColumn(root: string, it: Iteration): void {
  const pinAbs = join(it.path, itPinRel(it.id));
  if (!existsSync(pinAbs)) return;
  const pin = parsePin(readFileSync(pinAbs, "utf8")) as ParsedPin & Record<string, unknown>;
  if (pin.change_size === undefined) return;
  pin.demands = demandsFor(readRigorMatrix(root), pin.change_size as ChangeColumn);
  pin.rigor_matrix_hash = rigorMatrixContentHash(root);
  delete pin.machine; // derived from change_size now — a stored copy only goes stale
  writeFileSync(pinAbs, JSON.stringify(pin, null, 2), "utf8");
}

/** THE LIVE DRIFT: which of this iteration's steps were passed against a
 *  demand that has since moved.
 *
 *  IT WRITES NOTHING, on purpose. A person opening the machine to look must
 *  never change the record, so this is computed on the way to the screen and
 *  thrown away. The walk entering the iteration is what turns it into a
 *  reopen — one computation, two callers, one writer.
 *
 *  WHY NOT AT THE PIN. A pin is only rewritten on an escalation, so a matrix
 *  edit under a standing iteration moved nothing and every passed step stayed
 *  green against a question that no longer existed. Green has to mean still
 *  green NOW.
 *
 *  THE CHEAP PATH IS THE COMMON ONE. The hash answers "did anything move at
 *  all" for about 3ms against a ~900ms render; only a moved hash pays for the
 *  read and the diff. */
export function iterationDrift(root: string, it: Iteration): string[] {
  const pinAbs = join(it.path, itPinRel(it.id));
  if (!existsSync(pinAbs)) return [];
  const pin = parsePin(readFileSync(pinAbs, "utf8"));
  if (pin.change_size === undefined || pin.demands === undefined) return [];
  if (pin.rigor_matrix_hash === rigorMatrixContentHash(root)) return [];
  return movedDemands(pin.demands, demandsFor(readRigorMatrix(root), pin.change_size as ChangeColumn));
}

/** tailored is always tailored DOWN (owner ruling 2026-07-30); inherit
 *  defers to the fuller content, so it ranks with full. */
const APPLIES_RANK: Record<string, number> = { none: 0, tailored: 1, inherit: 2, full: 2 };

interface ParsedPin {
  change_size?: string;
  rigor_matrix_hash?: string;
  demands?: Record<string, StepDemand>;
}

function parsePin(raw: string): ParsedPin {
  try {
    return JSON.parse(raw) as ParsedPin;
  } catch {
    return {};
  }
}

export function itShortId(itId: string): string {
  const m = itId.match(/^(i\d+)-/);
  return m ? m[1] : itId;
}

/** THE ITERATIONS CONTAINER, generated: every open iteration is ONE node
 *  whose machine is the iteration's own walk — M0 alone until the
 *  kickoff's bless pins a column, the full pinned machine after. The walk
 *  shows FLAT: milestones are groups on the states, never sub-machines
 *  (owner ruling 2026-08-04). Nothing open: start runs to end. */
export function generateIterations(root: string): GeneratedMachine {
  let open: Iteration[] = [];
  try {
    open = itList(root).filter((it) => it.open);
  } catch {
    open = [];
  }
  const start: StateDecl = {
    id: "start",
    kind: "start",
    statement: "",
    guidance:
      "The seeded container: every open iteration stands as its own machine. Entering one binds its worktree and stamps it started.",
    evidence_form: [],
    priority: 0.01,
    edges: [],
  };
  const states: StateDecl[] = [start];
  const expByState: Record<string, string> = {};
  const subGen: Record<string, () => GeneratedMachine> = {};
  const nodes: GenNode[] = [];
  const edges: GenEdge[] = [];
  // TOP TO BOTTOM, like every machine reads (owner ruling 2026-08-04): the
  // start pill, the open iterations stacked, the end pill.
  nodes.push(pill("n-start", "start.md", 0));
  let nextY = 300;
  for (const it of open) {
    const sid = itShortId(it.id);
    const fm = readItRecord(root, it);
    const goal = typeof fm?.goal === "string" ? fm.goal : it.id;
    expByState[sid] = it.id;
    states.push({
      id: sid,
      kind: "work",
      statement: goal,
      guidance:
        "The iteration's own machine — enter it and the walk stands in M0: the retro onboards, the kickoff proposes a size, and the bless pins the full column. Goal, vision and inputs live in the record.",
      evidence_form: [],
      priority: 0.2,
      submachine: "generated",
      edges: [{ to: "end", role: "normal" }],
    });
    subGen[sid] = () => generateIterationWalk(root, it, sid);
    start.edges.push({ to: sid, role: "normal" });
    const size = nodeSize(sid, goal);
    nodes.push({ id: `n-${sid}`, type: "file", file: `${sid}.md`, x: -size.width / 2, y: nextY, ...size });
    nextY += size.height + 160;
  }
  nodes.push(pill("n-end", "end.md", nextY));
  const els = new Map<string, CanvasElement>(nodes.map((n) => [n.id, n]));
  for (const it of open) {
    const sid = itShortId(it.id);
    edges.push(sidedEdge(els, "n-start", `n-${sid}`), sidedEdge(els, `n-${sid}`, "n-end"));
  }
  if (open.length === 0) {
    start.edges.push({ to: "end", role: "normal" });
    edges.push(sidedEdge(els, "n-start", "n-end"));
  }
  states.push({
    id: "end",
    kind: "end",
    statement: "",
    guidance: "Left the iterations container — running work parks where it stands; a seeded one waits in M0.",
    evidence_form: [],
    priority: 0.01,
    edges: [],
  });
  const decl: MachineDecl = { id: "iterations", reentry: "restart", initial: "start", states };
  validateMachine(decl);
  const canvas: CanvasData = {
    nodes: nodes as CanvasElement[],
    edges,
    metadata: { frontmatter: { reentry: "restart", priority: 0.4 } },
  };
  return { decl, canvas, expByState, ...(Object.keys(subGen).length > 0 ? { subGen } : {}) };
}

type GenNode = CanvasElement & { styleAttributes?: Record<string, unknown> };
type GenEdge = CanvasEdge & { fromSide?: string; toSide?: string };

/** The round start and end every machine shares, centred on the axis. */
function pill(id: string, file: string, y: number): GenNode {
  return { id, type: "file", file, x: -80, y, width: 160, height: 160, styleAttributes: { shape: "pill" } };
}

/** Which sides an arrow uses, from the boxes' relative positions — the
 *  drawing reads top to bottom, so flow leaves a bottom and enters a top.
 *  Declared on the edge, exactly as a person picks sides in Obsidian. */
function sidedEdge(els: Map<string, CanvasElement>, fromId: string, toId: string, id?: string): GenEdge {
  const a = els.get(fromId)!;
  const b = els.get(toId)!;
  const dy = b.y + b.height / 2 - (a.y + a.height / 2);
  const dx = b.x + b.width / 2 - (a.x + a.width / 2);
  const vertical = Math.abs(dy) >= Math.abs(dx);
  const sides = vertical
    ? dy >= 0
      ? { fromSide: "bottom", toSide: "top" }
      : { fromSide: "top", toSide: "bottom" }
    : dx >= 0
      ? { fromSide: "right", toSide: "left" }
      : { fromSide: "left", toSide: "right" };
  return { id: id ?? `e-${fromId}-${toId}`, fromNode: fromId, toNode: toId, ...sides };
}

/** The iteration's machine, COMPILED LIVE at call time from the pinned
 *  COLUMN. The pin records WHICH column this iteration walks; the shape of
 *  that column and every form in it are derived from the matrix, so a row
 *  edited a moment ago shows on the next render — from anywhere, with nobody
 *  standing in the machine.
 *
 *  THE MACHINE IS NOT STORED (owner ruling 2026-08-05). A frozen copy made
 *  the walk hand back the OLD question after the drift had already reopened
 *  the step for asking a new one, and a reader looking at the state saw a
 *  form the matrix had stopped asking for.
 *
 *  WHAT THE ITERATION WAS JUDGED AGAINST is the pin's DEMANDS LEDGER, which
 *  is a different record and the one the drift check reads. Freezing the
 *  machine never served that job; the ledger always did.
 *
 *  The machine id is the iteration's short id either way, so evidence keys
 *  and history survive. */
function generateIterationWalk(root: string, it: Iteration, sid: string): GeneratedMachine {
  let size: string | undefined;
  try {
    // THROUGH THE DOOR. 93 reads and 77 ms to enter one record — the single
    // most expensive read site in the profile, for one small pin file.
    size = (JSON.parse(readNode(join(it.path, itPinRel(it.id)))) as { change_size?: string }).change_size;
  } catch {
    size = undefined;
  }
  const matrix = readRigorMatrix(root);
  const walked = size !== undefined && (CHANGE_COLUMNS as readonly string[]).includes(size);
  const m: MachineDecl = walked ? { ...compileColumn(matrix, size as ChangeColumn), id: sid } : compileM0(matrix, sid);
  return {
    decl: m,
    canvas: pinnedCanvas(m),
    expByState: {},
    // TWO KINDS OF SUB-MACHINE, told apart by the name (owner ruling
    // 2026-08-08). A SEEDED one is authored per iteration and lives in the
    // record, so it is generated here: build-chunks, spikes, candidates.
    // A STATIC one is method — the same five finders every time — and its
    // drawing is a .canvas under machines/. Naming a file is what says so.
    //
    // A static name is left OUT of subGen on purpose. Session.seedSubs and
    // Session.declForPrefix both fall back to compiling the ref when no
    // generator answers, which is exactly the right path for a drawing.
    // Registering it here instead sent the walk looking for a seeded file
    // in the record and refused with "a run without visible steps".
    subGen: Object.fromEntries(
      m.states
        .filter((s) => s.submachine !== undefined && !s.submachine.endsWith(".canvas"))
        .map((s) => [s.id, () => generateSeeded(root, it, s.id, s.submachine!)]),
    ),
  };
}

/** In-group dependency layers: a state sits one row below its deepest
 *  in-group predecessor; independent states share the row. */
function groupLayers(m: MachineDecl, groupOf: (s: StateDecl) => string): Map<string, number> {
  const byId = new Map(m.states.map((s) => [s.id, s]));
  const preds = new Map<string, string[]>();
  for (const s of m.states) {
    for (const e of s.edges) {
      const list = preds.get(e.to) ?? [];
      list.push(s.id);
      preds.set(e.to, list);
    }
  }
  const memo = new Map<string, number>();
  const layerOf = (id: string, visiting: Set<string>): number => {
    const hit = memo.get(id);
    if (hit !== undefined) return hit;
    if (visiting.has(id)) return 0;
    visiting.add(id);
    const s = byId.get(id);
    let layer = 0;
    for (const p of preds.get(id) ?? []) {
      const ps = byId.get(p);
      if (s !== undefined && ps !== undefined && groupOf(ps) === groupOf(s)) layer = Math.max(layer, layerOf(p, visiting) + 1);
    }
    visiting.delete(id);
    memo.set(id, layer);
    return layer;
  };
  for (const s of m.states) layerOf(s.id, new Set());
  return memo;
}

const LAYOUT = { gapX: 60, gapY: 90, pad: 44, labelH: 34, groupGap: 150 } as const;

interface LayoutCtx {
  nodes: GenNode[];
  els: Map<string, CanvasElement>;
}

/** A STATE SITS UNDER ITS INPUTS (owner ruling 2026-08-06).
 *
 *  Every row used to be centred on the axis, whatever fed it. A row of three
 *  above a row of one put the lone dependant under the MIDDLE of the three —
 *  whoever that happened to be — and drew its real parent's arrow straight
 *  past it. A reader cannot tell that picture from a join, which is the exact
 *  confusion the busbar exists to remove.
 *
 *  It bit generalize-use-cases in M2: one input, write-stories, and it drew
 *  under map-stakeholders with write-stories' arrow running through.
 *
 *  So each node WANTS the mean centre of its already-placed inputs, and one
 *  input means it lands squarely under that input. Wants collide, so the row
 *  is laid out in want order with the gap enforced, then shifted so its own
 *  centre lands where the wants averaged. A row whose inputs are not placed
 *  yet — the start pill, the first row of a group — keeps the old centring. */
function placeRow(ctx: LayoutCtx, row: StateDecl[], atY: number, inputsOf?: Map<string, string[]>): number {
  const sized = row.map((s) => ({
    s,
    el:
      s.kind === "start" || s.kind === "end" || s.kind === "terminal"
        ? pill(`n-${s.id}`, `${s.id}.md`, atY)
        : ({ id: `n-${s.id}`, type: "file", file: `${s.id}.md`, x: 0, y: atY, ...nodeSize(s.id, s.statement) } as GenNode),
  }));
  const centreOf = (id: string): number | undefined => {
    const el = ctx.els.get(`n-${id}`);
    return el === undefined ? undefined : el.x + el.width / 2;
  };
  const want = new Map<string, number>();
  for (const item of sized) {
    const cs = (inputsOf?.get(item.s.id) ?? []).map(centreOf).filter((c): c is number => c !== undefined);
    if (cs.length > 0) want.set(item.s.id, cs.reduce((a, b) => a + b, 0) / cs.length);
  }
  const total = sized.reduce((w, x) => w + x.el.width, 0) + LAYOUT.gapX * (sized.length - 1);
  if (want.size > 0) {
    const byWant = [...sized].sort((a, b) => (want.get(a.s.id) ?? 0) - (want.get(b.s.id) ?? 0));
    let cursor = Number.NEGATIVE_INFINITY;
    for (const item of byWant) {
      const w = want.get(item.s.id);
      const ideal = w === undefined ? cursor : w - item.el.width / 2;
      item.el.x = cursor === Number.NEGATIVE_INFINITY ? ideal : Math.max(cursor, ideal);
      cursor = item.el.x + item.el.width + LAYOUT.gapX;
    }
    // Enforcing the gap pushes everything rightward, so put the row back on
    // the centre its wants asked for. With one node this shift is zero and
    // the node stays exactly under its input.
    const left = Math.min(...byWant.map((i) => i.el.x));
    const right = Math.max(...byWant.map((i) => i.el.x + i.el.width));
    const wants = [...want.values()];
    const drift = wants.reduce((a, b) => a + b, 0) / wants.length - (left + right) / 2;
    for (const item of byWant) item.el.x += drift;
  } else {
    let x = -total / 2;
    for (const item of sized) {
      item.el.x = x;
      x += item.el.width + LAYOUT.gapX;
    }
  }
  let tallest = 0;
  for (const item of sized) {
    tallest = Math.max(tallest, item.el.height);
    ctx.nodes.push(item.el);
    ctx.els.set(item.el.id, item.el);
  }
  return tallest;
}

/** Who feeds whom, by the same rule the busbar and the submit check use:
 *  a normal or approval edge is an input; fallback and recovery are not. */
function inputsOf(m: MachineDecl): Map<string, string[]> {
  const INPUT_ROLES = new Set(["normal", "approval"]);
  const map = new Map<string, string[]>();
  for (const s of m.states) {
    for (const e of s.edges) {
      if (!INPUT_ROLES.has(e.role ?? "normal")) continue;
      map.set(e.to, [...(map.get(e.to) ?? []), s.id]);
    }
  }
  return map;
}

/** One milestone's box: its states in dependency rows, wrapped and
 *  labelled; answers the y below the box. */
function placeGroup(
  ctx: LayoutCtx,
  g: string,
  members: StateDecl[],
  layers: Map<string, number>,
  boxTop: number,
  feeders?: Map<string, string[]>,
): number {
  let rowY = boxTop + LAYOUT.labelH + LAYOUT.pad;
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  const depth = Math.max(...members.map((s) => layers.get(s.id) ?? 0));
  for (let r = 0; r <= depth; r++) {
    const row = members.filter((s) => (layers.get(s.id) ?? 0) === r);
    if (row.length === 0) continue;
    const tallest = placeRow(ctx, row, rowY, feeders);
    for (const s of row) {
      const el = ctx.els.get(`n-${s.id}`)!;
      minX = Math.min(minX, el.x);
      maxX = Math.max(maxX, el.x + el.width);
    }
    rowY += tallest + LAYOUT.gapY;
  }
  const boxBottom = rowY - LAYOUT.gapY + LAYOUT.pad;
  // AN UNNAMED GROUP DRAWS NO BOX. A hand-drawn machine's states carry no
  // milestone, and a box labelled with nothing is furniture.
  if (g !== "") {
    ctx.nodes.push({
      id: `g-${g}`,
      type: "group",
      label: g,
      x: minX - LAYOUT.pad,
      y: boxTop,
      width: maxX - minX + LAYOUT.pad * 2,
      height: boxBottom - boxTop,
    });
  }
  return boxBottom + LAYOUT.groupGap;
}

/** A drawn view of ANY machine, top to bottom like the walk reads: the
 *  shared start and end pills, each milestone a labelled group box, states
 *  inside layered by dependency — independent ones side by side — and every
 *  edge declaring its sides.
 *
 *  EXPORTED, AND NOT ONLY FOR GENERATED MACHINES (owner ruling 2026-08-08).
 *  A hand-drawn sub-machine served its authored x and y, so it read left to
 *  right while every compiled machine read top to bottom, and a fan's AND bar
 *  did not look like a bar. Same layout, whatever built the states. */
export function pinnedCanvas(m: MachineDecl): CanvasData {
  // A HAND-DRAWN MACHINE HAS NO MILESTONES, and that is not a defect. Its
  // states lay out in the same dependency rows, without a labelled box
  // around them.
  const isPill = (s: StateDecl): boolean => s.kind === "start" || s.kind === "end" || s.kind === "terminal";
  const groupOf = (s: StateDecl): string => (isPill(s) ? "" : (s.group ?? ""));
  const layers = groupLayers(m, groupOf);
  const order: string[] = [];
  for (const s of m.states) {
    if (isPill(s)) continue;
    const g = groupOf(s);
    if (!order.includes(g)) order.push(g);
  }
  const ctx: LayoutCtx = { nodes: [], els: new Map() };
  const feeders = inputsOf(m);
  let y = 0;
  for (const s of m.states) {
    if (s.kind !== "start") continue;
    y += placeRow(ctx, [s], y) + LAYOUT.groupGap;
  }
  for (const g of order) {
    y = placeGroup(
      ctx,
      g,
      m.states.filter((s) => !isPill(s) && groupOf(s) === g),
      layers,
      y,
      feeders,
    );
  }
  for (const s of m.states) {
    if (s.kind !== "end" && s.kind !== "terminal") continue;
    y += placeRow(ctx, [s], y) + LAYOUT.groupGap;
  }
  const { nodes, els } = ctx;
  const edges: GenEdge[] = [];
  for (const s of m.states) {
    for (const e of s.edges) {
      if (!els.has(`n-${s.id}`) || !els.has(`n-${e.to}`)) continue;
      edges.push(sidedEdge(els, `n-${s.id}`, `n-${e.to}`, `e-${s.id}-${e.to}`));
    }
  }
  return { nodes: nodes as CanvasElement[], edges, routed: true, metadata: { frontmatter: { reentry: "resume", priority: 0.2 } } };
}

/** THE ITERATION ARCHIVE, generated like the expedition archive — the
 *  same decade shape (owner ruling: both archives). */
export function generateIterationArchive(root: string): GeneratedMachine {
  let closed: Iteration[] = [];
  try {
    closed = itList(root).filter((it) => !it.open);
  } catch {
    closed = [];
  }
  const entries = closed.map((it) => {
    const fm = readItRecord(root, it);
    return { sid: itShortId(it.id), full: it.id, goal: typeof fm?.goal === "string" ? fm.goal : "" };
  });
  return buildArchive("iteration_archive", entries, "iteration");
}

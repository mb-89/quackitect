// Iterations — planned work, SEEDED AS A FUNCTION (owner design
// 2026-07-27; reshaped 2026-08-04): a seed mints the record and its
// worktree, and the iteration stands VISIBLE in the iterations container
// from that moment — standing in M0: the retro onboards, the kickoff
// sizes. The kickoff's bless pins the blessed column and the machine
// grows IN PLACE. The walk is FLAT: milestones are groups on the states,
// never sub-machines; only seeded chunk machines dive.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { type CanvasData, type CanvasEdge, type CanvasElement, nodeSize } from "./canvas.ts";
import { CLAUSES, Rejection } from "./errors.ts";
import { buildArchive, type GeneratedMachine } from "./expmachine.ts";
import { type EvidenceField, type MachineDecl, type StateDecl, validateMachine } from "./machine.ts";
import { noteOf, parseStateNote, readNode } from "./notes.ts";
import { CHANGE_COLUMNS, type ChangeColumn, compileColumn, compileM0, readRigorMatrix, rigorMatrixContentHash } from "./rigor-matrix.ts";
import { dependsOnLines } from "./seed.ts";
import { slug } from "./worktree.ts";

/** THE PIN'S PLACEHOLDER, verbatim. It is written when an iteration pins a
 *  column and read back when the walk tries to enter the drawing it stands
 *  for — so it lives in ONE place and the two ends cannot drift apart. */
export const SCAFFOLD_NONE =
  "not authored yet - the authoring state writes this drawing; this placeholder keeps the route drawable until then";

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
  /** Whether the seed's stub push reached the remote in the seeding act. */
  announced?: boolean;
}

export function itRecordRel(id: string): string {
  return `project/spec/iterations/${id}/record.md`;
}

/** see dsp-record-lifecycle.md#one-tree-one-path */
export function readItRecord(root: string, it: Iteration): Record<string, unknown> | undefined {
  const abs = join(root, itRecordRel(it.id));
  if (!existsSync(abs)) return undefined;
  return noteOf(abs)?.frontmatter;
}

/** see dsp-record-lifecycle.md#the-statuses-a-record-cannot-be-walked-from */
export const RECORD_FINISHED: ReadonlySet<string> = new Set(["shipped", "closed"]);

/** EVERY RECORD IS A FOLDER ON TRUNK, and OPEN comes from its own status.
 *
 *  BEFORE THIS the list came from `it/*` branches and open meant "a worktree
 *  directory exists". Both halves were wrong for the same reason: they asked
 *  the filesystem a question the record already answers.
 *
 *  THE BRANCH FIELD STAYS on the shape, spelled from the id, because callers
 *  still name it and nothing yet reads it as a place to fetch from. It goes
 *  when the branches do. */
export function itList(root: string): Iteration[] {
  const dir = join(root, "project", "spec", "iterations");
  if (!existsSync(dir)) return [];
  const out: Iteration[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const id = e.name;
    // A FOLDER WITHOUT A RECORD IS NOT A RECORD. Evidence can be written
    // before the record on a half-made seed, and a directory alone must never
    // put an iteration on the container's offer.
    const abs = join(dir, id, "record.md");
    if (!existsSync(abs)) continue;
    const status = String(noteOf(abs)?.frontmatter.status ?? "");
    out.push({ id, branch: `it/${id}`, path: root, open: !RECORD_FINISHED.has(status) });
  }
  return out.sort((a, b) => Number(a.id.match(/^i(\d+)/)?.[1] ?? 0) - Number(b.id.match(/^i(\d+)/)?.[1] ?? 0));
}

// ADOPTING A PUSHED ITERATION IS GONE (i34). `itAdopt` was the second
// machine's half of the seed: a peer cloned, got the branch alone, and had to
// check it out into a worktree before the record could be seen at all.
//
// NOTHING IS MISSING ON A CLONE ANY MORE. A record is a folder on trunk, so a
// clone that has trunk has every record by construction, and there is no half
// left to bind.

/** THE SEED: goal + rough vision, plus context inputs (an expedition id,
 *  retro note refs). Mints the record's FOLDER ON TRUNK — the iteration
 *  stands in the container at once, and there is nothing else to make.
 *
 *  WHAT THE SEED STOPPED DOING AT i34, and why it is all one change:
 *
 *  - NO WORKTREE. There is one tree, so there is nothing to add.
 *  - NO BRANCH. The folder IS the record; a branch held nothing else.
 *  - NO PUSH. The seed push existed to announce a stub to a peer that would
 *    claim it, and the claim system is retired.
 *  - NO npm install. That paid for a second tree's node_modules.
 *
 *  THE CHUNK BOUNDARY WAS DRAWN WHERE THE CODE HAS NONE. The plan separated
 *  "records stand on trunk" from "the seed stops making worktrees", and the
 *  first is simply false until the second lands: a list that reads folders
 *  finds nothing while the seed writes into a worktree. Twelve tests said so. */
export function itSeed(root: string, goal: string, vision: string, inputs: string[] = [], dependsOn: string[] = []): Iteration {
  if (goal.trim() === "" || vision.trim() === "") {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a goal AND a rough vision — the seed is a small form, not a slogan",
      got: goal.trim() === "" ? "an empty goal" : "an empty vision",
      remedy: {
        tool: "se_seed_iteration",
        args: { goal: "<what>", vision: "<roughly how / what done looks like>", depends_on: [] },
        note: "inputs: [] may carry an expedition id or note refs; depends_on: [] states that this waits for nothing",
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
  const recAbs = join(root, itRecordRel(id));
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
      // see dsp-record-lifecycle.md#the-container-is-a-dag
      ...dependsOnLines(dependsOn),
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
  git(root, ["add", "--", itRecordRel(id)], "add");
  git(root, ["commit", "-q", "-m", `iteration ${id}: seed`, "--", itRecordRel(id)], "commit");
  return { id, branch: `it/${id}`, path: root, open: true };
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
        args: { goal: "<what>", vision: "<roughly how>", depends_on: [] },
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

/** see dsp-record-lifecycle.md#the-seeded-machine */
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
    // see dsp-record-lifecycle.md#an-unauthored-sub-machine-may-be-drawn-never-entered
    if (typeof fm.none === "string" && fm.none.trim() !== "") {
      const decl: MachineDecl = {
        id: machineId,
        reentry: "resume",
        initial: "start",
        ...(fm.none.trim() === SCAFFOLD_NONE ? { scaffold: true } : {}),
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
      // A SPIKE'S EVIDENCE IS ITS EXPERIMENT REF, never free text (owner
      // ruling 2026-08-10) — the result lives on the exp- node, and the
      // form links it.
      evidence_form:
        kind === "spikes"
          ? [
              {
                name: "built",
                template: "refs",
                of: "experiment",
                description: "the experiment node this spike wrote — one reference",
                required: true,
              },
            ]
          : [{ name: "built", description: "what was built and where — the commit or artifact", required: true }],
      priority: 0.2,
      // A drawn step is WORK — without a grant it compiled to no tools at
      // all, and the first real spike could not run its own measurement.
      legal_tools: [
        "se_file_read",
        "se_file_write",
        "se_file_patch",
        "se_file_search",
        "se_file_glob",
        "se_file_list",
        "se_run",
        "se_test",
        "se_git",
        "se_log_query",
        "se_answer",
        "se_web_search",
        "se_web_fetch",
      ],
      tags: [`realization-${c.realization}`],
      edges: [
        ...chunks.filter((o) => o.depends_on.includes(c.id)).map((o) => ({ to: o.id, role: "normal" as const })),
        ...(dependents.has(c.id) ? [] : [{ to: "end", role: "normal" as const }]),
      ],
    });
  }
  // see dsp-record-lifecycle.md#the-bar-sits-on-the-end
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

/** see dsp-record-lifecycle.md#the-pin-and-what-reopens-under-it */
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
  // EVERY SEEDED DRAWING GETS ITS PLACEHOLDER IN THE PIN'S OWN ACT, so no
  // route refuses over a machine a later state has not authored yet. A
  // drawn sub-canvas needs none, and an authored drawing is never touched.
  const scaffolded: string[] = [];
  for (const s of machine.states) {
    if (s.submachine === undefined) continue;
    if (existsSync(join(root, "project", "deliverable", "machines", `${s.submachine}.canvas`))) continue;
    const abs = join(it.path, itSeededRel(it.id, s.submachine));
    if (existsSync(abs)) continue;
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, `---\nnone: "${SCAFFOLD_NONE}"\n---\n`, "utf8");
    scaffolded.push(s.submachine);
  }
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
    ...(scaffolded.length > 0 ? { scaffolded } : {}),
    ...(reopened.length > 0 ? { reopened } : {}),
  };
}

export interface StepDemand {
  applies: string;
  evidence: string;
  /** THE STEP'S PLACE IN THE MACHINE, not what it asks for. Dependencies, the
   *  busbar, and the sub-machine it seeds or runs.
   *
   *  Absent on a pin taken before this field existed, and that absence is read
   *  as "says nothing" rather than as a change. */
  shape?: string;
}

/** THE DEMANDS LEDGER: what each applied step ASKS FOR at this column — the
 *  ordinal applies, plus the evidence spec. The pin stores it, and every
 *  later look recomputes it and compares. */
export function demandsFor(rigorMatrix: ReturnType<typeof readRigorMatrix>, changeSize: ChangeColumn): Record<string, StepDemand> {
  const demands: Record<string, StepDemand> = {};
  for (const row of rigorMatrix.rows) {
    const cell = rigorMatrix.cells.get(row.name)!.get(changeSize)!;
    if (cell.applies === "none") continue;
    demands[row.name] = { applies: cell.applies, evidence: demandOf(row.evidence_form), shape: shapeOf(row) };
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

/** see dsp-record-lifecycle.md#the-steps-topology */
function shapeOf(row: { depends_on?: string[]; busbar?: boolean; seeds?: string; runs?: string }): string {
  return JSON.stringify([[...(row.depends_on ?? [])].sort(), row.busbar === true, row.seeds ?? "", row.runs ?? ""]);
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

/** see dsp-record-lifecycle.md#the-pin-and-what-reopens-under-it */
export function movedDemands(prev: Record<string, StepDemand>, now: Record<string, StepDemand>): string[] {
  return Object.keys(prev)
    .filter((id) => {
      const o = prev[id];
      const n = now[id];
      if (n === undefined) return false;
      if (o === undefined || (APPLIES_RANK[n.applies] ?? 0) > (APPLIES_RANK[o.applies] ?? 0)) return true;
      // AN ABSENT SHAPE SAYS NOTHING. Comparing it against a present one would
      // reopen every step of every standing iteration exactly once, which is a
      // migration wearing a finding's clothes.
      if (o.shape !== undefined && n.shape !== undefined && o.shape !== n.shape) return true;
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
/** THE PIN, OPENED ONCE PER QUESTION. Three callers ask this file something —
 *  what does it say, has it gone stale, which demands moved — and each opened
 *  and parsed it for itself. One reader now, and an absent pin answers
 *  undefined rather than making every caller test for it. */
function readPin(it: Iteration): ParsedPin | undefined {
  const pinAbs = join(it.path, itPinRel(it.id));
  return existsSync(pinAbs) ? parsePin(readFileSync(pinAbs, "utf8")) : undefined;
}

export function repinColumn(root: string, it: Iteration): void {
  const pin = readPin(it) as (ParsedPin & Record<string, unknown>) | undefined;
  if (pin?.change_size === undefined) return;
  pin.demands = demandsFor(readRigorMatrix(root), pin.change_size as ChangeColumn);
  pin.rigor_matrix_hash = rigorMatrixContentHash(root);
  delete pin.machine; // derived from change_size now — a stored copy only goes stale
  writeFileSync(join(it.path, itPinRel(it.id)), JSON.stringify(pin, null, 2), "utf8");
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
  const pin = readPin(it);
  if (pin?.change_size === undefined || pin.demands === undefined) return [];
  if (pin.rigor_matrix_hash === rigorMatrixContentHash(root)) return [];
  return movedDemands(pin.demands, demandsFor(readRigorMatrix(root), pin.change_size as ChangeColumn));
}

/** see dsp-record-lifecycle.md#did-the-matrix-move-under-this-pin */
export function pinIsStale(root: string, it: Iteration): boolean {
  const pin = readPin(it);
  if (pin?.change_size === undefined) return false;
  return pin.rigor_matrix_hash !== rigorMatrixContentHash(root);
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

/** see dsp-record-lifecycle.md#the-iterations-container */
export function generateIterations(root: string): GeneratedMachine {
  let open: Iteration[] = [];
  try {
    open = itList(root).filter((it) => it.open);
  } catch {
    open = [];
  }
  // see dsp-record-lifecycle.md#the-containers-first-state-is-the-selection
  const select: StateDecl = {
    id: "select",
    kind: "start",
    statement: "Pick the iteration to walk.",
    guidance:
      "CHOOSE ONE, or leave. Every open iteration is offered as a door, and nothing is entered until you take one — taking one BINDS that iteration and stamps it started.\n\nA pull carrying no choice gets the offer back. It never gets an iteration.\n\nAn iteration waiting on another is not offered here. It is reached through the one it waits for, which is what makes the wait real.",
    evidence_form: [],
    priority: 0.01,
    edges: [],
  };
  const start = select;
  const states: StateDecl[] = [start];
  const expByState: Record<string, string> = {};
  const subGen: Record<string, () => GeneratedMachine> = {};

  // see dsp-record-lifecycle.md#the-container-is-a-dag-never-a-stack
  const openIds = new Set(open.map((it) => itShortId(it.id)));
  const declared = new Map<string, string[]>();
  for (const it of open) {
    const sid = itShortId(it.id);
    const fm = readItRecord(root, it);
    const raw = Array.isArray(fm?.depends_on) ? (fm.depends_on as unknown[]) : [];
    declared.set(
      sid,
      raw.map((d) => itShortId(String(d))).filter((d) => d !== sid && openIds.has(d)),
    );
  }
  // A CYCLE IS A DRAWING DEFECT AND MUST NOT WEDGE THE WALK. The edge that
  // closes the loop is dropped and the rest still draws; the pair is visible
  // as two iterations that both wait on nothing.
  const reaches = (from: string, to: string, seen: Set<string>): boolean => {
    if (from === to) return true;
    if (seen.has(from)) return false;
    seen.add(from);
    return (declared.get(from) ?? []).some((d) => reaches(d, to, seen));
  };
  const depsOf = new Map<string, string[]>();
  for (const [sid, deps] of declared) {
    depsOf.set(
      sid,
      deps.filter((d) => !reaches(d, sid, new Set([sid]))),
    );
  }
  const dependents = new Map<string, string[]>();
  for (const [sid, deps] of depsOf) {
    for (const d of deps) dependents.set(d, [...(dependents.get(d) ?? []), sid]);
  }

  // THE ROOTS ARE COLLECTED BEFORE THEY ARE WIRED, because the ROLE depends
  // on how many there are, and that is not known inside the loop.
  const roots: string[] = [];
  for (const it of open) {
    const sid = itShortId(it.id);
    const fm = readItRecord(root, it);
    const goal = typeof fm?.goal === "string" ? fm.goal : it.id;
    expByState[sid] = it.id;
    const outs = dependents.get(sid) ?? [];
    states.push({
      id: sid,
      kind: "work",
      statement: goal,
      guidance:
        "The iteration's own machine — enter it and the walk stands in M0: the retro onboards, the kickoff proposes a size, and the bless pins the full column. Goal, vision and inputs live in the record.",
      evidence_form: [],
      priority: 0.2,
      submachine: "generated",
      // A dependency edge is the ONLY thing that makes an iteration wait. With
      // nothing waiting on this one, it runs straight to the end pill.
      edges: outs.length > 0 ? outs.map((o) => ({ to: o, role: "normal" as const })) : [{ to: "end", role: "normal" as const }],
    });
    subGen[sid] = () => generateIterationWalk(root, it, sid);
    // ONLY THE ROOTS HANG OFF START. Everything else is reached through the
    // iteration it waits for, which is what makes the wait real.
    if ((depsOf.get(sid) ?? []).length === 0) roots.push(sid);
  }
  // LEAVING IS A DOOR LIKE ANY OTHER, so it carries the same role as the rest.
  //
  // ALTERNATIVE is the role that means OR. `completeGuarded` holds the walk
  // still only where MORE THAN ONE alternative stands (session.ts: "one
  // alternative is not a choice" — a lone one is how a return and a
  // single-visit machine are drawn, and both must keep walking through).
  //
  // SO THE EXIT COUNTS TOWARD THE CHOICE, and that is the whole correction.
  // With the exit normal and ONE root there was exactly one alternative, the
  // guard stayed quiet, and the walk took the first authored edge — the exit.
  // It left the container instead of standing at the offer.
  //
  // NOTHING WAS EVER BOUND BY THAT. The exit comes first in edge order, so the
  // dangerous half held throughout. The half that failed is the OFFER, and a
  // walk that silently leaves is how the person stops being asked at all.
  //
  // ONE OPEN ITERATION IS THE ORDINARY STATE OF THIS PROJECT, not a corner. The
  // requirement is unconditional, the guidance above it is unconditional, and
  // the old `roots.length > 1` made the code disagree with both. Counting both
  // doors gives two alternatives with one root and three with two, so the offer
  // stands wherever anything is open.
  //
  // WITH NOTHING OPEN the exit is the only alternative, the guard stays quiet,
  // and the walk leaves — which is right, because there is nothing to choose.
  //
  // IT DOES A SECOND THING, AND THE SECOND ONE IS LOAD-BEARING. `INPUT_ROLES`
  // is `normal` and `approval` (machine.ts), so an `alternative` edge is not
  // join fuel: it activates its target directly, and a target of kind `end`
  // closes the instance there and then. So this also takes `select → end` OUT
  // of `end`'s input set and turns leaving into a direct close.
  //
  // THAT CANNOT STARVE THE JOIN, and it was checked rather than assumed. An
  // AND-join needs `busbar === true` with two or more inbound (machine.ts), and
  // this container's `end` carries no busbar — so it was never an AND-join and
  // has nothing to starve. Every iteration state still feeds `end` as `normal`,
  // so the inbound set is mixed by design, not by oversight.
  const rootRole = "alternative" as const;
  // Edge order is the default. see dsp-record-lifecycle.md#leaving-is-a-drawn-door-and-it-comes-first
  select.edges.push({ to: "end", role: rootRole });
  for (const sid of roots) select.edges.push({ to: sid, role: rootRole });
  states.push({
    id: "end",
    kind: "end",
    statement: "",
    guidance: "Left the iterations container — running work parks where it stands; a seeded one waits in M0.",
    evidence_form: [],
    priority: 0.01,
    edges: [],
  });
  const decl: MachineDecl = { id: "iterations", reentry: "restart", initial: "select", states };
  validateMachine(decl);
  // ONE LAYOUT FOR EVERY MACHINE. pinnedCanvas rows states by dependency depth
  // and puts independent ones side by side, which is exactly what the container
  // needs and exactly what the hand-rolled stack could never do.
  const canvas: CanvasData = {
    ...pinnedCanvas(decl),
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

/** see dsp-record-lifecycle.md#the-iterations-machine-compiled-live-at-call-time-from */
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
    // see dsp-record-lifecycle.md#two-kinds-of-sub-machine
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
  // see dsp-record-lifecycle.md#a-recovery-edge-is-the-loops-back-half
  const preds = new Map<string, { id: string; role: string }[]>();
  for (const s of m.states) {
    for (const e of s.edges) {
      const role = e.role ?? "normal";
      if (role === "recovery") continue;
      const list = preds.get(e.to) ?? [];
      list.push({ id: s.id, role });
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
      const ps = byId.get(p.id);
      if (s === undefined || ps === undefined || groupOf(ps) !== groupOf(s)) continue;
      // A fallback detour sits BESIDE the state it recovers, so the loop
      // draws tight: one row, both arrows short.
      layer = Math.max(layer, layerOf(p.id, visiting) + (p.role === "fallback" ? 0 : 1));
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

/** see dsp-record-lifecycle.md#a-state-sits-under-its-inputs */
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
    // A wantless node TRAILS the row — sorted first, its x started at the
    // cursor's negative infinity. A fallback state has no want by construction.
    const byWant = [...sized].sort(
      (a, b) => (want.get(a.s.id) ?? Number.POSITIVE_INFINITY) - (want.get(b.s.id) ?? Number.POSITIVE_INFINITY),
    );
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

/** see dsp-record-lifecycle.md#a-drawn-view-of-any-machine-top-to-bottom */
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

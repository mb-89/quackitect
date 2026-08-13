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
import { pushSeed } from "./claims.ts";
import { CLAUSES, Rejection } from "./errors.ts";
import { buildArchive, type GeneratedMachine } from "./expmachine.ts";
import { type EvidenceField, type MachineDecl, type StateDecl, validateMachine } from "./machine.ts";
import { noteOf, parseStateNote, readNode } from "./notes.ts";
import { CHANGE_COLUMNS, type ChangeColumn, compileColumn, compileM0, readRigorMatrix, rigorMatrixContentHash } from "./rigor-matrix.ts";
import { bustBranchList, listBranches, slug, worktreesDir } from "./worktree.ts";

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

/** ADOPT A PUSHED ITERATION — the second machine's half of the seed.
 *
 *  The seed mints a record, a branch and a worktree in one act, so on the
 *  box that seeded it the three always stand together. A PEER MACHINE
 *  CLONES AND GETS THE BRANCH ALONE: no worktree, therefore not open,
 *  therefore absent from the container and from the survey. The record sat
 *  on the remote the whole time and the machine sent to run it could not
 *  see it (first run on a second machine, 2026-08-12).
 *
 *  Adopting binds the missing half. The branch is checked out into the
 *  path the rest of the engine already expects, and from that moment the
 *  iteration is open exactly like a seeded one — no call site learns a new
 *  state, because the state it wants is the one that now exists.
 *
 *  IT MINTS NOTHING. No record is written, and no branch is created where
 *  the remote did not already carry one. Adopting an open iteration is a
 *  no-op, so a second call is safe. */
export function itAdopt(root: string, id: string): Iteration {
  const it = itList(root).find((x) => x.id === id);
  if (it === undefined) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: `an iteration branch it/${id} on this machine or its remote`,
      got: "no such iteration in the listing",
      remedy: { tool: "se_survey", args: {}, note: "list what actually stands, then adopt one of those ids" },
      source: SRC,
    });
  }
  // ALREADY BOUND IS ALREADY DONE. Re-adopting must never disturb a
  // worktree that may be carrying uncommitted work.
  if (it.open) return it;
  mkdirSync(worktreesDir(root), { recursive: true });
  const local = listBranches(root, `it/${id}`).length > 0 && existsSync(join(root, ".git", "refs", "heads", "it", id));
  // A LOCAL BRANCH IS CHECKED OUT AS IT STANDS. A remote-only one gets a
  // local branch tracking it, which is what makes the later push land back
  // on the branch the peer is watching.
  git(
    root,
    local ? ["worktree", "add", it.path, it.branch] : ["worktree", "add", it.path, "-b", it.branch, "--track", `origin/${it.branch}`],
    "worktree add",
  );
  bustBranchList();
  // The engine runs from the worktree's own copy, and a fresh checkout
  // carries no node_modules — the same install the seed does.
  const deliverable = join(it.path, "project", "deliverable");
  if (existsSync(join(deliverable, "package.json")) && !existsSync(join(deliverable, "node_modules"))) {
    spawnSync("npm", ["install", "--no-audit", "--no-fund"], { cwd: deliverable, stdio: "ignore", shell: process.platform === "win32" });
  }
  return { ...it, open: true };
}

/** THE SEED: goal + rough vision, plus context inputs (an expedition id,
 *  retro note refs). Mints the record on its own branch and worktree —
 *  the iteration stands in the container at once. */
export function itSeed(root: string, goal: string, vision: string, inputs: string[] = [], dependsOn: string[] = []): Iteration {
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
      // THE CONTAINER IS A DAG, AND THIS KEY IS ITS ONLY INPUT (owner ruling
      // 2026-08-12). An iteration naming another here cannot be entered until
      // that one leaves the open set, because the drawn edge runs dep -> this
      // and the walk never enters a state whose inbound edges have not fired.
      "depends_on:",
      ...dependsOn.map((d) => `  - ${JSON.stringify(d)}`),
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
  // The stub reaches the remote in the same act, so every peer machine
  // lists it from its next fetch; no remote is a recorded seed, not a block.
  const announced = pushSeed(path, `it/${id}`).ok;
  return { id, branch: `it/${id}`, path, open: true, announced };
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
    // THE SCAFFOLD USED TO READ AS AN AUTHORED NONE, and a whole build was
    // skipped that way, in silence, on 2026-08-13. The pin writes
    // `none: "<SCAFFOLD_NONE>"` so the ROUTE stays drawable before the
    // authoring state has run, and this branch then served the run state as a
    // bare start-to-end pill that walked through without a word.
    //
    // REFUSING HERE IS STILL THE WRONG SEAM. drawnsub.test.ts pins that the
    // placeholder must RESOLVE, because the machine view has to draw a route
    // through a sub-machine nobody has authored yet. Two tests refused that
    // refusal, and they were right to.
    //
    // SO THE DECL IS MARKED INSTEAD, and session.ts seedSubs refuses to WALK
    // INTO a marked one. Drawing and routing stay legal; entering does not.
    // That is the seam the earlier note prescribed.
    //
    // AN EXPLICIT NONE passes the run state without ceremony — zero spikes
    // is a normal outcome when the drawing says WHY (the explicit-absence law).
    // Only the scaffold's own literal is marked, so an authored none is
    // untouched.
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

/** THE STEP'S TOPOLOGY, digested. What a step ASKS FOR and where it SITS are
 *  different facts, and only the first was ever compared.
 *
 *  So a row could gain a dependency and no standing iteration would notice.
 *  That happened on 2026-08-13: build-steps was given a dependency on the
 *  state that seeds its drawing, and i3's pinned machine kept walking straight
 *  past it, because no demand had moved.
 *
 *  Sorted, so re-ordering a list is not a change. */
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

/** REOPEN (owner verdict 2026-07-30): a filled step survives only while its
 *  demand stands. applies stepped UP, or the evidence spec changed — the step
 *  reopens and its evidence is re-earned. Guidance-only wording never reopens,
 *  and a WEAKENED demand never does either: what was filed already covers it.
 *
 *  Only steps the previous ledger knew are compared. A step that did not exist
 *  then is not in the pinned machine, so there is nothing there to reopen, and
 *  an escalation must reopen exactly what GREW rather than everything the
 *  bigger column added.
 *
 *  THE STEP'S SHAPE COUNTS AS WELL AS ITS DEMAND (owner ruling 2026-08-13). A
 *  row that gains a dependency changes where the walk may go, and a pin taken
 *  before that change would keep walking past a state the column now requires.
 *  Seen live: build-steps was given its dependency on the state that seeds its
 *  drawing, and i3 walked straight past it because no demand had moved. */
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

/** DID THE MATRIX MOVE UNDER THIS PIN — and nothing about which steps care.
 *
 *  TWO QUESTIONS USED TO SHARE ONE ANSWER. `iterationDrift` returns an empty
 *  list both when the matrix is unchanged and when it changed in a way no
 *  step's demand noticed, and the walk read the second as the first.
 *
 *  So a matrix edit that reshaped the MACHINE — a new dependency, a state the
 *  column regained — never refreshed the pin, and the record went on walking a
 *  snapshot taken before the fix. Seen live on 2026-08-13: build-steps was
 *  given its dependency on specify-build and i3 kept skipping it. */
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

  // THE CONTAINER IS A DAG, NEVER A STACK (owner ruling 2026-08-12, from a
  // screenshot of twenty-four iterations drawn as one vertical chain).
  //
  // The chain was a LAYOUT artifact, not a declaration one: the decl already
  // fanned start to every iteration and every iteration to end, and the canvas
  // was then hand-built by stacking boxes down one axis. So the drawing said
  // "series" while the machine meant "parallel", which is the worst pairing —
  // the reader believes the picture.
  //
  // Now `depends_on` in the record drives the edges, and pinnedCanvas lays the
  // result out. That buys BOTH halves at once:
  //   - INDEPENDENT ITERATIONS SIT SIDE BY SIDE, because the layout rows states
  //     by dependency depth.
  //   - AN ITERATION WHOSE DEPENDENCY IS UNMET CANNOT BE ENTERED, because the
  //     walk never enters a state whose inbound edges have not fired. No new
  //     guard, no second rule to keep in step with the drawing.
  //
  // A SHIPPED DEPENDENCY STOPS CONSTRAINING. Only OPEN iterations are wired, so
  // closing one frees everything waiting on it on the next paint.
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
    if ((depsOf.get(sid) ?? []).length === 0) start.edges.push({ to: sid, role: "normal" });
  }
  if (open.length === 0) start.edges.push({ to: "end", role: "normal" });
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
  // A RECOVERY EDGE IS THE LOOP'S BACK HALF, never a dependency. Counted, it
  // made every fallback pair a cycle; the cycle guard cut the walk mid-way and
  // the half-computed layer got MEMOIZED — fix-findings drew at the top of its
  // group, rows away from the verification it serves (owner report 2026-08-11).
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

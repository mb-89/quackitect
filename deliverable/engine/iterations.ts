// Iterations — planned work, SEEDED AS A FUNCTION: a seed mints the
// record's folder, and the iteration stands VISIBLE in the iterations
// container from that moment — standing in M0: the retro onboards, the kickoff
// sizes. The kickoff's bless pins the blessed column and the machine
// grows IN PLACE. The walk is FLAT: milestones are groups on the states,
// never sub-machines; only seeded chunk machines dive.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";
import type { EvidenceField } from "./machine.ts";
import { noteOf } from "./notes.ts";
import { slug } from "./records.ts";
import { CHANGE_COLUMNS, type ChangeColumn, compileColumn, readRigorMatrix, rigorMatrixContentHash } from "./rigor-matrix.ts";
import { dependsOnLines } from "./seed.ts";

/** THE PIN'S PLACEHOLDER, verbatim. It is written when an iteration pins a
 *  column and read back when the walk tries to enter the drawing it stands
 *  for — so it lives in ONE place and the two ends cannot drift apart. */
export const SCAFFOLD_NONE =
  "not authored yet - the authoring state writes this drawing; this placeholder keeps the route drawable until then";

export const SRC = "engine/iterations.ts";

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
  return `spec/iterations/${id}/record.md`;
}

/** see dsp-record-lifecycle.md#one-tree-one-path */
export function readItRecord(root: string, it: Iteration): Record<string, unknown> | undefined {
  const abs = join(root, itRecordRel(it.id));
  if (!existsSync(abs)) return undefined;
  return noteOf(abs)?.frontmatter;
}

/** see dsp-record-lifecycle.md#the-statuses-a-record-cannot-be-walked-from */
export const RECORD_FINISHED: ReadonlySet<string> = new Set(["shipped", "closed"]);

/** EVERY RECORD IS A FOLDER, and OPEN comes from its own status.
 *
 *  A LIST READ OFF THE FILESYSTEM ASKS A QUESTION THE RECORD ALREADY
 *  ANSWERS, and the two can disagree.
 *
 *  THE BRANCH FIELD STAYS on the shape, spelled from the id, because callers
 *  still name it and nothing yet reads it as a place to fetch from. It goes
 *  when the branches do. */
export function itList(root: string): Iteration[] {
  const dir = join(root, "spec", "iterations");
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

// NOTHING IS MISSING ON A CLONE. A record is a folder, so a clone has every
// record by construction, and there is no half
// left to bind.

/** THE SEED: goal + rough vision, plus context inputs (an expedition id,
 *  retro note refs). Mints the record's FOLDER ON TRUNK — the iteration
 *  stands in the container at once, and there is nothing else to make.
 *
 *  WHAT THE SEED STOPPED DOING AT i34, and why it is all one change:
 *
 *  - NO SECOND CHECKOUT. There is one tree, so there is nothing to add.
 *  - NO BRANCH. The folder IS the record; a branch held nothing else.
 *  - NO PUSH. The seed push existed to announce a stub to a peer that would
 *    claim it, and the claim system is retired.
 *  - NO npm install. That paid for a second tree's node_modules.
 *
 *  A LIST THAT READS FOLDERS AND A SEED THAT WRITES SOMEWHERE ELSE ARE ONE
 *  CHANGE, never two: the first is simply false until the second lands. */
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
  return `spec/iterations/${id}/machines/seeded.json`;
}

export function itSeededRel(id: string, kind: string): string {
  return `spec/iterations/${id}/machines/${kind}.md`;
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
    if (existsSync(join(root, "deliverable", "machines", `${s.submachine}.canvas`))) continue;
    const abs = join(it.path, itSeededRel(it.id, s.submachine));
    if (existsSync(abs)) continue;
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, `---\nnone: "${SCAFFOLD_NONE}"\n---\n`, "utf8");
    scaffolded.push(s.submachine);
  }
  git(it.path, ["add", "-A"], "add");
  // BOOKKEEPING, NOT AUTHORED WORK: this commit lands a generated file. It
  // skips the hook because a checkout without node_modules kills the hook's
  // typechecker, and the pin would refuse before anybody could install one.
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

/** NO PIN YET, which is every iteration up to its kickoff bless.
 *
 *  Such a record has no stored column, so nothing about it can go stale — and
 *  that is exactly the hole. Its M0 machine is compiled live from the matrix,
 *  while the frame the walk stands on was snapshotted when the record was
 *  entered. A matrix correction made from inside M0 therefore reached nothing
 *  at all, because every refresh path is guarded by a pin that does not
 *  exist. */
export function pinIsUnset(it: Iteration): boolean {
  return readPin(it)?.change_size === undefined;
}

/** see dsp-record-lifecycle.md#did-the-matrix-move-under-this-pin */
export function pinIsStale(root: string, it: Iteration): boolean {
  const pin = readPin(it);
  if (pin?.change_size === undefined) return false;
  return pin.rigor_matrix_hash !== rigorMatrixContentHash(root);
}

/** tailored is always tailored DOWN; inherit
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

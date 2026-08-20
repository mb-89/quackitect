/** NO STATE DEMANDS WHAT IT CANNOT SUPPLY (i6).
 *
 *  A state declares two things that have to agree, and nothing checked that
 *  they did.
 *
 *  - `legal_tools` — what may be called while standing there.
 *  - its evidence form — what must be produced before it completes.
 *
 *  WHERE THEY DISAGREE, THE WALK HAS NO LEGAL MOVE. The form asks for
 *  something, every verb that could make it is refused, and the only ways out
 *  are an escape or the shell. Both are failures.
 *
 *  LIVED: observe-red's whole job is watching new checks fail, and its legal
 *  tools were the file verbs and `se_run`. It could not call the test verb, so
 *  the agent reached for the shell. The owner's answer was to move the run into
 *  the engine — the right fix, and one nobody would have needed if the
 *  disagreement had refused at compile.
 *
 *  WHAT COUNTS AS A DEMAND, and it is read from declarations rather than prose:
 *
 *  - A FIELD WHOSE TEMPLATE RESOLVES. `machines/forms/templates/*.md` declares
 *    `resolves: artifact` (the named trace nodes must exist) or
 *    `resolves: file` (the named paths must exist on disk). Neither can be
 *    satisfied by a state that cannot bring one into being.
 *  - A FIELD TYPED `files` or `run_ref`. The first names paths, the second
 *    names a run the log holds.
 *
 *  WHAT IT DOES NOT DO. It never reads guidance prose. A state saying "run the
 *  tests" in a sentence is not a declaration, and guessing at sentences is how
 *  a check starts refusing correct machines.
 *
 *  req-no-state-demands-what-it-cannot-supply */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { EvidenceField, MachineDecl, StateDecl } from "../machine.ts";

/** THE VERBS THAT BRING SOMETHING INTO BEING. A state holding none of them can
 *  only cite what already exists. */
const WRITES = ["se_file_write", "se_file_patch"];
const RUNS = ["se_run", "se_test"];

export interface SupplyGap {
  state: string;
  field: string;
  /** What the field demands, in the words of its own declaration. */
  demands: string;
  /** Any one of these verbs would close the gap. */
  wants: string[];
}

/** A template's `resolves`, or "" when it declares none. Read straight off the
 *  frontmatter — the compile has no parsed template to hand here, and a
 *  four-line read beats threading one through. */
function resolvesOf(root: string, template: string): string {
  // THE PROJECT ROOT, the one every other engine path takes — scalePath and
  // the trace lookups all read `<root>/...`. Two roots in one check is
  // how a lookup starts finding nothing and reporting it as clean.
  const abs = join(root, "deliverable", "machines", "forms", "templates", `${template}.md`);
  if (!existsSync(abs)) return "";
  const m = /^resolves:[ \t]*(\S+)[ \t]*$/m.exec(readFileSync(abs, "utf8"));
  return m === null ? "" : m[1];
}

/** What one field demands, and which verbs could supply it. An empty `wants`
 *  means the field asks for nothing a tool has to make. */
function demandOf(root: string, f: EvidenceField): { demands: string; wants: string[] } {
  if (f.type === "run_ref") return { demands: "a run reference — the log holds it, and something has to have run", wants: RUNS };
  if (f.type === "files") return { demands: "files that must exist on disk", wants: [...WRITES, ...RUNS] };
  const resolves = f.template === undefined ? "" : resolvesOf(root, f.template);
  if (resolves === "file") {
    return { demands: `paths on disk (template ${String(f.template)} resolves: file)`, wants: [...WRITES, ...RUNS] };
  }
  if (resolves === "artifact") {
    return { demands: `standing trace nodes (template ${String(f.template)} resolves: artifact)`, wants: WRITES };
  }
  return { demands: "", wants: [] };
}

/** DERIVED FIELDS ARE THE ENGINE'S, so they are not the state's to supply. The
 *  engine computes them and refuses a hand-written value, which is the whole
 *  point of the type. Demanding a verb for one would refuse a correct machine. */
function agentFills(f: EvidenceField): boolean {
  return f.type !== "derived";
}

/** Every gap in one state. A state granting `all` can never have one — that is
 *  the whole lane, and the list carries the literal word rather than expanding
 *  to every verb. */
function gapsIn(root: string, s: StateDecl): SupplyGap[] {
  const legal = s.legal_tools;
  if (legal === undefined || legal.includes("all")) return [];
  const held = new Set(legal);
  const out: SupplyGap[] = [];
  for (const f of s.evidence_form) {
    if (!f.required || !agentFills(f)) continue;
    const { demands, wants } = demandOf(root, f);
    if (wants.length === 0) continue;
    if (wants.some((v) => held.has(v))) continue;
    out.push({ state: s.id, field: f.name, demands, wants });
  }
  return out;
}

export function supplyGaps(root: string, m: MachineDecl): SupplyGap[] {
  return m.states.flatMap((s) => gapsIn(root, s));
}

/** One line per gap, in the words the compile refuses with. */
export function saysGap(g: SupplyGap): string {
  return `${g.state} demands ${g.field} — ${g.demands} — and grants none of: ${g.wants.join(", ")}`;
}

/** THE COMPILE REFUSES, because the alternative is a walk that reaches the
 *  state and has no legal move. Refusing here names the state, the field and
 *  the verbs, which is a fix somebody can make; refusing there names nothing
 *  and the only ways out are an escape or the shell. */
export function assertCanSupply(root: string, m: MachineDecl): void {
  const gaps = supplyGaps(root, m);
  if (gaps.length === 0) return;
  throw new Error(
    `machine ${m.id} demands what it cannot supply — ${String(gaps.length)} state/field pair(s):\n${gaps.map((g) => `  - ${saysGap(g)}`).join("\n")}\nEither grant the state one of the named verbs, or stop asking it for that field.`,
  );
}

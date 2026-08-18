// FORM BINDING AND REGISTER MINTING, lifted out of Session.
//
// These were written as methods and never needed to be. Each reaches for the
// session's PATHS and nothing else — no dial, no position, no walk state — so
// each takes those as an argument and is an ordinary function.
//
// see dsp-evidence-forms.md#the-form-is-bound-to-the-corpus
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import type { MachineDecl, StateDecl } from "./machine.ts";
import { chartPlan } from "./morphbox.ts";

/** see dsp-walk-machine.md#the-state-a-recorded-visit-names */
export function visitState(visit: string): string {
  return visit.split("@")[0].split("/").pop() ?? "";
}

import { mintScenarioLines } from "./atamwalk.ts";
import { CLAUSES, Rejection } from "./errors.ts";
import { type FormTemplate, fieldContent, stripComments, withFrontmatter, withFrontmatterList } from "./forms.ts";
import type { Iteration } from "./iterations.ts";
import { parseStateNote, section, writeNode } from "./notes.ts";
import { mintFlipLines } from "./pugh.ts";
import { CHANGE_COLUMNS } from "./rigor-matrix.ts";
import type { AmendOp, Session } from "./session.ts";
import { chosenOption, nodeField, nodeList } from "./stateform.ts";
import { loadTrace, noteOf, traceDir } from "./trace.ts";

/** What these functions need from a session: where things live, and which
 *  machine a record is walking. Session satisfies it structurally. */
export type SessionPaths = Pick<Session, "machineRoot" | "workRoot" | "traceRoot" | "declIteration">;

export function refPaths(paths: SessionPaths, it?: Iteration): Record<string, string> {
  const out: Record<string, string> = {};
  const root = paths.traceRoot(it);
  try {
    // THE PATH IS WRITTEN FROM THE PROJECT ROOT, because the HOST opens it
    // from there. A record-relative path LOOKS right and points at nothing
    // the host can open, so every link on an open record's form reported a
    // file that is not there.
    for (const n of loadTrace(root)) {
      if (n.file !== undefined) out[n.id] = relative(paths.machineRoot(), n.file).split(sep).join("/");
    }
  } catch {
    // no corpus, no links — the ids still read
  }
  // THE METHOD CARDS TOO, so a [[link]] in guidance is a link. A pointer
  // the reader cannot follow is decoration: it costs a line, teaches the
  // name of a file, and leaves them to find it by hand.
  for (const dir of ["methods", "items", "forms/templates", "lint"]) {
    const abs = join(paths.machineRoot(), "project", "deliverable", "machines", ...dir.split("/"));
    try {
      for (const e of readdirSync(abs)) {
        if (!e.endsWith(".md")) continue;
        const id = e.replace(/\.md$/, "");
        // A TRACE NODE WINS. Its path is the record's own copy, and that is
        // the one the reader means when both exist.
        if (out[id] === undefined) out[id] = `project/deliverable/machines/${dir}/${e}`;
      }
    } catch {
      // a folder that is not there contributes nothing
    }
  }
  return out;
}

/** WHAT A CARD NEEDS TO JUDGE BY, per node. The statement is what the row
 *  demands; breaks_if_removed is what losing it costs. Those two carry the
 *  judgment, and everything else is one click away behind the link. */
export function refFacts(
  paths: SessionPaths,
  it?: Iteration,
): Record<string, { statement: string; breaks_if_removed: string; name: string; coupling: string }> {
  const out: Record<string, { statement: string; breaks_if_removed: string; name: string; coupling: string }> = {};
  try {
    for (const n of loadTrace(paths.traceRoot(it))) {
      if (n.file === undefined) continue;
      out[n.id] = {
        statement: n.statement,
        breaks_if_removed: nodeField(n.file, "breaks_if_removed"),
        name: nodeField(n.file, "name"),
        coupling: nodeField(n.file, "coupling"),
      };
    }
  } catch {
    // no corpus, no facts — the card still renders its ids
  }
  return out;
}

/** The READ half of a bound field: one line per listed node, carrying that
 *  node's own frontmatter value. Empty where the node has none, which is
 *  precisely what makes the per-item check refuse the submit. */
export function bindView(
  paths: SessionPaths,
  s: StateDecl,
  model: { field_args: Record<string, { items: string[]; columns: string[] }> },
  m: MachineDecl,
): Record<string, string> {
  const bound = s.evidence_form.filter((f) => f.template === "node-table");
  if (bound.length === 0) return {};
  const byId = new Map(loadTrace(paths.traceRoot(paths.declIteration(m))).map((n) => [n.id, n]));
  const out: Record<string, string> = {};
  for (const f of bound) {
    const cols = model.field_args[f.name]?.columns ?? [];
    const head = [`| ${f.of ?? "node"} | ${cols.join(" | ")} |`, `| ${["---", ...cols.map(() => "---")].join(" | ")} |`];
    const rows = (model.field_args[f.name]?.items ?? []).map((id) => {
      const file = byId.get(id)?.file;
      // A LIST-VALUED KEY reads empty through the scalar reader, so the
      // list reader answers where the scalar one has nothing — joined
      // with · for the one-line cell, split on it by the write half.
      const cells = cols.map((c) => {
        if (file === undefined) return "";
        const scalar = nodeField(file, c);
        const v = scalar !== "" ? scalar : nodeList(file, c).join(" · ");
        return v.replace(/\|/g, "\\|");
      });
      return `| [[${id}]] | ${cells.join(" | ")} |`;
    });
    out[f.name] = [...head, ...rows].join("\n");
  }
  return out;
}

/** see dsp-walk-machine.md#the-charts-lines-are-notes */
export function bindChart(paths: SessionPaths, content: string, m: MachineDecl): string[] {
  const nodes = loadTrace(paths.traceRoot(paths.declIteration(m)));
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const plan = chartPlan(
    content,
    nodes.filter((n) => n.type === "candidate").map((n) => n.id),
  );
  // THE FOLDER IS DERIVED FROM A SIBLING, never guessed. A record owns its
  // own trace nodes, so the only reliable answer is where the options
  // already sit.
  const sibling = nodes.find((n) => n.type === "option" && n.file !== undefined)?.file;
  const folder = sibling === undefined ? undefined : join(dirname(dirname(sibling)), "candidate");
  const touched: string[] = [];
  for (const w of plan.write) {
    const file = byId.get(w.id)?.file ?? (folder === undefined ? undefined : join(folder, `${w.id}.md`));
    if (file === undefined) continue;
    let raw = existsSync(file)
      ? readFileSync(file, "utf8")
      : ["---", `id: ${w.id}`, 'type: "[[candidate]]"', "name:", "statement:", "picks:", "---", "", "## Why this one", "", ""].join("\n");
    raw = withFrontmatter(raw, "name", w.name);
    raw = withFrontmatter(raw, "statement", w.statement);
    // PICKS IS A LIST, SO IT IS WRITTEN AS ONE. The item card declares a
    // block, and a comma-joined scalar reads back as a single pick.
    raw = withFrontmatterList(
      raw,
      "picks",
      w.picks.map((p) => `[[${p}]]`),
    );
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, raw, "utf8");
    touched.push(w.id);
  }
  for (const id of plan.remove) {
    const file = byId.get(id)?.file;
    if (file === undefined) continue;
    unlinkSync(file);
    touched.push(id);
  }
  for (const p of plan.prune) {
    const file = byId.get(p.id)?.file;
    if (file === undefined) continue;
    writeFileSync(file, withFrontmatter(readFileSync(file, "utf8"), "pruned_because", p.why), "utf8");
    touched.push(p.id);
  }
  return touched;
}

/** see dsp-the-goal-binds-the-walk.md#the-scenario-walks-at-risk-and-unaddressed-verdicts-become-register */
export function mintScenarioEntries(paths: SessionPaths, fields: Record<string, string>, m: MachineDecl, by: string): void {
  const traceRoot = paths.traceRoot(paths.declIteration(m));
  const gradeOf = (req: string): string => {
    const fm = noteOf(join(traceDir(traceRoot), "requirement", `${req}.md`))?.frontmatter;
    return typeof fm?.breaks_how_badly === "string" ? fm.breaks_how_badly : "";
  };
  for (const [f, content] of Object.entries(fields)) {
    fields[f] = mintScenarioLines(String(content), ({ kind, requirement, hinge, note }) => {
      const slug = requirement.replace(/^req-/, "");
      const id = kind === "at-risk" ? `raid-ar-${slug}` : `raid-un-${slug}`;
      const abs = join(traceDir(traceRoot), "raid", `${id}.md`);
      if (!existsSync(abs)) {
        mkdirSync(dirname(abs), { recursive: true });
        const grade = gradeOf(requirement);
        const gradeLine =
          grade === "" ? "breaks_how_badly: <!-- the damage grade — the words live in meth-damage-scale -->" : `breaks_how_badly: ${grade}`;
        writeNode(
          abs,
          kind === "at-risk"
            ? [
                "---",
                `id: ${id}`,
                'type: "[[raid]]"',
                "kind: risk",
                `statement: The architecture leaves ${requirement} at risk — the response hinges on ${hinge}.`,
                "owner: the adjudicator",
                `trigger: any change to ${hinge}, or to the scenario on ${requirement}`,
                "status: open",
                `impact: ${note === "" ? "The scenario misses its measure when the hinge moves." : note}`,
                gradeLine,
                "how_likely: <!-- the likelihood grade — the words live in meth-likelihood-scale, graded at the register review -->",
                "source_refs:",
                "  - evaluate-architecture, the scenario walk's verdict",
                `  - ${requirement}`,
                `  - ${hinge}`,
                "---",
                "",
                `Walked at evaluate-architecture by ${by}. The scenario's response forms`,
                `at ${hinge}; the tradeoff on the verdict line is what a wrong turn there`,
                "costs. The damage grade inherits from the requirement it protects.",
              ].join("\n")
            : [
                "---",
                `id: ${id}`,
                'type: "[[raid]]"',
                "kind: issue",
                `statement: The structure does not address ${requirement} — nothing carries its scenario.`,
                "owner: the adjudicator",
                `trigger: any change to the element set, or to ${requirement}`,
                "status: open",
                "impact: The quality goes unprotected into the build.",
                gradeLine,
                "how_likely: expected",
                "source_refs:",
                "  - evaluate-architecture, the scenario walk's verdict",
                `  - ${requirement}`,
                "---",
                "",
                `Found unaddressed at evaluate-architecture by ${by}. Either the`,
                "structure grows a carrier for this scenario, or the requirement moves —",
                "the gate adjudicates which.",
              ].join("\n"),
        );
      }
      return id;
    });
  }
}

/** see dsp-walk-machine.md#the-sensitivity-cards-credible-rulings-become-raid-tripwires-at */
export function mintFlipTripwires(paths: SessionPaths, fields: Record<string, string>, m: MachineDecl, by: string): void {
  const traceRoot = paths.traceRoot(paths.declIteration(m));
  const shortId = (id: string): string => id.replace(/^cand-/, "").replace(/^req-/, "");
  for (const [f, content] of Object.entries(fields)) {
    fields[f] = mintFlipLines(String(content), ({ rival, winner, axis }) => {
      const id = `raid-flip-${shortId(rival)}-on-${shortId(axis)}`;
      const abs = join(traceDir(traceRoot), "raid", `${id}.md`);
      if (!existsSync(abs)) {
        mkdirSync(dirname(abs), { recursive: true });
        writeNode(
          abs,
          [
            "---",
            `id: ${id}`,
            'type: "[[raid]]"',
            "kind: risk",
            `statement: The convergence flips — ${rival} passes ${winner} if ${axis} moves by one point, and that story was ruled credible.`,
            "owner: the adjudicator",
            `trigger: any change to the scores on ${axis}, or new evidence on either candidate`,
            "status: open",
            "impact: The winner of the convergence changes, and everything downstream of it re-earns.",
            "source_refs:",
            "  - reverse-sensitivity, the sensitivity card's ruling",
            `  - ${rival}`,
            `  - ${winner}`,
            `  - ${axis}`,
            "---",
            "",
            `Ruled credible by ${by} at reverse-sensitivity. The cell stands one`,
            "point from flipping the convergence; the fallback is the run that",
            "re-converges after the flip, with the losers still on record.",
            "",
            "## Probe",
            "",
            `Re-run the convergence with ${axis} moved one point toward ${rival}.`,
            "The trigger above brings this entry back the moment the ground moves.",
          ].join("\n"),
        );
      }
      return id;
    });
  }
}

export function evidenceKey(m: MachineDecl, stateId: string): string {
  return `${m.id}/${stateId}`;
}

/** EMPTY IS NOT INFORMATION. A key whose value is "", 0, [], {} or null says
 *  nothing the key's absence does not, and it costs a line either way.
 *  `false` is excluded on purpose — it is an answer, not a blank. */
function blank(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v === "";
  if (typeof v === "number") return v === 0;
  if (typeof v === "boolean") return false;
  if (Array.isArray(v)) return v.length === 0;
  return Object.keys(v as object).length === 0;
}

/** One dictionary with every blank pruned, recursively. Returns undefined
 *  when nothing survives, so the caller can drop the key entirely. */
function pruned(rec: unknown): Record<string, unknown> | undefined {
  if (rec === null || typeof rec !== "object" || Array.isArray(rec)) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rec as Record<string, unknown>)) {
    const kept = v !== null && typeof v === "object" && !Array.isArray(v) ? pruned(v) : blank(v) ? undefined : v;
    if (kept !== undefined) out[k] = kept;
  }
  return Object.keys(out).length === 0 ? undefined : out;
}

/** WHAT THE AGENT CAN ACTUALLY USE, and nothing else. Measured on i11's own
 *  walk: one ordinary pull answered 290,280 bytes, of which 5,080 lines out
 *  of 5,311 were things no agent reads.
 *
 *  FOUR THINGS COME OFF, and each is a different kind of waste.
 *
 *  - `ref_paths` and `ref_facts`, the whole record's corpus. The MIRROR needs
 *    them to render a card from two ids; the agent opens the file instead.
 *  - Blank argument slots. A free-form field shipped 27 keys, every one "",
 *    [] or null, because the model carries a slot for every editor there is.
 *  - `template.fields`, which restates `fields` name for name.
 *  - On an ECHO, the field bodies. The agent wrote them one call ago.
 *
 *  THE ECHO IS THE ONLY PLACE BODIES GO. A form that is OWED keeps its
 *  content, because a half-filled form coming back must show what already
 *  stands — that is exactly what stops a recheck being answered from
 *  scratch. What is dropped is the copy handed straight back to whoever
 *  just sent it. */
export function agentCopy(form: Record<string, unknown>, echo: boolean): Record<string, unknown> {
  const { ref_paths: _paths, ref_facts: _facts, field_args, field_hints, template_meta, template, fields, ...rest } = form;
  const out: Record<string, unknown> = { ...rest };
  for (const [key, value] of [
    ["field_args", field_args],
    ["field_hints", field_hints],
    ["template_meta", template_meta],
  ] as const) {
    const kept = pruned(value);
    if (kept !== undefined) out[key] = kept;
  }
  if (template !== null && typeof template === "object") {
    const { fields: _dup, ...restTemplate } = template as Record<string, unknown>;
    const kept = pruned(restTemplate);
    if (kept !== undefined) out.template = kept;
  }
  if (Array.isArray(fields)) {
    out.fields = fields.map((f) => {
      const field = f as Record<string, unknown>;
      if (!echo) return field;
      const { content, prefills: _pre, ...head } = field;
      // THE LENGTH STANDS IN FOR THE BODY. It proves the text landed whole,
      // which is the one thing the sender cannot check for itself.
      return { ...head, chars: typeof content === "string" ? content.length : 0 };
    });
  }
  return out;
}

/** THE PATCH HALF OF AN AMEND. `fills` rewrites a field WHOLE, which for a
 *  renamed reference or a typo means resending two thousand characters to
 *  change eleven — and every resend is a chance to lose a paragraph nobody
 *  meant to touch.
 *
 *  SO AN OP IS old_string → new_string, matched against the field as it
 *  stands. It must match EXACTLY ONCE, or the caller says `all: true` and
 *  means every occurrence. Zero matches and an ambiguous match both refuse,
 *  for the reason se_file_patch refuses them: a patch that lands somewhere
 *  other than where its author looked is worse than no patch.
 *
 *  OPS AND FILLS COMPOSE. Several ops against one field chain, each seeing
 *  the last one's result; a `fills` entry for the same field wins, because
 *  a whole rewrite is unambiguous. */
export function amendOps(raw: string, ops: AmendOp[], name: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const op of ops) {
    const field = String(op.field ?? "");
    const body = out[field] ?? fieldContent(raw, field);
    const refuse = (expected: string, got: string): never => {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected,
        got,
        remedy: {
          tool: "se_amend",
          args: {
            state: name,
            ops: [{ field, old_string: "<text as it stands>", new_string: "<what it becomes>" }],
            reason: "<what was wrong>",
          },
          note: "read the field on the pull first — old_string must be the text exactly as the form carries it",
        },
        source: "engine/session.ts amend",
      });
    };
    if (body === undefined) refuse(`a section called ${field} on ${name}`, "no such section in the form");
    const old = String(op.old_string ?? "");
    if (old === "") refuse("old_string — the text being replaced", "an empty old_string");
    const hits = (body as string).split(old).length - 1;
    if (hits === 0) refuse(`old_string to appear in ${field}`, "it does not appear — nothing was changed");
    if (hits > 1 && op.all !== true) {
      refuse(
        `old_string to appear once in ${field}`,
        `it appears ${String(hits)} times — say all: true to replace every one, or give more surrounding text`,
      );
    }
    const next = String(op.new_string ?? "");
    out[field] = op.all === true ? (body as string).split(old).join(next) : (body as string).replace(old, next);
  }
  return out;
}

export function stateFormChecked(raw: string | undefined): string[] {
  if (raw === undefined) return [];
  const v = parseStateNote(raw).frontmatter.checked;
  return typeof v === "string"
    ? v
        .split(",")
        .map((x) => x.trim())
        .filter((x) => x !== "")
    : [];
}

export function stateFormScaffold(name: string, t: FormTemplate): string {
  return [
    "---",
    `form: ${name}`,
    "authors:",
    "files:",
    "---",
    "",
    `# Evidence form / ${name}`,
    "",
    ...t.fields.flatMap((f) => [`## ${f.name}`, "", ""]),
  ].join("\n");
}

/** The blessed size may live in the kickoff's own stored form. */
export function kickoffSizeFromForm(it: Iteration): string | undefined {
  const abs = join(it.path, `project/spec/iterations/${it.id}/evidence/gate-kickoff.md`);
  if (!existsSync(abs)) return undefined;
  const txt = stripComments(section(parseStateNote(readFileSync(abs, "utf8")).body, "change_size")).toLowerCase();
  return chosenOption(txt, CHANGE_COLUMNS);
}

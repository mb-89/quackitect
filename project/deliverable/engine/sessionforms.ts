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
import { withFrontmatter, withFrontmatterList } from "./forms.ts";
import type { Iteration } from "./iterations.ts";
import { writeNode } from "./notes.ts";
import { mintFlipLines } from "./pugh.ts";
import type { Session } from "./session.ts";
import { nodeField, nodeList } from "./stateform.ts";
import { loadTrace, noteOf, traceDir } from "./trace.ts";

/** What these functions need from a session: where things live, and which
 *  machine a record is walking. Session satisfies it structurally. */
export type SessionPaths = Pick<Session, "machineRoot" | "workRoot" | "traceRoot" | "declIteration">;

export function refPaths(paths: SessionPaths, it?: Iteration): Record<string, string> {
  const out: Record<string, string> = {};
  const root = paths.traceRoot(it);
  try {
    // THE PATH IS WRITTEN FROM THE PROJECT ROOT, because the HOST opens it
    // from there. A node living in a record's worktree comes out under
    // .worktrees/, which opens. The record-relative path LOOKED right and
    // pointed into the wrong tree, so every link on an open record's form
    // reported a file that is not there.
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
  // trace in its own worktree, so the only reliable answer is where the
  // options already sit.
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

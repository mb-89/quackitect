// THE SCENARIO WALK — ATAM's qualitative half, dealt as a deck (owner ruling
// 2026-08-10). The corpus splits design review into a computed half and a
// judged half; this module computes the READINGS for both. The judgments stay
// button-fed lines in the evidence form, exactly like the flip deck's rulings.
//
// Pure over its inputs. The args assembly in stateform.ts does the reading,
// so the tests need no filesystem.
import type { ElementMatrixView } from "./elematrix.ts";

/** One quality requirement, as the deck needs it. */
export interface QualityScenario {
  id: string;
  /** breaks_how_badly — the walk's priority. It stands in for ATAM's utility
   *  tree ranking, so no separate tree is built. */
  grade: string;
  /** The ISO/IEC 25010 characteristic word, where the row carries one. */
  characteristic: string;
  /** The node's ## Scenario section, verbatim. Empty is a named problem. */
  scenario: string;
  /** The fitness flag off the node — `fitness_candidate: true` in its
   *  frontmatter. The flag lives on the requirement, never in the form. */
  fitness?: boolean;
}

/** An element or interface: what it implements, what it satisfies directly. */
export interface ImplementerRef {
  id: string;
  implements: string[];
  satisfies: string[];
}

export interface SatisfyingFn {
  id: string;
  satisfies: string[];
}

export interface ScenarioCard {
  requirement: string;
  grade: string;
  characteristic: string;
  scenario: string;
  fitness: boolean;
  /** The functions that satisfy the requirement — the stimulus's carriers. */
  functions: string[];
  /** The elements and interfaces on the path: implementers of those
   *  functions, plus direct satisfiers. Empty means nothing carries the
   *  scenario, and "unaddressed" is one click away. */
  implementers: string[];
}

export interface ScenarioDeckView {
  /** Worst grade first — the walk starts where failure costs most. */
  cards: ScenarioCard[];
  /** Register decisions, for the addressed picker. */
  decisions: string[];
  /** Every element id — the hinge fallback where a card has no implementer. */
  elements: string[];
  problems: string[];
}

export function scenarioDeckView(
  reqs: QualityScenario[],
  fns: SatisfyingFn[],
  implementers: ImplementerRef[],
  decisions: string[],
  elements: string[],
  /** The damage scale, worst first, READ FROM THE CATALOGUE by the caller.
   *  meth-damage-scale is its only home — the catalogue guard refuses a
   *  copy in the engine. */
  gradeOrder: string[],
): ScenarioDeckView {
  // An unknown grade sorts LAST, never first: a card that cannot say what
  // failure costs has not earned the front of the deck.
  const rank = (g: string): number => {
    const i = gradeOrder.indexOf(g);
    return i === -1 ? gradeOrder.length : i;
  };
  const problems: string[] = [];
  const cards = reqs
    .slice()
    .sort((a, b) => rank(a.grade) - rank(b.grade) || a.id.localeCompare(b.id))
    .map((r) => {
      if (r.scenario.trim() === "") problems.push(`${r.id} carries no ## Scenario section — the walk has nothing to judge`);
      const carrying = fns.filter((f) => f.satisfies.includes(r.id)).map((f) => f.id);
      const impl = implementers
        .filter((n) => n.satisfies.includes(r.id) || n.implements.some((f) => carrying.includes(f)))
        .map((n) => n.id);
      return {
        requirement: r.id,
        grade: r.grade,
        characteristic: r.characteristic,
        scenario: r.scenario,
        fitness: r.fitness === true,
        functions: carrying,
        implementers: impl,
      };
    });
  return { cards, decisions, elements, problems };
}

/** THE VERDICT LINES, as the deck's buttons post them and as the mint hook
 *  rewrites them. Three verdicts, one grammar each:
 *
 *    - [[req]] — addressed by [[raid-decision]]
 *    - at risk: [[req]] hinges on [[element]] — <the tradeoff>
 *    - unaddressed: [[req]]
 *
 *  An at-risk or unaddressed line mints its register entry on save; the raid
 *  ref then LEADS the line, exactly like the flip deck's credible rulings.
 *  An addressed line mints nothing — the decision it names already stands. */
const ATRISK = /^- at risk: \[\[([^\]]+)\]\] hinges on \[\[([^\]]+)\]\] — (.*)$/;
const UNADDR = /^- unaddressed: \[\[([^\]]+)\]\]\s*$/;

export interface ScenarioMint {
  kind: "at-risk" | "unaddressed";
  requirement: string;
  hinge: string;
  note: string;
}

/** Rewrite every unminted at-risk and unaddressed line with the ref `mint`
 *  answers for it. Pure over the text — the caller owns the node write. */
export function mintScenarioLines(content: string, mint: (l: ScenarioMint) => string): string {
  return content
    .split("\n")
    .map((line) => {
      const ar = line.trim().match(ATRISK);
      if (ar !== null) {
        const ref = mint({ kind: "at-risk", requirement: ar[1], hinge: ar[2], note: ar[3] });
        return ref === "" ? line : `- [[${ref}]] — at risk: [[${ar[1]}]] hinges on [[${ar[2]}]] — ${ar[3]}`;
      }
      const un = line.trim().match(UNADDR);
      if (un !== null) {
        const ref = mint({ kind: "unaddressed", requirement: un[1], hinge: "", note: "" });
        return ref === "" ? line : `- [[${ref}]] — unaddressed: [[${un[1]}]]`;
      }
      return line;
    })
    .join("\n");
}

/** THE COMPUTED HALF — the structure numbers, each with the raw material for
 *  its one interpreting line. A number nobody interprets is noise, so the
 *  evidence field stores one line per row saying what the number moved. */
export interface MetricRow {
  name: string;
  value: number;
  /** What the number IS — the definition, shown on hover over the name. */
  help: string;
  /** The list behind the number, one entry per line. */
  detail: string[];
}

export function structureMetrics(v: ElementMatrixView, elements: { id: string; implements: string[] }[]): MetricRow[] {
  const debtPairs = v.cells.filter((c) => c.missing.length > 0);
  const debt = debtPairs.reduce((a, c) => a + c.missing.length, 0);
  const byFn = new Map<string, string[]>();
  for (const el of elements) for (const f of el.implements) byFn.set(f, [...(byFn.get(f) ?? []), el.id]);
  const spread = [...byFn.entries()].filter(([, els]) => els.length > 1);
  const pairs = new Set(v.cells.map((c) => `${c.source} -> ${c.destination}`));
  // Counted once per pair, not once per direction — source < destination
  // keeps A⇄B from appearing twice.
  const twoWay = v.cells.filter((c) => pairs.has(`${c.destination} -> ${c.source}`) && c.source < c.destination);
  return [
    {
      name: "interface debt",
      value: debt,
      help: "flows that cross an element boundary with no interface declared to carry them — contracts still owed",
      detail: debtPairs.map((c) => `${c.source} → ${c.destination}: ${c.missing.join(", ")}`),
    },
    {
      name: "allocation spread",
      value: spread.length,
      help: "functions implemented by more than one element — a change to the function lands in several places",
      detail: spread.map(([f, els]) => `${f} (${els.join(", ")})`),
    },
    {
      name: "two-way pairs",
      value: twoWay.length,
      help: "element pairs exchanging flows in both directions — a candidate coupling cycle",
      detail: twoWay.map((c) => `${c.source} ⇄ ${c.destination}`),
    },
    {
      name: "idle elements",
      value: v.idle.length,
      help: "elements implementing no function — dead weight, or an allocation not finished",
      detail: v.idle.slice(),
    },
    {
      name: "unimplemented functions",
      value: v.unimplemented.length,
      help: "functions no element implements — the structure does not do them yet",
      detail: v.unimplemented.slice(),
    },
    {
      name: "undemanded interfaces",
      value: v.undemanded.length,
      help: "declared interfaces no crossing demands — obsolete, or ahead of the structure",
      detail: v.undemanded.map((u) => u.id),
    },
  ];
}

// THE PUGH CONVERGENCE, COMPUTED. Nobody types a matrix run.
//
// Same law as pareto.ts, one state later: the scores stand at evaluate-set,
// the surviving order and the line stand at cut-criteria, so every cell of
// the convergence matrix is arithmetic — sign(score(rival) − score(datum)).
// A typed run would be a second copy free to disagree with the scores.
//
// WHAT A PERSON STILL OWES at converge-pugh is the why beyond the arithmetic
// and the veto on the computed winner. At reverse-sensitivity it is one
// ruling per computed flip: credible (a RAID tripwire) or dismissed (with
// the reason). Nothing else is theirs to fill.
//
// WEIGHTS ARE NOT INVENTED HERE. The axes carry their damage grade
// (breaks_how_badly) and the totals are per-grade sign counts plus the
// plain sum. Typed band values do not exist yet, and a number this module
// made up would be an ordering wearing a measurement's clothes.
import { readScores, type Scored } from "./pareto.ts";

export interface MatrixAxis {
  id: string;
  /** The damage grade off the requirement node — the honest weight column. */
  grade: string;
}

export interface PughRun {
  datum: string;
  /** rival id → axis id → -1 | 0 | 1 against the datum. */
  cells: Record<string, Record<string, number>>;
  /** rival id → sum of its signs. The datum itself scores 0 by definition. */
  totals: Record<string, number>;
  leader: string;
}

export interface PughView {
  axes: MatrixAxis[];
  candidates: string[];
  runs: PughRun[];
  winner: string;
  /** True when the last run's datum held the lead — converged. */
  stable: boolean;
  problems: string[];
}

export interface SwingCell {
  axis: string;
  rival_score: number;
  winner_score: number;
}

export interface RivalGap {
  id: string;
  /** How many sign points below the winner's zero line — 0 is a tie. */
  deficit: number;
  /** Cells a single one-point score move would raise by one sign. */
  swings: SwingCell[];
}

export interface SensitivityView {
  winner: string;
  rivals: RivalGap[];
  problems: string[];
}

/** The live axes as cut-criteria's signed order left them: numbered rows up
 *  to and including the [cutoff] mark, minus the [cut: ...] rows. The cuts
 *  section is the one authority on the order; nothing here re-sorts. */
export function axesFromCuts(cutsMd: string, gradeOf: (id: string) => string): { axes: MatrixAxis[]; problems: string[] } {
  const axes: MatrixAxis[] = [];
  const problems: string[] = [];
  let pastCutoff = false;
  for (const line of cutsMd.split("\n")) {
    const m = line.match(/^\s*\d+\.\s*\[\[([^\]]+)\]\](.*)$/);
    if (m === null) continue;
    if (pastCutoff) continue;
    const rest = m[2];
    if (!/\[cut:/.test(rest)) axes.push({ id: m[1].trim(), grade: gradeOf(m[1].trim()) });
    if (/\[cutoff\]/.test(rest)) pastCutoff = true;
  }
  if (axes.length === 0) problems.push("no live axes — the cuts section is empty or every row is struck");
  else if (!pastCutoff) problems.push("no [cutoff] mark in the cuts section — every uncut row counted");
  return { axes, problems };
}

const sign = (n: number): number => (n > 0 ? 1 : n < 0 ? -1 : 0);

function runAgainst(datum: Scored, candidates: Scored[], axisIds: string[]): PughRun {
  const cells: Record<string, Record<string, number>> = {};
  const totals: Record<string, number> = {};
  for (const c of candidates) {
    if (c.id === datum.id) continue;
    const row: Record<string, number> = {};
    let total = 0;
    for (const a of axisIds) {
      // A HOLE IS NOT A ZERO, but a sign needs both sides; an unscored pair
      // contributes nothing and the view reports the hole separately.
      const s = c.scores[a] === undefined || datum.scores[a] === undefined ? 0 : sign(c.scores[a] - datum.scores[a]);
      row[a] = s;
      total += s;
    }
    cells[c.id] = row;
    totals[c.id] = total;
  }
  // The datum leads unless a rival stands strictly above its zero line.
  let leader = datum.id;
  let best = 0;
  for (const c of candidates) {
    if (c.id === datum.id) continue;
    if (totals[c.id] > best) {
      best = totals[c.id];
      leader = c.id;
    }
  }
  return { datum: datum.id, cells, totals, leader };
}

/** The whole convergence: datum = strongest rival, then the leader takes the
 *  datum seat, until the datum holds it. Mechanical from end to end. */
export function pughView(scoresMd: string, cutsMd: string, gradeOf: (id: string) => string): PughView {
  const { candidates, axes: scoredAxes } = readScores(scoresMd);
  const cut = axesFromCuts(cutsMd, gradeOf);
  const problems = [...cut.problems];
  const axes = cut.axes.filter((a) => scoredAxes.includes(a.id));
  if (axes.length < cut.axes.length) {
    problems.push(`${cut.axes.length - axes.length} live axes carry no score column`);
  }
  const empty: PughView = { axes, candidates: candidates.map((c) => c.id), runs: [], winner: "", stable: false, problems };
  if (candidates.length < 2) {
    problems.push("fewer than two scored candidates — nothing to converge");
    return empty;
  }
  if (axes.length === 0) return empty;
  const axisIds = axes.map((a) => a.id);
  for (const c of candidates) {
    const holes = axisIds.filter((a) => c.scores[a] === undefined);
    if (holes.length > 0) problems.push(`${c.id} is unscored on ${holes.join(", ")}`);
  }
  // The first datum is the strongest rival: second by score over the live axes.
  // The presumptive leader then has to beat it.
  //
  // A HOLE IS NOT A ZERO, and it used to be. Summing `?? 0` over every live axis
  // charged a candidate for each axis nobody had scored, so honest silence read
  // as worst in class and could push a real contender out of the datum seat over
  // words nobody ever put on the page.
  //
  // A MEAN OVER SCORED AXES IS THE OPPOSITE BUG, and a reviewer caught it before
  // it stood: a candidate scored on ONE axis at 5 beats one scored on five axes
  // at 4 each. That rewards silence rather than punishing it, which is no better.
  //
  // SO THE COMPARISON RUNS ON THE AXES EVERY CANDIDATE HAS SCORED. Nobody is
  // charged for a hole and nobody profits from one, because the axes where holes
  // live are not in the comparison at all. Everyone is measured on the same
  // basis, which is the only way a sum across candidates means anything.
  //
  // WITH NO COMMON AXIS there is no honest ranking, so the order falls to the id
  // and `problems` above already names every unscored pair. An invented number
  // would read exactly like a measured one.
  // see wt-a-score-cell-with-no-evidence-behind-it-may-say-so-in-words-
  const common = axisIds.filter((a) => candidates.every((c) => c.scores[a] !== undefined));
  const total = (c: Scored): number => common.reduce((t, a) => t + (c.scores[a] as number), 0);
  const byTotal = [...candidates].sort((x, y) => total(y) - total(x) || x.id.localeCompare(y.id));
  let datum = byTotal[1];
  const runs: PughRun[] = [];
  const seated = new Set<string>();
  while (!seated.has(datum.id)) {
    seated.add(datum.id);
    const run = runAgainst(datum, candidates, axisIds);
    runs.push(run);
    if (run.leader === run.datum) break;
    datum = candidates.find((c) => c.id === run.leader) as Scored;
  }
  const last = runs[runs.length - 1];
  if (last.leader !== last.datum) problems.push("the convergence cycles — no datum holds the lead");
  return { axes, candidates: candidates.map((c) => c.id), runs, winner: last.leader, stable: last.leader === last.datum, problems };
}

/** A CREDIBLE RULING LINE, as the sensitivity card's save emits it and as
 *  the mint hook rewrites it. Unminted: "- credible: [[rival]] over
 *  [[winner]] on [[axis]]". Minted, the raid ref leads the line. */
const RULING = /^- credible: \[\[([^\]]+)\]\] over \[\[([^\]]+)\]\] on \[\[([^\]]+)\]\]\s*$/;
const MINTED = /^- \[\[(raid-[^\]]+)\]\] — credible: \[\[([^\]]+)\]\] over \[\[([^\]]+)\]\] on \[\[([^\]]+)\]\]\s*$/;

export interface FlipRuling {
  rival: string;
  winner: string;
  axis: string;
  /** The minted raid ref, empty while the ruling is unminted. */
  ref: string;
}

/** Every ruling standing in a sensitivity section, minted or not. */
export function flipRulings(content: string): FlipRuling[] {
  const out: FlipRuling[] = [];
  for (const line of content.split("\n")) {
    const pending = line.trim().match(RULING);
    if (pending !== null) {
      out.push({ rival: pending[1], winner: pending[2], axis: pending[3], ref: "" });
      continue;
    }
    const minted = line.trim().match(MINTED);
    if (minted !== null) out.push({ ref: minted[1], rival: minted[2], winner: minted[3], axis: minted[4] });
  }
  return out;
}

/** Rewrite every unminted credible line with the ref `mint` answers for it.
 *  Pure over the text — the caller owns the node write, so a test needs no
 *  filesystem and the session needs no parser. */
export function mintFlipLines(content: string, mint: (r: { rival: string; winner: string; axis: string }) => string): string {
  return content
    .split("\n")
    .map((line) => {
      const m = line.trim().match(RULING);
      if (m === null) return line;
      const ref = mint({ rival: m[1], winner: m[2], axis: m[3] });
      return ref === "" ? line : `- [[${ref}]] — credible: [[${m[1]}]] over [[${m[2]}]] on [[${m[3]}]]`;
    })
    .join("\n");
}

/** The winner's fragile ground: per rival, how far below the line it sits
 *  and which cells a single one-point score move would raise. The ruling on
 *  each — credible or dismissed — is the state's judgment, never computed. */
export function sensitivityView(scoresMd: string, cutsMd: string, gradeOf: (id: string) => string): SensitivityView {
  const pv = pughView(scoresMd, cutsMd, gradeOf);
  if (!pv.stable || pv.winner === "") {
    return { winner: pv.winner, rivals: [], problems: [...pv.problems, "no stable winner stands — sensitivity has nothing to stress"] };
  }
  const { candidates } = readScores(scoresMd);
  const winner = candidates.find((c) => c.id === pv.winner) as Scored;
  const last = pv.runs[pv.runs.length - 1];
  const rivals: RivalGap[] = candidates
    .filter((c) => c.id !== pv.winner)
    .map((c) => ({
      id: c.id,
      // max also folds JavaScript's negative zero back into zero.
      deficit: Math.max(0, -(last.totals[c.id] ?? 0)),
      swings: pv.axes
        .filter((a) => {
          const r = c.scores[a.id];
          const w = winner.scores[a.id];
          // One point moves a cell's sign only where the gap is 0 or 1 and
          // the rival is not already ahead.
          return r !== undefined && w !== undefined && r - w <= 0 && r - w >= -1;
        })
        .map((a) => ({ axis: a.id, rival_score: c.scores[a.id], winner_score: winner.scores[a.id] })),
    }))
    .sort((x, y) => x.deficit - y.deficit);
  return { winner: pv.winner, rivals, problems: pv.problems };
}

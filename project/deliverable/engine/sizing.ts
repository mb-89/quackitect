// THE SIZING BLOCK — dsp-the-sizing-block, realizing el-sizing.
//
// A compiled step in, a two-part difficulty out, a rung named from the pair,
// and the pair published beside it.
//
// IT NAMES NO MODEL AND HOLDS NO ROSTER. Resolving a rung to a concrete hand
// is whoever holds the fleet's business, and in our own deployment that is the
// walking agent — raid-dec-the-block-names-a-rung-and-never-a-model.
//
// IT STARTS NOTHING. req-the-machine-names-a-driver-and-starts-nothing. The
// lane does not spawn, in the same way it does not push, does not open records
// unasked and does not reach the screen.

import { type CellDifficulty, JUDGEMENT_RUNGS, READING_RUNGS } from "./rigor-matrix.ts";

export type Difficulty = CellDifficulty;

/** WHAT A UNIT COSTS, and how far each step in it sits below that.
 *  req-a-milestone-takes-the-maximum-complexity-over-its-rows asks for both:
 *  the answer, and the spread that makes it readable. A unit answer with no
 *  spread satisfies the first half and not the second. */
export interface UnitSizing {
  difficulty: Difficulty;
  spread: { step: string; difficulty: Difficulty }[];
}

/** A RUNG, OR THE PAIR THAT MATCHED NONE. The no-match is a returned VALUE and
 *  never an absence — raid-dec-the-no-match-is-a-returned-value-not-a-silence,
 *  after OASIS XACML 3.0 (OASIS Standard, 22 January 2013), where
 *  NotApplicable and Indeterminate are distinct returned results: no policy
 *  matched is a different outcome from the evaluation failing. An absence on
 *  the wire is indistinguishable from a crash and from never having run. */
export interface RungResult {
  rung?: string;
  unmatched?: Difficulty;
}

/** WHAT IS PUBLISHED: the decision, and the input it was made from.
 *  req-a-machine-decision-repeats asks for both, and the pair re-derives the
 *  rung so a reader can check rather than trust. */
export interface Published extends RungResult {
  pair: Difficulty;
}

/** THE RUNG VOCABULARY, AND IT IS THE INTERFACE. Everything published crosses
 *  a boundary we do not control, so these names have to be stable, documented
 *  and versioned in a way nothing else in this element does.
 *
 *  THE NAMES SAY WHAT THE WORK IS, not which model does it. `derive` is a step
 *  whose answer follows from what is already written; `frame` is one that has
 *  to make something from nothing. */
export const RUNGS = ["derive", "transcribe", "apply", "author", "frame"] as const;
export type Rung = (typeof RUNGS)[number];

function position(d: Difficulty): number | undefined {
  const j = (JUDGEMENT_RUNGS as readonly string[]).indexOf(d.judgement);
  const r = (READING_RUNGS as readonly string[]).indexOf(d.reading);
  if (j < 0 || r < 0) return undefined;
  // THE HIGHER OF THE TWO. A step whose judgement is easy and whose reading is
  // enormous gets the hand the reading demands, and the other way round.
  // Under-driving produces a plausible wrong answer that passes; over-driving
  // only costs money. That is the asymmetry
  // req-a-weaker-driver-than-named-owes-a-recorded-reason already encodes,
  // applied one level down.
  return Math.max(j, r);
}

/** THE STEP KNOWS HOW HARD IT IS, because the compile carried the cell's
 *  value onto it. This is a field read and not a join:
 *  if-engine-delta-to-sizing and if-method-compiler-to-sizing both hand this
 *  element a compiled machine, and neither hands it the matrix.
 *
 *  A STEP WITH NO DIFFICULTY REFUSES rather than defaulting. How strong a hand
 *  a step needs is an explicit value — a default would be a judgement nobody
 *  made, wearing the clothes of one somebody did. */
export function difficultyOf(step: unknown): Difficulty {
  const s = (step ?? {}) as { id?: string; complexity?: Difficulty };
  const d = s.complexity;
  if (d === undefined || typeof d.judgement !== "string" || typeof d.reading !== "string") {
    throw new Error(
      `step ${s.id ?? "(unnamed)"} carries no complexity — rate its cell, or write the line in the matrix README once every active cell is rated`,
    );
  }
  return { judgement: d.judgement, reading: d.reading };
}

/** A UNIT IS NO WEAKER THAN ITS HARDEST STEP, ON EACH FIGURE SEPARATELY, and
 *  the spread rides along so a reader can see what the answer cost.
 *
 *  THE MAXIMUM IS TAKEN PER FIGURE rather than over a collapsed rung. Taking
 *  it over the rung would lose the pair: a unit holding one heavy-reading step
 *  and one heavy-judgement step needs both figures high, and the collapsed
 *  answer would say only that it is hard. */
export function sizeUnit(steps: unknown[]): UnitSizing {
  const spread = steps.map((s) => ({ step: ((s ?? {}) as { id?: string }).id ?? "(unnamed)", difficulty: difficultyOf(s) }));
  if (spread.length === 0) throw new Error("a unit with no steps has no difficulty — there is nothing to size");
  const pick = (of: (d: Difficulty) => string, rungs: readonly string[]): string => {
    let best = 0;
    for (const s of spread) best = Math.max(best, rungs.indexOf(of(s.difficulty)));
    return rungs[best];
  };
  return {
    difficulty: { judgement: pick((d) => d.judgement, JUDGEMENT_RUNGS), reading: pick((d) => d.reading, READING_RUNGS) },
    spread,
  };
}

/** NAME THE RUNG A PAIR ASKS FOR, or return the pair that matched none.
 *  It never falls back: a silent fallback is indistinguishable from a working
 *  lookup, which is the whole reason
 *  req-an-unmatched-rung-names-itself-and-publishes-no-driver exists. */
export function rungFor(d: Difficulty): RungResult {
  const at = position(d);
  if (at === undefined) return { unmatched: { judgement: d.judgement, reading: d.reading } };
  return { rung: RUNGS[at] };
}

/** PUBLISH THE DECISION BESIDE THE INPUT IT WAS MADE FROM.
 *
 *  THE PAIR AND THE RUNG ARE REDUNDANT ON PURPOSE. The pair says what the work
 *  is like; the rung says what we would pick. Whoever disagrees with our rung
 *  can still use the pair, which is what makes the publication worth reading to
 *  somebody whose fleet is not ours. That redundancy is a cost — two things to
 *  keep consistent — and it is the price of not asserting a roster. */
export function publish(d: Difficulty): Published {
  return { pair: { judgement: d.judgement, reading: d.reading }, ...rungFor(d) };
}

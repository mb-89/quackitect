// THE SIZING BLOCK — dsp-the-sizing-block, realizing el-sizing.
//
// A compiled step in, a two-part difficulty out, a rung named from the pair,
// and the pair published beside it. It names no model, holds no roster and
// starts nothing.
//
// NOT BUILT YET. This file declares the interface the design specifies so the
// checks at tests/sizing-block.test.ts, tests/sizing-repeats.test.ts and
// tests/sizing-live-read.test.ts can be written, compiled and seen RED before
// any behaviour lands. Every function below throws. The chunks that fill them
// are the-cell-declares-a-difficulty, the-compile-carries-it-onto-the-step,
// the-sizing-block-answers and the-answer-rides-the-pull.

/** HOW HARD THE JUDGEMENT IS, and HOW MUCH HAS TO BE READ. Two ordinal
 *  figures, because the corpus holds both extremes: a finder state reads one
 *  method card and asks for deep original judgement, a partition state reads
 *  forty-nine function nodes and renders a table. One scalar calls both
 *  `major` — raid-dec-difficulty-is-two-figures-and-is-named-per-state. */
export interface Difficulty {
  judgement: string;
  reading: string;
}

/** WHAT A UNIT COSTS, and how far each step in it sits below that.
 *  req-a-milestone-takes-the-maximum-complexity-over-its-rows asks for both:
 *  the answer, and the spread that makes it readable. */
export interface UnitSizing {
  difficulty: Difficulty;
  spread: { step: string; difficulty: Difficulty }[];
}

/** A RUNG, OR THE PAIR THAT MATCHED NONE. The no-match is a returned VALUE and
 *  never an absence — raid-dec-the-no-match-is-a-returned-value-not-a-silence,
 *  after OASIS XACML 3.0 (22 January 2013), where NotApplicable and
 *  Indeterminate are distinct returned results. An absence on the wire is
 *  indistinguishable from a crash and from never having run. */
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

const NOT_BUILT =
  "sizing is not built yet — see project/spec/iterations/i38-the-machine-sizes-its-own-driver-every-s/machines/build-chunks.md";

/** Read a step's difficulty off the step in hand, never off the matrix.
 *  if-engine-delta-to-sizing and if-method-compiler-to-sizing both hand this
 *  element a compiled machine, which is what makes this a field read and not
 *  a join. */
export function difficultyOf(_step: unknown): Difficulty | undefined {
  throw new Error(NOT_BUILT);
}

/** Take a unit no weaker than its hardest step, keeping the spread. */
export function sizeUnit(_steps: unknown[]): UnitSizing {
  throw new Error(NOT_BUILT);
}

/** Name the rung a pair asks for. Where the two figures disagree the rung is
 *  the HIGHER of them: under-driving produces a plausible wrong answer that
 *  passes, over-driving only costs money. */
export function rungFor(_d: Difficulty): RungResult {
  throw new Error(NOT_BUILT);
}

/** Publish the decision beside the input it was made from. */
export function publish(_d: Difficulty): Published {
  throw new Error(NOT_BUILT);
}

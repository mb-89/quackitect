// see dsp-walk-machine.md#the-reading-proof

/** see dsp-walk-machine.md#the-words-a-reader-would-count */
const WORDY = /[\p{L}\p{N}]/u;

/** THE FRACTIONS THE PROBES SIT AT, and the only place they are written.
 *  Spread through the document on purpose — all of it has to be in hand. */
const AT = [0.3, 0.6, 0.92];

/** How many words a probe asks for, and how far the anchor runs. */
const RUN = 4;

/** A document short enough that probing part of it proves nothing. */
const FLOOR = 16;

export function readingWords(body: string): string[] {
  return body.split(/\s+/).filter((x) => x !== "" && WORDY.test(x));
}

/** How many times a run of words appears in the document. */
function occurrences(w: string[], from: number, to: number): number {
  const seq = w.slice(from, to).map((x) => x.toLowerCase());
  let n = 0;
  for (let i = 0; i + seq.length <= w.length; i++) {
    let hit = true;
    for (let k = 0; k < seq.length && hit; k++) if (w[i + k].toLowerCase() !== seq[k]) hit = false;
    if (hit) n++;
  }
  return n;
}

/** AN ANCHOR THAT APPEARS TWICE ASKS AN UNANSWERABLE QUESTION.
 *
 *  "The 4 words that FOLLOW x" has two right answers when x sits in the
 *  document twice, and the reader cannot know which one is wanted. Measured
 *  2026-08-19: front-desk.md carries "at the end of the" twice, the reader
 *  anchored on the first, and the whole document was served again.
 *
 *  GROW THE ANCHOR BACKWARDS, never forwards. The words that FOLLOW it are
 *  what the answer must contain, so extending to the left leaves the expected
 *  answer untouched and only makes the question specific. */
function anchorStart(w: string[], i: number): number {
  let start = i;
  while (start > 0 && occurrences(w, start, i + RUN) > 1) start--;
  return start;
}

/** WHAT THE PULL ASKS, AND WHAT IT WILL ACCEPT.
 *  `ask` is shown to the reader; `expect` is what the answer must contain. */
export function readingProbes(body: string): { ask: string[]; expect: string[] } {
  const w = readingWords(body);
  if (w.length < FLOOR) return { ask: ["the whole document, verbatim"], expect: [w.join(" ")] };
  const ask: string[] = [];
  const expect: string[] = [];
  for (const at of AT) {
    const i = Math.min(Math.floor(w.length * at), w.length - RUN * 2);
    ask.push(`the ${RUN} words that FOLLOW "${w.slice(anchorStart(w, i), i + RUN).join(" ")}"`);
    expect.push(w.slice(i + RUN, i + RUN * 2).join(" "));
  }
  return { ask, expect };
}

/** see dsp-walk-machine.md#the-comparison-rule */
export function normWords(s: string): string {
  return readingWords(s).join(" ").toLowerCase();
}

/** Which probes an answer did NOT satisfy. Empty means the reading is proven. */
export function probesMissed(expect: string[], answer: string): string[] {
  const given = normWords(answer);
  return expect.filter((e) => !given.includes(normWords(e)));
}

/** THE ANSWER AN HONEST READER WOULD GIVE, for anything driving the walk:
 *  the test suite, and the arrival's own walker. It is the same maths, so it
 *  cannot go stale against the probes. */
export function proofFor(body: string): string {
  return readingProbes(body).expect.join(" ... ");
}

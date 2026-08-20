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

/** WHAT THE PULL ASKS, AND WHAT IT WILL ACCEPT.
 *  `ask` is shown to the reader; `expect` is what the answer must contain. */
export function readingProbes(body: string): { ask: string[]; expect: string[] } {
  const w = readingWords(body);
  if (w.length < FLOOR) return { ask: ["the whole document, verbatim"], expect: [w.join(" ")] };
  const ask: string[] = [];
  const expect: string[] = [];
  for (const at of AT) {
    const i = Math.min(Math.floor(w.length * at), w.length - RUN * 2);
    ask.push(`the ${RUN} words that FOLLOW "${w.slice(i, i + RUN).join(" ")}"`);
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

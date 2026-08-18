// THE READING PROOF — the probe maths, in ONE place.
//
// WHY THIS FILE EXISTS (owner, 2026-08-18: "why don't you have three copies of
// the same math? Export it, put it in one place, call it from everywhere").
//
// There were three. The engine's own `readingProbes`, a mirror called
// `proofFor` in the test helpers, and two more copies inlined inside
// tests/iterations.test.ts. On 2026-08-18 the engine stopped counting markdown
// list markers as words; the helper was moved with it and the two inlined
// copies were not, so two cases went red on a change that was correct.
//
// A MIRROR IS A COPY WITH A COMMENT ON IT. The helper's own comment said "the
// engine's own proof, mirrored" and named the function it mirrored, and it
// still went stale — because a comment cannot make two functions change
// together. Only calling one function can.
//
// SO: the engine builds probes from here, the tests answer them from here, and
// tests/one-probe-maths.test.ts fails if a fourth copy appears.

/** THE WORDS A READER WOULD COUNT.
 *
 *  A markdown document is full of tokens that are not words: a list dash, a
 *  heading's hashes, a table pipe, a horizontal rule. Splitting on whitespace
 *  counts every one of them, so "the 4 words that FOLLOW" could ask for `-`
 *  and then refuse every answer a person would actually give.
 *
 *  MEASURED 2026-08-18. Boot cost four round trips on
 *  guidance/method/cloud-runner.md. The expected answer was
 *  `remedy; follow it. -` and the document reads:
 *
 *      ... Every refusal carries a
 *        remedy; follow it.
 *      - DO NOT PUSH.
 *
 *  Three attempts gave the three words a reader sees. Only quoting the list
 *  marker of the NEXT bullet was accepted.
 *
 *  THE i35 FIELD REPORT READ THE SAME SYMPTOM AS LINE-BREAK SENSITIVITY. It is
 *  not that: normWords flattens whitespace on both sides, so an anchor
 *  crossing a newline compares fine. The tokens were the fault, not the
 *  breaks.
 *
 *  A token counts when it carries a letter or a digit. */
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

/** THE COMPARISON RULE, beside the probe rule because they are one decision.
 *  Whitespace and case are flattened, so an answer whose words crossed a line
 *  break in the source still matches.
 *
 *  AND THE ANSWER IS COUNTED THE WAY THE PROBE WAS CUT. WORDY drops the tokens
 *  a reader would not count when the probe is built; until 2026-08-18 nothing
 *  dropped them again when the answer came back, so a reader who did what the
 *  hint says — quote it VERBATIM, punctuation and all — failed on any window
 *  holding a standalone em dash.
 *
 *  MEASURED AT THE i17 BOOT. front-desk.md reads "and NO vocabulary on purpose
 *  —\nthose must come from the sweep". The probe asked for the 4 words that
 *  FOLLOW "and NO vocabulary on". The verbatim answer carried the dash and was
 *  refused; only the answer with the dash REMOVED was accepted. Two calls, on a
 *  document that had been read.
 *
 *  ONE FILTER ON BOTH SIDES IS THE FIX, and it is strictly more permissive:
 *  every answer that passed before still passes. */
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

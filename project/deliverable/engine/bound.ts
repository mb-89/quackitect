// THE ANSWER'S BOUND (tsp-answer-bound, req-the-answer-never-exceeds-its-bound).
//
// THE FLOOR, NOT THE WHOLE FIX. The owner's design is both halves: split the
// sources into chunks small enough to be pulled whole, AND keep a mechanism
// that guarantees no answer can ever overflow whatever the sources look like.
// This file is the second half. The split is a separate concern with no
// element carrying it yet.
//
// WHY IT IS URGENT. Three overflows landed in i27's M0 alone, at 281 KB and
// 277 KB. Every pull in the session of 2026-08-14 returned between 280 and
// 350 KB and could not be read, and two fills were misdirected as a direct
// result. When a SUBMIT is refused, the reason sits inside a payload nobody
// can read, and no cheap question answers it.
//
// WHAT THE HOST DOES TODAY: truncates, and says so in a way the engine never
// sees. What this does instead: sends a small, structured answer that names
// the size and carries an executable way to fetch the whole.

/** The size no answer may exceed, in characters of serialised JSON.
 *
 *  Chosen well under the smallest host limit observed biting, so the bound
 *  fires before the host's own cut does. A host that truncates gives back
 *  nothing the engine can act on; this gives back a remedy. */
export const ANSWER_BOUND_BYTES = 60_000;

export interface BoundedAnswer {
  /** What actually goes on the wire. */
  text: string;
  /** True when the whole answer was held back and a pointer sent instead. */
  cut: boolean;
  /** The size of the whole answer, always — so a reader can see the shape of
   *  the problem even on the calls that fit. */
  bytes: number;
}

/** Serialise an answer within the bound, or send a pointer to the whole.
 *
 *  THE WHOLE ANSWER IS ALREADY LOGGED by the time this runs, so the pointer
 *  costs nothing to honour: the call log holds the response verbatim and
 *  se_log_query pages newest-first. */
export function boundAnswer(tool: string, payload: unknown): BoundedAnswer {
  const text = JSON.stringify(payload, null, 1);
  if (text.length <= ANSWER_BOUND_BYTES) return { text, cut: false, bytes: text.length };
  const pointer = {
    bounded: true,
    tool,
    bytes: text.length,
    bound: ANSWER_BOUND_BYTES,
    note: "this answer exceeded the bound, so it was NOT sent. The whole of it is in the call log, verbatim.",
    remedy: {
      tool: "se_log_query",
      args: { filter: { tool }, limit: 1 },
      note: "the log pages newest first, so limit 1 on this tool is exactly the call you just made",
    },
  };
  return { text: JSON.stringify(pointer, null, 1), cut: true, bytes: text.length };
}

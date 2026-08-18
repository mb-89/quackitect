// see dsp-lane-door.md#the-answers-bound
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** The size no answer may exceed, in characters of serialised JSON.
 *
 *  Chosen well under the smallest host limit observed biting, so the bound
 *  fires before the host's own cut does. A host that truncates gives back
 *  nothing the engine can act on; this gives back content plus a cursor. */
export const ANSWER_BOUND_BYTES = 60_000;

/** A first guess at what the envelope costs. The real cost is measured. */
const ENVELOPE = 4_000;

/** The smallest page worth sending. Below this the answer is all envelope,
 *  and the caller is better served by the cursor alone. */
const MIN_PAGE = 500;

/** Where an oversized answer spills. Set by whoever knows the project root;
 *  until it is set, the bound still holds and the cursor names the call log
 *  instead of a file. */
let spillDir: string | undefined;

export function setAnswerSpill(seDir: string): void {
  spillDir = join(seDir, "answers");
}

export interface BoundedAnswer {
  /** What actually goes on the wire. */
  text: string;
  /** True when the whole answer was held back and a page sent instead. */
  cut: boolean;
  /** The size of the whole answer, always — so a reader can see the shape of
   *  the problem even on the calls that fit. */
  bytes: number;
}

/** Serialise an answer within the bound, or send its first page and a cursor.
 *
 *  THE WHOLE ANSWER IS ALSO LOGGED by the time this runs, so nothing is lost
 *  even when the spill cannot be written. */
export function boundAnswer(tool: string, payload: unknown): BoundedAnswer {
  const whole = JSON.stringify(payload, null, 1);
  if (whole.length <= ANSWER_BOUND_BYTES) return { text: whole, cut: false, bytes: whole.length };

  const spilled = spill(tool, whole);
  const next =
    spilled === undefined
      ? {
          tool: "se_log_query",
          args: { filter: { tool }, limit: 1 },
          note: "no spill file was written, so the call log is the copy — it holds this response verbatim",
        }
      : {
          tool: "se_file_read",
          args: { path: spilled, offset: 1, limit: 400 },
          note: "se_file_read pages by line and is bounded by its own limit, so no page can overflow. Walk it with offset.",
        };

  // MEASURE THE SERIALISED LENGTH, never assume it. A JSON body is full of
  // quotes and newlines, and stringify escapes every one of them — so a
  // 56 KB slice can serialise to well over the bound. Guessing an envelope
  // allowance broke the floor on the first run, and the floor is the whole
  // point. Shrink until it actually fits.
  let take = ANSWER_BOUND_BYTES - ENVELOPE;
  let text = "";
  for (;;) {
    text = JSON.stringify(
      {
        bounded: true,
        tool,
        bytes: whole.length,
        bound: ANSWER_BOUND_BYTES,
        page: { from: 0, to: take, of: whole.length },
        note: "the first page rides here. The whole answer is on disk, and the cursor below walks it a page at a time.",
        next,
        body: whole.slice(0, take),
      },
      null,
      1,
    );
    if (text.length <= ANSWER_BOUND_BYTES || take <= MIN_PAGE) break;
    // Scale by how far over we are, with a margin so this converges rather
    // than creeping down one character at a time.
    take = Math.max(MIN_PAGE, Math.floor(take * (ANSWER_BOUND_BYTES / text.length) * 0.9));
  }
  return { text, cut: true, bytes: whole.length };
}

/** Write the whole answer where a paged reader can reach it.
 *
 *  ONE FILE PER TOOL, overwritten. The newest is always the one a caller
 *  wants, and disk stays bounded by the number of tools rather than by the
 *  number of calls. */
function spill(tool: string, whole: string): string | undefined {
  if (spillDir === undefined) return undefined;
  try {
    mkdirSync(spillDir, { recursive: true });
    const abs = join(spillDir, `${tool}.json`);
    writeFileSync(abs, whole, "utf8");
    // Root-relative, because that is the only address the lane accepts.
    return `.se/answers/${tool}.json`;
  } catch {
    return undefined; // the log still has it; the bound still holds
  }
}

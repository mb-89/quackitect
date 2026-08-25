// see dsp-lane-door.md#the-answers-bound
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { harnessFor, registryCapFor } from "./harness.ts";

/** The ceiling this project sets for itself, in characters of serialised
 *  JSON. req-oversized-results-remain-recoverable-through-the-lane names it.
 *
 *  IT IS A MEASUREMENT NOW, NOT A CAUTIOUS GUESS. The old figure of 6,000 was
 *  chosen without measuring any host, and it cost a session 208 of its 549
 *  reads: every answer above it spilled to disk and was paged back a slice at
 *  a time. A ladder on a real host settled at 50,000, and a cloud box settled
 *  higher still.
 *
 *  THE SMALLEST MEASURED HOST STILL WINS over this number, so raising it
 *  cannot push an answer past a host that was measured tighter. */
const OWN_CEILING = 50_000;

/** The size no answer may exceed.
 *
 *  IT IS DERIVED, NOT CHOSEN. The bound is our own ceiling or the smallest
 *  limit measured across supported hosts, whichever is tighter. Measuring a
 *  host tighter than the ceiling therefore lowers the bound by itself, and a
 *  number written here by hand could not do that.
 *
 *  A host that truncates gives back nothing the engine can act on; this gives
 *  back content plus a cursor. */
/** THE MOST WE WILL SEND EVEN WHERE A HOST TAKES MORE. A cap measured very
 *  high is still a cap on ONE answer, and a caller reading in pages of a
 *  quarter megabyte is not reading, it is dumping. */
const HARD_MAX = 60_000;

/** The size no answer may exceed.
 *
 *  THREE NUMBERS DECIDE IT, and the measured one wins where it exists. A cap
 *  measured on THIS host through se_probe_cap is the truth about this host; a
 *  registry entry is the truth about hosts somebody measured earlier; and our
 *  own ceiling is the fallback where neither exists.
 *
 *  IT IS A `let` ON PURPOSE. The measured cap is read from disk, and the disk
 *  is not reachable until somebody tells this module where the session lives.
 *  setAnswerSpill does that, and reopens the number then. */
/** WHAT TO USE WHERE THIS MACHINE HAS NEVER BEEN MEASURED.
 *
 *  IT IS A STARTING POINT, NOT A CEILING FOR EVERYBODY. The bound belongs to
 *  the host it is running on: a box that cuts at twenty thousand should cut at
 *  twenty thousand, and one that carries fifty thousand should carry fifty
 *  thousand. Taking the smallest figure measured across ALL known hosts made
 *  every machine as slow as the tightest one ever seen.
 *
 *  SEEING A HOST OFFLOAD AN ANSWER MEANS THIS NUMBER IS TOO HIGH HERE. Climb
 *  the ladder in guidance/method/boot.md and record what it settles at. */
const UNMEASURED_DEFAULT = 20_000;

/** The size no answer may exceed ON THIS MACHINE.
 *
 *  THE MEASURED FIGURE WINS, and it is read from disk by setAnswerSpill once
 *  the session knows where it lives. Until then this is the starting point. */
export let ANSWER_BOUND_BYTES = Math.min(OWN_CEILING, UNMEASURED_DEFAULT);

/** THE ONE ANSWER THAT IS NEVER BOUND. The cap probe exists to find where the
 *  HOST cuts, so bounding it would measure our own ceiling instead. */
const UNBOUNDED_TOOLS = new Set(["se_probe_cap"]);

/** WHERE A MEASURED CAP IS KEPT, per checkout.
 *
 *  IT IS MEASURED, NOT DECLARED. Only the agent can see whether an answer
 *  arrived whole, because the cut happens between the host and the model and
 *  the engine never hears about it. se_probe_cap is the ladder that finds the
 *  number, and this file is where the answer lands so later sessions inherit
 *  it instead of guessing again. */
function capFile(seDir: string): string {
  return join(seDir, "harness-cap.json");
}

/** WHICH KIND OF PLACE THIS IS, rather than which machine.
 *
 *  A CONTAINER IS REBUILT FOR EVERY SESSION, so a key naming one machine never
 *  finds its own entry and pays the ladder every time. The key is therefore a
 *  CATEGORY wherever one can be found.
 *
 *  THE HARNESS AND THE PLATFORM ARE THE CATEGORY. Two runs of the same client
 *  on the same kind of operating system cut an answer in the same place, and
 *  nothing finer has ever been measured to differ. */
export function hostCategory(clientName?: string): string {
  const harness = harnessFor(clientName);
  return `${harness?.id ?? "unknown"}/${process.platform}`;
}

interface CapFile {
  /** The flat value, kept so a file written before categories still reads. */
  inlineOutputBytes?: number;
  /** What was measured, per category of host. */
  hosts?: Record<string, number>;
}

function readCapFile(seDir: string): CapFile {
  try {
    return JSON.parse(readFileSync(capFile(seDir), "utf8")) as CapFile;
  } catch {
    return {};
  }
}

export function recordHostCap(seDir: string, cap: number, category?: string): Record<string, unknown> {
  const clean = Math.max(2_000, Math.floor(cap));
  const key = category ?? hostCategory();
  const held = readCapFile(seDir);
  const hosts = { ...(held.hosts ?? {}), [key]: clean };
  mkdirSync(seDir, { recursive: true });
  writeFileSync(capFile(seDir), JSON.stringify({ inlineOutputBytes: clean, hosts }, null, 1), "utf8");
  return {
    recorded: clean,
    category: key,
    note: "the answer bound moves to this on the next engine start — se_reload puts it into effect now",
  };
}

export function hostCapState(seDir: string): Record<string, unknown> {
  return {
    own_ceiling: OWN_CEILING,
    measured_for_this_host: readHostCap(seDir),
    in_effect: ANSWER_BOUND_BYTES,
    how: "climb se_probe_cap {bytes} until the END-OF-PROBE marker stops arriving, then se_probe_cap {cap: <largest intact>}",
  };
}

/** WHAT WAS MEASURED FOR THIS KIND OF HOST, from the machine-local file first
 *  and the committed registry second.
 *
 *  THE REGISTRY IS THE HALF THAT SURVIVES A FRESH CONTAINER. `.se/` dies with
 *  the box, so a cloud run inherits nothing from the last one; the registry is
 *  in version control and every clone reads the same answer. That is what lets
 *  a category be measured once rather than once per session. */
export function readHostCap(seDir: string, category?: string): number | undefined {
  const key = category ?? hostCategory();
  const held = readCapFile(seDir);
  const mine = held.hosts?.[key];
  if (typeof mine === "number" && mine > 0) return mine;
  const flat = held.inlineOutputBytes;
  if (typeof flat === "number" && flat > 0) return flat;
  return registryCapFor(key);
}

/** True when nothing has ever measured this kind of host, which is the boot
 *  step's whole question. */
export function hostCapIsUnmeasured(seDir: string, category?: string): boolean {
  return readHostCap(seDir, category) === undefined;
}

/** A first guess at what the envelope costs. The real cost is measured. */
const ENVELOPE = 2_500;

/** What an se_file_read response weighs AROUND its content. MEASURED at 162
 *  characters across three answer shapes; 200 is that with room. Not the same
 *  number as ENVELOPE above, which covers a bounded answer of any tool. */
const READ_ENVELOPE = 200;

/** What a slice of an already-serialised answer costs when the read's own
 *  response serialises it AGAIN.
 *
 *  IT IS THE WORST CASE AND NOT THE TYPICAL ONE. Measured over real answers —
 *  survey notes, engine source, log records — the second escape costs 1.066.
 *  Sizing the page on that number is wrong, because a read whose own answer
 *  exceeds the bound spills AGAIN, and a spill of a spill is the recursion the
 *  cursor exists to avoid. A page that usually fits is not good enough when
 *  not fitting costs a loop.
 *
 *  IT USED TO BE THE WORST CASE, 2, AND THAT WAS THE WRONG TRADE. A page
 *  sized on the worst case is less than half of what fits, so every reading
 *  loop paid about twice the calls it needed. MEASURED: boot's four
 *  documents come to 61,439 bytes, which is about 29 page reads at the old
 *  page and about 14 at this one.
 *
 *  THE RECURSION IT GUARDED AGAINST IS GONE. characterRead now serialises its
 *  answer and shrinks the slice until it fits, reporting what actually came
 *  back in char_range.to. A page that would not fit is trimmed rather than
 *  spilled, so an optimistic suggestion costs nothing. */
const SECOND_ESCAPE = 1.15;

/** The smallest page worth sending. Below this the answer is all envelope,
 *  and the caller is better served by the cursor alone. */
const MIN_PAGE = 500;

/** THE PAGE THE CURSOR SUGGESTS, derived rather than chosen.
 *
 *  It moves with the bound: a host measured tighter than our own ceiling
 *  lowers ANSWER_BOUND_BYTES, and this lowers with it. A literal could not.
 *
 *  see dsp-lane-door.md#the-answers-bound */
function pageFor(bound: number): number {
  return Math.max(MIN_PAGE, Math.floor((bound - READ_ENVELOPE) / SECOND_ESCAPE));
}

export let SPILL_PAGE_CHARS = pageFor(ANSWER_BOUND_BYTES);

/** Where an oversized answer spills. Set by whoever knows the project root;
 *  until it is set, the bound still holds and the cursor names the call log
 *  instead of a file.
 *
 *  THIS IS A FALLBACK, NOT THE ADDRESS. Two servers at different roots share
 *  this module, so the last one to build used to win it and every other
 *  server wrote its spill where its own reader never looked. Callers that
 *  know their root pass it to boundAnswer instead. */
let spillDir: string | undefined;

export function setAnswerSpill(seDir: string): void {
  spillDir = join(seDir, "answers");
  // THE MEASURED CAP TAKES EFFECT HERE, which is the first moment this module
  // knows where to look for it.
  const measured = readHostCap(seDir);
  if (measured !== undefined) ANSWER_BOUND_BYTES = Math.min(HARD_MAX, measured);
  SPILL_PAGE_CHARS = pageFor(ANSWER_BOUND_BYTES);
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
export function boundAnswer(tool: string, payload: unknown, seDir?: string): BoundedAnswer {
  const whole = JSON.stringify(payload, null, 1);
  if (UNBOUNDED_TOOLS.has(tool)) return { text: whole, cut: false, bytes: whole.length };
  if (whole.length <= ANSWER_BOUND_BYTES) return { text: whole, cut: false, bytes: whole.length };

  const spilled = spill(tool, whole, seDir === undefined ? spillDir : join(seDir, "answers"));
  const next =
    spilled === undefined
      ? {
          tool: "se_log_query",
          args: { filter: { tool }, limit: 1 },
          note: "no spill file was written, so the call log is the copy — it holds this response verbatim",
        }
      : {
          tool: "se_file_read",
          args: { path: spilled, char_offset: 0, char_limit: SPILL_PAGE_CHARS },
          note: "Read the exact spill text by character. Continue at char_range.to until it reaches char_range.of.",
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
function spill(tool: string, whole: string, dir: string | undefined): string | undefined {
  if (dir === undefined) return undefined;
  try {
    mkdirSync(dir, { recursive: true });
    const abs = join(dir, `${tool}.json`);
    writeFileSync(abs, whole, "utf8");
    // Root-relative, because that is the only address the lane accepts.
    return `.se/answers/${tool}.json`;
  } catch {
    return undefined; // the log still has it; the bound still holds
  }
}

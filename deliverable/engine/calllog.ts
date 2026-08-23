// The call log — harvested from v2 (§9: log everything raw; derive at read
// time). Every dispatch through the single MCP path lands here: tool, args,
// verdict, duration. se_run responses are logged IN FULL under their ref so
// a run is citable evidence. Machine-local (.se/), never committed.

import { randomBytes } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";
import { stripBom } from "./jsonio.ts";

/** THE PART A HAND PLAYED. Closed on purpose: an open vocabulary makes every
 *  count a guess about what the words meant that day. Two was never the
 *  property — req-acts-carry-role-and-channel's Detail fixed it at two until
 *  2026-08-20, which is why no design about which of two agents walks a step
 *  could ever score on it. */
export type CallPart = "owner" | "walker" | "guide" | "reviewer" | "researcher" | "surface";

export interface CallRecord {
  ref: string;
  ts: string;
  tool: string;
  args: Record<string, unknown>;
  ok: boolean;
  outcome: "result" | "rejected" | "errored";
  duration_ms: number;
  /** Capped response summary — or the FULL payload for se_run. */
  response?: unknown;
  /** see dsp-call-log.md#the-acting-role-is-stamped-where-the-call-is-served */
  actor?: "human" | "agent" | "ui";
  /** WHERE THE CALL LANDED, stamped by the code that knows — the same rule the
   *  actor above follows. The stamp is taken AFTER the handler runs, so a pull
   *  that moved the walk carries its DESTINATION, and a refusal carries where
   *  it stood when it was refused.
   *
   *  IT USED TO BE INFERRED AND THE INFERENCE DOES NOT HOLD. Cost per state was
   *  to be recovered by carrying each pull's `where` forward from its RESPONSE;
   *  measured on this project's own log, 2,233 of 2,298 pull responses are
   *  capped to invalid JSON and 31 are recoverable. A trail nobody can partition
   *  cannot answer which state cost what.
   *  see dsp-call-log.md#the-walk-position-is-stamped-not-inferred */
  where?: string[];
  /** WHICH PART THE WORK'S AUTHOR PLAYED — dsp-the-three-coordinates-on-a-call,
   *  req-every-call-records-the-part-its-caller-played. A closed vocabulary
   *  that tells the hand holding the walk apart from a hand it delegated to.
   *  `actor` cannot: a walker and a guide are both `agent`.
   *
   *  NOT ENFORCED YET. The field is declared so the checks at
   *  tests/call-attribution.test.ts compile and run red. Requiring it,
   *  refusing a value outside the vocabulary, and taking it from the work's
   *  AUTHOR rather than the caller are the chunks
   *  the-call-record-grows-three-fields and
   *  the-role-vocabulary-separates-two-hands. */
  part?: CallPart;
  /** WHO FILED IT, where that is not who authored it. A guide may work the
   *  lane itself, and then this is absent. Where the walker carries a guide's
   *  work back instead, `part` stays the guide's and this says who relayed. */
  relayed_by?: CallPart;
  /** THE MODEL THAT ANSWERED, taken from what SERVED the call rather than from
   *  what was requested — req-every-call-records-the-model-that-answered-it. */
  answered_by?: string;
  /** THE STATE THE WALK STOOD IN, as a field of its own rather than inside an
   *  argument, so the log can be grouped by it —
   *  req-every-call-records-the-state-it-was-made-in. */
  state?: string;
  /** SOLO OR SPAWNED, at the moment this call was served. `.se/settings.json`
   *  is session-global and gets rewritten, so a retro reading it later learns
   *  which arm the LAST session ran — not which arm THIS record ran. The
   *  call log is the archive; this stamp is what makes the two arms
   *  comparable per record rather than per session. */
  hands?: "solo" | "spawned";
  /** WHICH OF THE FIELDS ABOVE ARE SELF-REPORTED. The state is known where the
   *  call is served; the model and the part are known only to the caller. A
   *  field that reads like an observation and is a claim is worse than an
   *  empty one, because nobody knows to doubt it.
   *
   *  THE MARK COMES OFF when the value arrives from whatever performed the
   *  spawn, which knows what it started and is not the party being measured.
   *  That party is the walking agent and it is inside our walk, so this is a
   *  trust boundary rather than a missing party. */
  claimed?: string[];
  /** THE DRIVER THE MILESTONE NAMED, kept beside what answered so the two can
   *  be compared without reconstructing either side. */
  named_driver?: string;
  /** WHY A WEAKER HAND WALKED IT — req-a-weaker-driver-than-named-owes-a-recorded-reason. */
  weaker_reason?: string | null;
  /** THE CALLER'S OWN WORD THAT A WEAKER HAND THAN NAMED WALKED THIS STEP.
   *  Not computable here: `named_driver` is a rung and `answered_by` is a
   *  model name, and no mapping between them exists in this tree. */
  went_weaker?: boolean;
  /** THE MARK THAT A REASON WAS OWED AND NOT GIVEN. Marked rather than
   *  refused: refusing would be a different requirement.
   *
   *  IT FIRES ON A WEAKER WALK, NOT ON A NAMED ONE. It used to fire whenever
   *  a driver was named and no reason came with it, which marked a step walked
   *  at or above its named strength identically to one that went below — and
   *  the lane asks for `named_driver` on every call. */
  unreasoned?: boolean;
  se_version: string;
}

/** What the last sitting did, derived rather than written down. */
export interface LastSession {
  from: string;
  to: string;
  calls: number;
  /** The last position the machine reported — where the person walked away. */
  ended_at?: string;
  /** Refusal clause to count, so a repeated one is visible at a glance. */
  refusals?: Record<string, number>;
  notes?: string[];
  answers?: string[];
}

// One fact, read from the manifest. It was hardcoded here and stopped
// following the product at 4.0.0 (see version.ts).
import { SE_VERSION } from "./version.ts";

const GB = 1024 * 1024 * 1024;

/** see dsp-call-log.md#the-one-second-rule-is-the-line */
export function slowMs(): number {
  return Number(process.env.SE_SLOW_MS ?? 1000);
}

/** see dsp-call-log.md#the-live-files-ceiling */
const ROTATE_BYTES = 12 * 1024 * 1024;

/** How many archives the retro-boundary scan reads before giving up.
 *  see dsp-call-log.md#the-boundary-scan-crosses-rotations */
const ARCHIVE_SCAN = 12;

/** How often the size is checked. A stat is cheap; a stat per append is
 *  still a syscall on the hot path for nothing. */
const STAT_EVERY = 50;

/** THE CLOSED ROLE VOCABULARY, checked at run time and not only at compile
 *  time. A vocabulary that holds for our own code and for nothing arriving
 *  through a lane call is not closed — see
 *  req-every-call-records-the-part-its-caller-played. */
// `researcher` JOINED ON 2026-08-23. It was left out on the reasoning that a
// researcher need not report to the log — true of the log, false of liveness.
// A hand whose part is not in this set cannot have its narration attributed to
// it, so the work table marked a working researcher idle and could not be told
// otherwise.
const PARTS: ReadonlySet<string> = new Set<CallPart>(["owner", "walker", "guide", "reviewer", "researcher", "surface"]);

/** THE TWO COORDINATES ONLY THE CALLER KNOWS. The state is written by the
 *  handler that served the call; these two are claims and are marked. */
const SELF_REPORTED = ["answered_by", "part"] as const;

/** A DECLARED ABSENCE, never a silent one. A caller that cannot know what
 *  answered says so in the value rather than leaving the field out, for the
 *  same reason the sizing block returns a no-match instead of nothing: an
 *  absence on the wire is indistinguishable from a crash and from never
 *  having run. A missing field reads as complete; this one reads as unknown. */
export const UNREPORTED = "unreported";

/** EVERY COORDINATE OR NONE — req-every-call-records-the-state-it-was-made-in.
 *  A record missing one reads as complete and answers nothing, which is worse
 *  than an absent record because nothing looks wrong. The measure is explicit:
 *  calls whose part is absent = 0. */
function assertCoordinates(entry: { answered_by?: string; state?: string; part?: string; relayed_by?: string }): void {
  for (const key of ["answered_by", "state", "part"] as const) {
    const v = entry[key];
    if (typeof v !== "string" || v === "") throw new Error(`a call record needs ${key} — every coordinate or none`);
  }
  for (const key of ["part", "relayed_by"] as const) {
    const v = entry[key];
    if (v !== undefined && !PARTS.has(v)) {
      throw new Error(`${key} "${v}" is outside the closed vocabulary: ${[...PARTS].join(", ")}`);
    }
  }
  if (entry.relayed_by !== undefined && entry.relayed_by === entry.part) {
    throw new Error("relayed_by names who FILED work somebody else authored — it cannot be the author's own part");
  }
}

export class CallLog {
  readonly path: string;
  private sinceStat = STAT_EVERY;

  constructor(seDir: string) {
    this.path = join(seDir, "calls.jsonl");
  }

  append(entry: Omit<CallRecord, "ref" | "ts" | "se_version" | "claimed">): CallRecord {
    assertCoordinates(entry);
    const rec: CallRecord = {
      ref: `call-${randomBytes(6).toString("hex")}`,
      ts: new Date().toISOString(),
      se_version: SE_VERSION,
      ...entry,
      claimed: [...SELF_REPORTED],
      ...(entry.went_weaker === true && entry.weaker_reason === undefined ? { weaker_reason: null, unreasoned: true } : {}),
    };
    mkdirSync(dirname(this.path), { recursive: true });
    appendFileSync(this.path, `${JSON.stringify(rec)}\n`, "utf8");
    this.rotateIfFull();
    return rec;
  }

  /** see dsp-call-log.md#rotate-by-rename */
  private rotateIfFull(): void {
    if (--this.sinceStat > 0) return;
    this.sinceStat = STAT_EVERY;
    try {
      if (statSync(this.path).size < ROTATE_BYTES) return;
      renameSync(this.path, join(dirname(this.path), `calls-${new Date().toISOString().replace(/[:.]/g, "-")}.jsonl`));
    } catch {
      // a rotation that cannot happen must never cost a record
    }
  }

  /** One file's lines, or none where it is absent. */
  private read(p: string): string[] {
    return existsSync(p) ? stripBom(readFileSync(p, "utf8")).split("\n") : [];
  }

  /** The archives, OLDEST FIRST — the order the live file continues from, so
   *  a caller reading history then the live file reads it in time order. */
  private archives(): string[] {
    try {
      return readdirSync(dirname(this.path))
        .filter((n) => /^calls-.*\.jsonl$/.test(n))
        .sort()
        .map((n) => join(dirname(this.path), n));
    } catch {
      return [];
    }
  }

  /** Total bytes across the live file and every archive — the number the
   *  gigabyte conversation is about. */
  bytesKept(): number {
    let total = 0;
    for (const p of [...this.archives(), this.path]) {
      try {
        total += statSync(p).size;
      } catch {}
    }
    return total;
  }

  /** ONE PARSE, NOT FOUR THOUSAND (owner, 2026-07-29: clicking a log line
   *  took seconds). This walked records(), which JSON.parses EVERY line of
   *  the whole log into an object, to return exactly one of them. At five
   *  megabytes that is thousands of parses per click, synchronously, on the
   *  server's event loop — so the mirror froze for the duration.
   *
   *  A ref is a fixed token, so a substring test rules out almost every line
   *  for the price of a scan. Only a line that could hold it is parsed.
   *
   *  Newest first: a reader clicks what they just saw, and the feed shows the
   *  newest at the top. */
  find(ref: string): CallRecord | undefined {
    // NEWEST FILE FIRST, then back through the archives. A ref lookup is rare
    // and must never MISS — a record the reader can see in the feed but not
    // open would be worse than a slow open.
    for (const p of [this.path, ...this.archives().reverse()]) {
      const hit = CallLog.findIn(p, ref);
      if (hit !== undefined) return hit;
    }
    return undefined;
  }

  private static findIn(path: string, ref: string): CallRecord | undefined {
    if (!existsSync(path)) return undefined;
    const lines = stripBom(readFileSync(path, "utf8")).split("\n");
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (!line.includes(ref)) continue;
      try {
        const rec = JSON.parse(line) as CallRecord;
        if (rec.ref === ref) return rec;
      } catch {}
    }
    return undefined;
  }

  /** THE LIVE FILE ONLY, unless the caller says how far back it needs.
   *
   *  This is the bounded default and it is the point of rotating. Nearly every
   *  read wants recent records: the retro mines its own period, the banner
   *  reads the previous sitting, the feed shows the newest page. Reaching into
   *  the archives for those would put the whole history back on the event loop
   *  and rotation would have bought nothing.
   *
   *  `since` is the one honest reason to go further. When the live file does
   *  not reach back that far, archives are prepended until it does — so a
   *  retro whose window crosses a rotation still sees its whole period.
   *  Without that, the first retro after a rotation would silently mine half
   *  its window and report a clean run that was not clean. */
  private lines(since?: string): string[] {
    const read = (p: string): string[] => this.read(p);
    const live = read(this.path);
    if (since === undefined) return live;
    const reaches = (ls: string[]): boolean => {
      for (const l of ls) {
        const m = /"ts":"([^"]+)"/.exec(l);
        if (m !== null) return m[1] <= since;
      }
      return false;
    };
    let out = live;
    for (const p of this.archives().reverse()) {
      if (reaches(out)) break;
      out = read(p).concat(out);
    }
    return out;
  }

  /** WHERE THE PREVIOUS RETRO ENDED, from drain lines alone. Only lines
   *  that could hold a drain are parsed — the same substring trade find()
   *  makes. carried and backlog are judgment dispositions the desk is
   *  refused, so the newest of those marks a retro.
   *
   *  THE FALLBACK IS THE LIVE FILE'S START, NEVER ANOTHER DRAIN (owner
   *  instruction 2026-08-18). A `done` or `obsolete` drain is a check anyone
   *  can run and every walk makes them, so taking the newest drain of ANY
   *  disposition puts the mark wherever the last walk happened to tidy up.
   *
   *  MEASURED at i16's onboard-retro, the morning it was fixed: the live log
   *  held 2804 records back to the previous afternoon and no judged drain,
   *  because the one `carried` call had been REFUSED under SE-C-110 and a
   *  refused record is skipped. The old fallback took a `done` drain from an
   *  hour earlier and answered 68 records, hiding 2736 — every call of the
   *  session the retro exists to mine.
   *
   *  IT FAILED SILENTLY, which is why it is worth this many lines. A
   *  truncated mining window reports almost nothing and reads as finished,
   *  and retro.md step 1 already promised the behaviour this now has.
   *
   *  THE SCAN CROSSES ROTATIONS, corrected 2026-08-20. It used to read the
   *  LIVE FILE ALONE and call the live file's start "the honest answer" for a
   *  drain older than it. That reasoning assumed a rotation lands between
   *  retros. It does not: this log rotates every 12 MB, which this project
   *  fills in under a day, so a rotation lands INSIDE an iteration.
   *
   *  MEASURED at the retro that fixed it. The live file held 1,613 records
   *  back to 10:57 that morning; the archive beside it held 14,460 more,
   *  reaching to the previous afternoon. The window the retro mined was 10%
   *  of the period it was mining, and nothing said so — the same silent
   *  truncation the paragraph above exists to prevent, in a new place.
   *
   *  SO ARCHIVES ARE SEARCHED NEWEST FIRST until a judged drain turns up. The
   *  scan is bounded: past ARCHIVE_SCAN, the previous retro is prehistory and
   *  the oldest record actually read is as good a floor as any. */
  private lastRetroMark(): string | undefined {
    const live = this.mark(this.lines());
    if (live.judged !== undefined) return live.judged;
    let first = live.first;
    let scanned = 0;
    for (const p of this.archives().reverse()) {
      if (++scanned > ARCHIVE_SCAN) break;
      const m = this.mark(this.read(p));
      if (m.judged !== undefined) return m.judged;
      if (m.first !== undefined) first = m.first;
    }
    return first;
  }

  /** The newest judged drain in one file's lines, and that file's first
   *  timestamp. Split out so the archive walk above can ask it per file. */
  private mark(lines: string[]): { judged?: string; first?: string } {
    let judged: string | undefined;
    let first: string | undefined;
    for (const line of lines) {
      // The first parseable record dates the live file. Only this one line is
      // parsed speculatively — the whole-log parse is what killed the server
      // in 2026-08-09, and the substring guard below still holds for the rest.
      if (first === undefined) {
        try {
          first = (JSON.parse(line) as CallRecord).ts;
        } catch {}
      }
      if (!line.includes('"se_note_drain"')) continue;
      try {
        const rec = JSON.parse(line) as CallRecord;
        if (rec.tool !== "se_note_drain" || !rec.ok) continue;
        const d = String((rec.args as { disposition?: unknown }).disposition ?? "");
        if (d === "carried" || d === "backlog") judged = rec.ts;
      } catch {}
    }
    return { judged, first };
  }

  /** see dsp-call-log.md#the-whole-log-parse-was-the-server-killer */
  private filtered(f: { tool?: string; ok?: boolean; text?: string; since?: string; min_ms?: number }): CallRecord[] {
    const rough: ((l: string) => boolean)[] = [];
    if (f.tool !== undefined) rough.push((l) => l.includes(`"tool":"${f.tool}"`));
    if (f.ok !== undefined) rough.push((l) => l.includes(`"ok":${f.ok}`));
    if (f.text !== undefined) {
      const t = f.text.toLowerCase();
      rough.push((l) => l.toLowerCase().includes(t));
    }
    if (f.since !== undefined) {
      const s = f.since;
      rough.push((l) => {
        const m = /"ts":"([^"]+)"/.exec(l);
        return m !== null && m[1] >= s;
      });
    }
    // THE SLOWNESS MINE: what took longer than X, at ANY door, in one ask.
    if (f.min_ms !== undefined) {
      const min = f.min_ms;
      rough.push((l) => {
        const m = /"duration_ms":(\d+)/.exec(l);
        return m !== null && Number(m[1]) >= min;
      });
    }
    const out: CallRecord[] = [];
    for (const line of this.lines(f.since)) {
      if (line.trim() === "" || !rough.every((k) => k(line))) continue;
      try {
        const rec = JSON.parse(line) as CallRecord;
        if (CallLog.exact(rec, f)) out.push(rec);
      } catch {}
    }
    return out;
  }

  private static exact(rec: CallRecord, f: { tool?: string; ok?: boolean; text?: string; since?: string; min_ms?: number }): boolean {
    if (f.tool !== undefined && rec.tool !== f.tool) return false;
    if (f.ok !== undefined && rec.ok !== f.ok) return false;
    if (f.since !== undefined && rec.ts < f.since) return false;
    if (f.min_ms !== undefined && rec.duration_ms < f.min_ms) return false;
    if (f.text !== undefined && !JSON.stringify(rec).toLowerCase().includes(f.text.toLowerCase())) return false;
    return true;
  }

  /** Generic aggregation: filter, group, count — the retro's query lane. */
  query(q: {
    filter?: { tool?: string; ok?: boolean; since?: string; text?: string; min_ms?: number };
    group_by?: string;
    limit?: number;
    offset?: number;
  }): {
    total: number;
    groups?: Record<string, number>;
    /** SET WHEN NO RECORD CARRIED THE KEY AT ALL. The groups then say
     *  `(none)` and mean "asked for something nobody has", which is a
     *  different answer from "everybody has the same value". */
    group_by_reached_nothing?: string;
    records?: CallRecord[];
    offset?: number;
    older?: number;
  } {
    const dig = (obj: unknown, path: string): unknown =>
      path.split(".").reduce<unknown>((v, k) => (v && typeof v === "object" ? (v as Record<string, unknown>)[k] : undefined), obj);
    const f = q.filter ?? {};
    // AN UNKNOWN KEY INSIDE `filter` ANSWERED INSTEAD OF REFUSING, and a wrong
    // filter reads exactly like a real one. SE-C-101 refuses an unknown
    // argument at the top level of a call; one nested a single level down was
    // dropped in silence, so asking for rejected records by a key this filter
    // does not have returned every record and looked like the truth.
    const FILTER_KEYS = ["tool", "ok", "since", "text", "min_ms"];
    const unknown = Object.keys(f).filter((k) => !FILTER_KEYS.includes(k));
    if (unknown.length > 0) {
      throw new Rejection({
        clause: CLAUSES.UNKNOWN_ARGS,
        expected: `filter keys from: ${FILTER_KEYS.join(", ")}`,
        got: unknown.join(", "),
        remedy: {
          tool: "se_log_query",
          args: { filter: { ok: false } },
          note: "ok: false is how you ask for refusals; a refusal's clause is a group_by, never a filter",
        },
        source: "engine/calllog.ts query",
      });
    }
    // `clause` IS THE WORD A READER USES, and the value lives one level down in
    // a rejected record's response. The retro's own step asks for refusal
    // clauses by frequency and names this verb for it, so the word it asks with
    // has to reach the value — grouping by `clause` used to put every record
    // under `(none)`.
    const groupBy = q.group_by === "clause" ? "response.clause" : q.group_by;
    // since: "last_retro" — the newest judgment drain marks the previous
    // retro; the retro mines only its own period (the raw log is kept,
    // owner ruling: forever-until-1GB).
    const since = f.since === "last_retro" ? this.lastRetroMark() : f.since;
    const records = this.filtered({ tool: f.tool, ok: f.ok, text: f.text, since, min_ms: f.min_ms });
    if (groupBy !== undefined) {
      const groups: Record<string, number> = {};
      let reached = 0;
      for (const r of records) {
        const raw = dig(r, groupBy);
        if (raw !== undefined && raw !== null) reached++;
        const key = String(raw ?? "(none)");
        groups[key] = (groups[key] ?? 0) + 1;
      }
      // A KEY NOTHING CARRIES AND A KEY EVERYTHING SHARES LOOK IDENTICAL from
      // the groups alone: both are one bucket. This iteration read one as
      // evidence of the other, so the answer now says which it is rather than
      // leaving a reader to infer it — uc-attribute-a-finished-walk ext 2a.
      return {
        total: records.length,
        groups,
        ...(records.length > 0 && reached === 0 ? { group_by_reached_nothing: groupBy } : {}),
      };
    }
    // NEWEST FIRST, PAGED BACKWARDS. offset 0 is the newest page; offset 20
    // is the twenty before those. A window with no way to ask for the next
    // one is not a door onto the log — a fifty-record answer once blew the
    // token ceiling and was saved where the lane could not read it.
    //
    // `older` says how many remain behind this window, so a caller never has
    // to guess whether it saw everything.
    const limit = q.limit ?? 20;
    const offset = Math.max(0, q.offset ?? 0);
    const end = Math.max(0, records.length - offset);
    const start = Math.max(0, end - limit);
    return { total: records.length, offset, older: start, records: records.slice(start, end) };
  }

  /** see dsp-call-log.md#the-last-session */
  private tailRecords(tailLines: number): CallRecord[] {
    if (!existsSync(this.path)) return [];
    const lines = stripBom(readFileSync(this.path, "utf8")).split("\n");
    const out: CallRecord[] = [];
    for (let i = lines.length - 1; i >= 0 && out.length < tailLines; i--) {
      if (lines[i].trim() === "") continue;
      try {
        out.push(JSON.parse(lines[i]) as CallRecord);
      } catch {
        // a torn last line is normal on a killed process
      }
    }
    return out.reverse();
  }

  /** THE SITTING BEFORE THIS ONE. Walk back over the current run, then over
   *  the one before it — the second is what the reader wants, the first is
   *  their own and they were there for it. */
  private previousRun(tail: CallRecord[], gapMs: number): CallRecord[] {
    if (tail.length === 0) return [];
    const startOfRun = (endIdx: number): number => {
      let i = endIdx;
      while (i > 0 && Date.parse(tail[i].ts) - Date.parse(tail[i - 1].ts) < gapMs) i--;
      return i;
    };
    const currentFrom = startOfRun(tail.length - 1);
    if (currentFrom === 0) return []; // nothing older is in view
    const prevTo = currentFrom - 1;
    return tail.slice(startOfRun(prevTo), prevTo + 1);
  }

  /** WHAT WENT WRONG, AND WHERE IT STOPPED. Clause counts make a repeated
   *  refusal visible at a glance — the same one firing twenty times is a
   *  design problem, not twenty accidents. */
  private static verdicts(run: CallRecord[]): { refusals: Record<string, number>; ended?: string } {
    const refusals: Record<string, number> = {};
    let ended: string | undefined;
    for (const r of run) {
      const res = r.response as Record<string, unknown> | null | undefined;
      if (typeof res !== "object" || res === null) continue;
      if (!r.ok && typeof res.clause === "string") refusals[res.clause] = (refusals[res.clause] ?? 0) + 1;
      // A pull carries the position, so the last one is where the person
      // walked away from.
      if (Array.isArray(res.where) && res.where.length > 0) ended = res.where.join(", ");
    }
    return { refusals, ...(ended !== undefined ? { ended } : {}) };
  }

  /** WHAT WAS CAPTURED AND WHAT WAS ANSWERED. Both outlive the session in
   *  their own stores; listing them here is a pointer, not a copy. */
  private static captured(run: CallRecord[]): { notes: string[]; answers: string[] } {
    const notes: string[] = [];
    const answers: string[] = [];
    for (const r of run) {
      if (!r.ok) continue;
      const a = r.args as { title?: unknown; question?: unknown };
      if (r.tool === "se_note" && typeof a.title === "string") notes.push(a.title);
      if (r.tool === "se_answer" && typeof a.question === "string") answers.push(a.question);
    }
    return { notes, answers };
  }

  lastSession(opts: { gapMinutes?: number; tailLines?: number } = {}): LastSession | undefined {
    const run = this.previousRun(this.tailRecords(opts.tailLines ?? 4000), (opts.gapMinutes ?? 45) * 60_000);
    if (run.length === 0) return undefined;
    const { refusals, ended } = CallLog.verdicts(run);
    const { notes, answers } = CallLog.captured(run);
    return {
      from: run[0].ts,
      to: run[run.length - 1].ts,
      calls: run.length,
      ...(ended !== undefined ? { ended_at: ended } : {}),
      ...(Object.keys(refusals).length > 0 ? { refusals } : {}),
      ...(notes.length > 0 ? { notes } : {}),
      ...(answers.length > 0 ? { answers } : {}),
    };
  }

  /** ~1 GB: surface a cleanup decision, never auto-delete (owner ruling, v2). */
  cleanupDue(): boolean {
    return existsSync(this.path) && statSync(this.path).size >= GB;
  }
}

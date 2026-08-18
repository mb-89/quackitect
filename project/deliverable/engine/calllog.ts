// The call log — harvested from v2 (§9: log everything raw; derive at read
// time). Every dispatch through the single MCP path lands here: tool, args,
// verdict, duration. se_run responses are logged IN FULL under their ref so
// a run is citable evidence. Machine-local (.se/), never committed.

import { randomBytes } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { stripBom } from "./jsonio.ts";

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

/** How often the size is checked. A stat is cheap; a stat per append is
 *  still a syscall on the hot path for nothing. */
const STAT_EVERY = 50;

export class CallLog {
  readonly path: string;
  private sinceStat = STAT_EVERY;

  constructor(seDir: string) {
    this.path = join(seDir, "calls.jsonl");
  }

  append(entry: Omit<CallRecord, "ref" | "ts" | "se_version">): CallRecord {
    const rec: CallRecord = {
      ref: `call-${randomBytes(6).toString("hex")}`,
      ts: new Date().toISOString(),
      se_version: SE_VERSION,
      ...entry,
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
    const read = (p: string): string[] => (existsSync(p) ? stripBom(readFileSync(p, "utf8")).split("\n") : []);
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
   *  refused, so the newest of those marks a retro; any drain is the
   *  fallback for logs written before that rule. */
  private lastRetroMark(): string | undefined {
    let judged: string | undefined;
    let any: string | undefined;
    // No `since` to hand it: a drain older than the live file is a retro that
    // ended before the rotation, and the window opening at the live file's
    // start is the honest answer rather than a scan of every archive.
    for (const line of this.lines()) {
      if (!line.includes('"se_note_drain"')) continue;
      try {
        const rec = JSON.parse(line) as CallRecord;
        if (rec.tool !== "se_note_drain" || !rec.ok) continue;
        any = rec.ts;
        const d = String((rec.args as { disposition?: unknown }).disposition ?? "");
        if (d === "carried" || d === "backlog") judged = rec.ts;
      } catch {}
    }
    return judged ?? any;
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
  }): { total: number; groups?: Record<string, number>; records?: CallRecord[]; offset?: number; older?: number } {
    const dig = (obj: unknown, path: string): unknown =>
      path.split(".").reduce<unknown>((v, k) => (v && typeof v === "object" ? (v as Record<string, unknown>)[k] : undefined), obj);
    const f = q.filter ?? {};
    // since: "last_retro" — the newest judgment drain marks the previous
    // retro; the retro mines only its own period (the raw log is kept,
    // owner ruling: forever-until-1GB).
    const since = f.since === "last_retro" ? this.lastRetroMark() : f.since;
    const records = this.filtered({ tool: f.tool, ok: f.ok, text: f.text, since, min_ms: f.min_ms });
    if (q.group_by !== undefined) {
      const groups: Record<string, number> = {};
      for (const r of records) {
        const key = String(dig(r, q.group_by) ?? "(none)");
        groups[key] = (groups[key] ?? 0) + 1;
      }
      return { total: records.length, groups };
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

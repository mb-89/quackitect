// The call log — harvested from v2 (§9: log everything raw; derive at read
// time). Every dispatch through the single MCP path lands here: tool, args,
// verdict, duration. se_run responses are logged IN FULL under their ref so
// a run is citable evidence. Machine-local (.se/), never committed.

import { randomBytes } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
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

const SE_VERSION = "3.0.0-bootstrap";
const GB = 1024 * 1024 * 1024;

export class CallLog {
  readonly path: string;

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
    return rec;
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
    if (!existsSync(this.path)) return undefined;
    const lines = stripBom(readFileSync(this.path, "utf8")).split("\n");
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

  private records(): CallRecord[] {
    if (!existsSync(this.path)) return [];
    const out: CallRecord[] = [];
    for (const line of stripBom(readFileSync(this.path, "utf8")).split("\n")) {
      if (line.trim() === "") continue;
      try {
        out.push(JSON.parse(line) as CallRecord);
      } catch {}
    }
    return out;
  }

  /** Generic aggregation: filter, group, count — the retro's query lane. */
  query(q: {
    filter?: { tool?: string; ok?: boolean; since?: string; text?: string };
    group_by?: string;
    limit?: number;
    offset?: number;
  }): { total: number; groups?: Record<string, number>; records?: CallRecord[]; offset?: number; older?: number } {
    const dig = (obj: unknown, path: string): unknown =>
      path.split(".").reduce<unknown>((v, k) => (v && typeof v === "object" ? (v as Record<string, unknown>)[k] : undefined), obj);
    const all = this.records();
    const f = q.filter ?? {};
    // since: "last_retro" — the newest drain call marks the previous retro;
    // the retro mines only its own period (the raw log is kept, owner
    // ruling: forever-until-1GB, a garbage collector may harvest later).
    // It used to mean the newest drain of ANY kind, and e22 broke that by
    // letting the FRONT DESK drain too: a desk drain minutes ago handed the
    // retro a window far too short, and nothing said so (found live
    // 2026-07-29). carried and backlog are JUDGMENT dispositions and the desk
    // is refused them, so the newest of those marks a retro and nothing else
    // can. Any drain is still the fallback, for logs written before this.
    let since = f.since;
    if (since === "last_retro") {
      const drains = all.filter((r) => r.tool === "se_note_drain" && r.ok);
      const judged = drains.filter((r) => {
        const d = String((r.args as { disposition?: unknown }).disposition ?? "");
        return d === "carried" || d === "backlog";
      });
      const marks = judged.length > 0 ? judged : drains;
      since = marks.length > 0 ? marks[marks.length - 1].ts : undefined;
    }
    const records = all.filter((rec) => {
      if (f.tool !== undefined && rec.tool !== f.tool) return false;
      if (f.ok !== undefined && rec.ok !== f.ok) return false;
      if (since !== undefined && rec.ts < since) return false;
      // TEXT narrows before the window does. Scanning fifty whole records to
      // find one topic is the wrong shape when a substring match would do,
      // and it is what pushed a query past the token ceiling.
      if (f.text !== undefined && !JSON.stringify(rec).toLowerCase().includes(f.text.toLowerCase())) return false;
      return true;
    });
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

  /** ~1 GB: surface a cleanup decision, never auto-delete (owner ruling, v2). */
  cleanupDue(): boolean {
    return existsSync(this.path) && statSync(this.path).size >= GB;
  }
}

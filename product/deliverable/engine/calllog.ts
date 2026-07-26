// The call log — harvested from v2 (§9: log everything raw; derive at read
// time). Every dispatch through the single MCP path lands here: tool, args,
// verdict, duration. se_run responses are logged IN FULL under their ref so
// a run is citable evidence. Machine-local (.se/), never committed.
import { appendFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";
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
    appendFileSync(this.path, JSON.stringify(rec) + "\n", "utf8");
    return rec;
  }

  find(ref: string): CallRecord | undefined {
    for (const rec of this.records()) if (rec.ref === ref) return rec;
    return undefined;
  }

  private records(): CallRecord[] {
    if (!existsSync(this.path)) return [];
    const out: CallRecord[] = [];
    for (const line of stripBom(readFileSync(this.path, "utf8")).split("\n")) {
      if (line.trim() === "") continue;
      try {
        out.push(JSON.parse(line) as CallRecord);
      } catch {
        continue;
      }
    }
    return out;
  }

  /** Generic aggregation: filter, group, count — the retro's query lane. */
  query(q: {
    filter?: { tool?: string; ok?: boolean; since?: string };
    group_by?: string;
    limit?: number;
  }): { total: number; groups?: Record<string, number>; records?: CallRecord[] } {
    const dig = (obj: unknown, path: string): unknown =>
      path.split(".").reduce<unknown>((v, k) => (v && typeof v === "object" ? (v as Record<string, unknown>)[k] : undefined), obj);
    const records = this.records().filter((rec) => {
      const f = q.filter ?? {};
      if (f.tool !== undefined && rec.tool !== f.tool) return false;
      if (f.ok !== undefined && rec.ok !== f.ok) return false;
      if (f.since !== undefined && rec.ts < f.since) return false;
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
    return { total: records.length, records: records.slice(-(q.limit ?? 20)) };
  }

  /** ~1 GB: surface a cleanup decision, never auto-delete (owner ruling, v2). */
  cleanupDue(): boolean {
    return existsSync(this.path) && statSync(this.path).size >= GB;
  }
}

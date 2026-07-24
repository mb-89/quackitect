// The call log (§9 tier 3; ruled 2026-07-22: raw, forever-until-1GB).
// Machine-local under .se/ — never in the ledger. Evidence pinning (G2)
// copies referenced records onto the branch, so they survive cleanup.
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
  /** For se.run: command, exit code, captured output (raw — log everything). */
  detail?: Record<string, unknown>;
  se_version: string;
  duration_ms: number;
}

const SE_VERSION = "2.0.0-bootstrap";
const GB = 1024 * 1024 * 1024;

export class CallLog {
  readonly path: string;

  constructor(seDir: string) {
    this.path = join(seDir, "calls.jsonl");
  }

  append(entry: Omit<CallRecord, "ref" | "ts" | "se_version"> & { ref?: string }): CallRecord {
    const rec: CallRecord = {
      ref: `run-${randomBytes(6).toString("hex")}`,
      ts: new Date().toISOString(),
      se_version: SE_VERSION,
      ...entry,
    };
    mkdirSync(dirname(this.path), { recursive: true });
    appendFileSync(this.path, JSON.stringify(rec) + "\n", "utf8");
    return rec;
  }

  /** One line per failed dispatch, clause and reason recoverable by the retro. */
  appendFailure(e: { tool: string; args: Record<string, unknown>; duration_ms: number; clause: string; reason: string }): CallRecord {
    return this.append({
      tool: e.tool,
      args: e.args,
      ok: false,
      duration_ms: e.duration_ms,
      detail: { outcome: "rejected", clause: e.clause, reason: e.reason },
    });
  }

  /** Look a record up by ref (evidence pinning reads through this). */
  find(ref: string): CallRecord | undefined {
    if (!existsSync(this.path)) return undefined;
    for (const line of stripBom(readFileSync(this.path, "utf8")).split("\n")) {
      if (line.trim() === "") continue;
      const rec = JSON.parse(line) as CallRecord;
      if (rec.ref === ref) return rec;
    }
    return undefined;
  }

  /** Generic aggregation: filter, group, count — the retro's query lane. */
  query(q: {
    filter?: { tool?: string; ok?: boolean; since?: string; clause?: string };
    group_by?: string;
    limit?: number;
  }): { total: number; groups?: Record<string, number>; records?: CallRecord[] } {
    if (!existsSync(this.path)) return { total: 0 };
    const dig = (obj: unknown, path: string): unknown =>
      path.split(".").reduce<unknown>((v, k) => (v && typeof v === "object" ? (v as Record<string, unknown>)[k] : undefined), obj);
    const records: CallRecord[] = [];
    for (const line of stripBom(readFileSync(this.path, "utf8")).split("\n")) {
      if (line.trim() === "") continue;
      let rec: CallRecord;
      try {
        rec = JSON.parse(line) as CallRecord;
      } catch {
        continue;
      }
      const f = q.filter ?? {};
      if (f.tool !== undefined && rec.tool !== f.tool) continue;
      if (f.ok !== undefined && rec.ok !== f.ok) continue;
      if (f.since !== undefined && rec.ts < f.since) continue;
      if (f.clause !== undefined && dig(rec, "detail.clause") !== f.clause) continue;
      records.push(rec);
    }
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

  /** ~1 GB: surface a cleanup decision, never auto-delete (owner ruling). */
  cleanupDue(): boolean {
    return existsSync(this.path) && statSync(this.path).size >= GB;
  }

  /**
   * ETA calibration: every toll update's claimed ETA against the time the
   * next submit actually landed. Dirty early formats parse where they can
   * and are skipped where they cannot — an honest sample beats a guessed one.
   */
  calibration(): { count: number; median_ratio: number | null; samples: CalibrationSample[] } {
    if (!existsSync(this.path)) return { count: 0, median_ratio: null, samples: [] };
    const records: CallRecord[] = [];
    for (const line of stripBom(readFileSync(this.path, "utf8")).split("\n")) {
      if (line.trim() === "") continue;
      try {
        records.push(JSON.parse(line) as CallRecord);
      } catch {
        continue;
      }
    }
    const samples: CalibrationSample[] = [];
    for (let i = 0; i < records.length; i++) {
      const u = records[i];
      if (u.tool !== "se.toll.update") continue;
      const eta = String(u.args.eta ?? "");
      const claimed = parseEtaMinutes(eta, u.ts);
      if (claimed === null) continue;
      const done = records.slice(i + 1).find((r) => r.tool === "se_loop_submit" && r.ok);
      if (done === undefined) continue;
      const actual = (new Date(done.ts).getTime() - new Date(u.ts).getTime()) / 60000;
      if (actual <= 0) continue;
      samples.push({
        at: u.ts,
        step: String(u.args.current_step ?? ""),
        eta,
        claimed_min: Math.round(claimed),
        actual_min: Math.round(actual),
        ratio: Math.round((actual / claimed) * 100) / 100,
      });
    }
    const ratios = samples.map((s) => s.ratio).sort((a, b) => a - b);
    const median = ratios.length === 0 ? null : ratios[Math.floor(ratios.length / 2)];
    return { count: samples.length, median_ratio: median, samples: samples.slice(-50) };
  }
}

export interface CalibrationSample {
  at: string;
  step: string;
  eta: string;
  claimed_min: number;
  actual_min: number;
  ratio: number;
}

/** "22:35" (owner-local clock) or "in ~20 min"; anything else is skipped. */
export function parseEtaMinutes(eta: string, fromTs: string): number | null {
  const rel = eta.match(/(\d+)\s*min/i);
  if (rel !== null) return Number(rel[1]);
  const hm = eta.match(/(\d{1,2}):(\d{2})/);
  if (hm === null) return null;
  const from = new Date(fromTs);
  const target = new Date(from);
  target.setHours(Number(hm[1]), Number(hm[2]), 0, 0);
  let diff = (target.getTime() - from.getTime()) / 60000;
  if (diff < -120) diff += 24 * 60; // an ETA just past midnight
  return diff > 0 ? diff : null;
}

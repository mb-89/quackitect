// The call log (§9 tier 3; ruled 2026-07-22: raw, forever-until-1GB).
// Machine-local under .se/ — never in the ledger. Evidence pinning (G2)
// copies referenced records onto the branch, so they survive cleanup.
import { appendFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";

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

  append(entry: Omit<CallRecord, "ref" | "ts" | "se_version">): CallRecord {
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

  /** Look a record up by ref (evidence pinning reads through this). */
  find(ref: string): CallRecord | undefined {
    if (!existsSync(this.path)) return undefined;
    for (const line of readFileSync(this.path, "utf8").split("\n")) {
      if (line.trim() === "") continue;
      const rec = JSON.parse(line) as CallRecord;
      if (rec.ref === ref) return rec;
    }
    return undefined;
  }

  /** ~1 GB: surface a cleanup decision, never auto-delete (owner ruling). */
  cleanupDue(): boolean {
    return existsSync(this.path) && statSync(this.path).size >= GB;
  }
}

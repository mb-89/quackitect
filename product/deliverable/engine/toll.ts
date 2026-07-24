// The update-toll (pillar 3). The server timestamps the agent's last
// update; a tool call arriving more than N minutes after it is refused
// ONCE with the update schema inline — the update rides as a tool argument
// on the corrected call, then the original call proceeds. Works because
// work IS tool calls: an agent physically cannot keep working un-narrated.
//
// Armed only after the first submit (the first call of a session must not
// pay a toll for a session with no history). No narration on the success
// path. Idle-waiting needs no carve-out: no calls, no toll.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { readJsonFile } from "./jsonio.ts";
import { Rejection } from "./errors.ts";
import type { CallLog } from "./calllog.ts";

export interface TollUpdate {
  current_step: string;
  next_milestone: string;
  /** Clock-time ETA, e.g. "14:25" or "in ~20 min". */
  eta: string;
  /** Optional fine-grained task list; "[x] done / [ ] open" per line. The board renders it. */
  todo?: string[];
}

interface TollState {
  armed: boolean;
  last_update_ts: number;
  last_update?: TollUpdate;
}

export const TOLL_UPDATE_SCHEMA = {
  type: "object",
  description: "structured toll update — lands server-side (heartbeat store, board, phone)",
  properties: {
    current_step: { type: "string" },
    next_milestone: { type: "string" },
    eta: { type: "string", description: "clock-time ETA" },
    todo: { type: "array", items: { type: "string" }, description: 'task list, one item per line: "[x] done" / "[ ] open"' },
  },
  required: ["current_step", "next_milestone", "eta", "todo"],
} as const;

// Harnesses that load tool schemas without the (undeclared) update property
// serialize it as a JSON string — accept both forms, or the toll deadlocks
// the whole surface.
function parseUpdate(v: unknown): TollUpdate | undefined {
  if (typeof v === "string") {
    try {
      v = JSON.parse(v);
    } catch {
      return undefined;
    }
  }
  const u = v as TollUpdate | undefined;
  return u && u.current_step && u.next_milestone && u.eta ? u : undefined;
}

export class Toll {
  private path: string;
  private windowMs: number;
  private now: () => number;

  constructor(seDir: string, opts: { windowMs?: number; now?: () => number } = {}) {
    this.path = join(seDir, "toll.json");
    this.windowMs = opts.windowMs ?? 5 * 60 * 1000;
    this.now = opts.now ?? Date.now;
  }

  private load(): TollState {
    if (!existsSync(this.path)) return { armed: false, last_update_ts: 0 };
    return readJsonFile<TollState>(this.path);
  }

  private save(s: TollState): void {
    mkdirSync(dirname(this.path), { recursive: true });
    writeFileSync(this.path, JSON.stringify(s, null, 2) + "\n", "utf8");
  }

  /** Called on the first successful submit of the session. */
  arm(): void {
    const s = this.load();
    if (!s.armed) this.save({ armed: true, last_update_ts: this.now() });
  }

  /**
   * Dispatch guard. Throws the toll refusal when an update is due and the
   * call carries none; records and resets when one rides along.
   */
  check(toolName: string, args: Record<string, unknown>, log: CallLog): void {
    const s = this.load();
    const update = parseUpdate(args.update);
    if (update) {
      log.append({ tool: "se.toll.update", args: { via: toolName, ...update }, ok: true, duration_ms: 0 });
      this.save({ ...s, armed: true, last_update_ts: this.now(), last_update: update });
      return;
    }
    if (toolName === "se_loop_submit") {
      throw new Rejection({
        clause: "SE-C-046",
        expected: "an update riding every se_loop_submit — a submit is a step boundary",
        got: "submit without an update",
        remedy: {
          tool: toolName,
          args: {
            ...args,
            update: {
              current_step: "<what this submit closes>",
              next_milestone: "<next visible result>",
              eta: "<clock time>",
              todo: ["[x] <a finished task>", "[ ] <the task in progress>"],
            },
          },
          note: "resend with the update field — volunteered updates are never stopped",
        },
        source: "engine/toll.ts check",
      });
    }
    if (!s.armed) return;
    if (this.now() - s.last_update_ts <= this.windowMs) return;
    throw new Rejection({
      clause: "SE-C-040",
      expected: `an update within ${Math.round(this.windowMs / 60000)} min of the last (schema inline in remedy.args.update)`,
      got: `last update ${Math.round((this.now() - s.last_update_ts) / 60000)} min ago`,
      remedy: {
        tool: toolName,
        args: {
          ...args,
          update: {
            current_step: "<what you are doing now>",
            next_milestone: "<next visible result>",
            eta: "<clock time>",
            todo: ["[x] <a finished task>", "[ ] <the task in progress>", "[ ] <a task still open>"],
          },
        },
        note: "pay the toll by resending THIS call with the update field filled — it proceeds immediately",
      },
      source: "engine/toll.ts check",
    });
  }
}

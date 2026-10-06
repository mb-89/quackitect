// THE TRANSCRIPT READS. What the bridgehead hands the door off the session's own rows, and a stream chunk's text. The door trims the rows itself (transcribed in src/modules/hooks/fold.go). The bridgehead reads the rows, since the loader follows $ into no import. [[spec/tickets/a-reply-follows-its-prompt]] [[spec/tickets/level0-hooks-hold-no-rule]]

import type { SessionMessage, TurnStepChunk } from "claude-code";
import type { Fields } from "./shape.ts";

// A transcript row as the engine hands it, carrying an id or a uuid besides where it has one. [[spec/tickets/a-reply-follows-its-prompt]]
type Row =
  | (Partial<Pick<SessionMessage, "role" | "text" | "toolResults">> & {
      readonly id?: unknown;
      readonly uuid?: unknown;
    })
  | null
  | undefined;

// The characters of rows a post carries, which keeps it under the door's body cap (bodyCap in src/modules/hooks/hooks.go) at three bytes a character. [[spec/tickets/level0-hooks-hold-no-rule]]
const ROOM = 1 << 18;

// The newest rows as the engine hands them, oldest first, as many as the post holds. A nested list rides as its count, because the tool bodies inside it run past the post's cap. [[spec/tickets/level0-hooks-hold-no-rule]]
export function rawRows(rows: unknown): Fields[] {
  const list: readonly unknown[] = Array.isArray(rows) ? rows : [];
  const out: Fields[] = [];
  let size = 0;
  for (let at = list.length - 1; at >= 0; at--) {
    const row = bare(list[at]);
    size += JSON.stringify(row).length;
    if (size > ROOM) break;
    out.unshift(row);
  }
  return out;
}

function bare(row: unknown): Fields {
  const out: Fields = {};
  if (!row || typeof row !== "object") return out;
  for (const [key, value] of Object.entries(row)) {
    if (Array.isArray(value)) out[key] = value.length;
    else if (value === null || typeof value !== "object") out[key] = value;
  }
  return out;
}

// THE OLD DOOR'S TRIM. A door whose standing file names no raw reads these trimmed fields alone, so the bridgehead sends them until that door restarts on the binary that trims. Delete textsOf, rowOf, beforeIn, TEXTS and ROWS once no such door runs. [[spec/tickets/level0-hooks-hold-no-rule]]
const TEXTS = 4;
const ROWS = 64;

// The agent's last texts, oldest first, and the newest rows as the old door reads them. [[spec/tickets/a-reply-follows-its-prompt]]
export function textsOf(rows: unknown): {
  texts: string[];
  rows: Fields[];
} {
  const list: readonly Row[] = Array.isArray(rows) ? rows : [];
  const out: string[] = [];
  for (let at = list.length - 1; at >= 0 && out.length < TEXTS; at--) {
    const said = String(list[at]?.text ?? "").trim();
    if (list[at]?.role === "assistant" && said) out.unshift(said);
  }
  return { texts: out, rows: list.slice(-ROWS).map(rowOf) };
}

// A row as the old door reads it: its role, its id where it carries one, and its text where the agent wrote it. [[spec/tickets/a-reply-follows-its-prompt]]
export function rowOf(row: Row): Fields {
  const id = row?.id ?? row?.uuid;
  return {
    role: String(row?.role ?? ""),
    ...(id ? { id: String(id) } : {}),
    ...((row?.toolResults ?? []).length ? { results: true } : {}),
    ...(row?.role === "assistant" ? { text: String(row?.text ?? "").trim() } : {}),
  };
}

// The prompt carries the id of the newest transcript row, so the old door keys on it. [[spec/tickets/a-reply-follows-its-prompt]]
export function beforeIn(
  e: Readonly<Fields>,
  rows: readonly Row[] | null | undefined,
): Readonly<Fields> {
  const id = rows?.at(-1)?.id ?? rows?.at(-1)?.uuid;
  return id ? { ...e, before: String(id) } : e;
}

// [[spec/tickets/a-reply-follows-its-prompt]]
export function textOf(chunk: TurnStepChunk | null | undefined): string {
  if (!chunk || typeof chunk !== "object" || chunk.kind !== "text") return "";
  return typeof chunk.text === "string" ? chunk.text : "";
}

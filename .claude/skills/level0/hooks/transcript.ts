// THE TRANSCRIPT READS. What the bridgehead hands the door off the session's own rows, and a stream chunk's text. The door trims the rows itself (transcribed in src/modules/hooks/fold.go). The bridgehead reads the rows, since the loader follows $ into no import. [[spec/tickets/a-reply-follows-its-prompt]] [[spec/tickets/level0-hooks-hold-no-rule]]

import type { TurnStepChunk } from "claude-code";
import type { Fields } from "./shape.ts";

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

// [[spec/tickets/a-reply-follows-its-prompt]]
export function textOf(chunk: TurnStepChunk | null | undefined): string {
  if (!chunk || typeof chunk !== "object" || chunk.kind !== "text") return "";
  return typeof chunk.text === "string" ? chunk.text : "";
}

// The server's log. One function writes a line: a level, a source, a short
// line and details, and the log stamps the time itself. The log understands
// the foreign objects the server hands it, an event and its answer, and turns
// them into a line with the fields worth a glance beside the whole event.
// [[spec/design_output/log#what-one-line-looks-like]]

import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { rowOf, SESSION } from "../../.claude/skills/level0/lib/log.js";

// The fields of an event worth a glance on the row.
const GLANCE = [
  "tool",
  "agentId",
  "tool_use_id",
  "file_path",
  "command",
  "reason",
  "turnId",
  "index",
  "model",
  "name",
  "trigger",
];

export function logHere(root) {
  const path = join(root, SESSION);
  mkdirSync(dirname(path), { recursive: true });

  const say = (level, kind, said, more = {}) => {
    const row = rowOf(new Date().toISOString(), level, kind, said, more);
    appendFileSync(path, `${JSON.stringify(row)}\n`);
    return row;
  };

  return {
    path,
    say,
    // An event and its answer, as one debug line.
    event: (said, answer) => say("debug", "hook", headOf(said), fieldsOf(said, answer)),
  };
}

function glanceOf(e) {
  const out = {};
  for (const key of GLANCE) {
    const value = e?.[key];
    if (value !== undefined && value !== null && typeof value !== "object") out[key] = String(value);
  }
  return out;
}

function headOf(said) {
  const glance = glanceOf(said?.e);
  const aim = glance.file_path ?? glance.command ?? glance.reason ?? "";
  return [
    String(said?.event ?? "event"),
    glance.tool,
    glance.agentId ? `agent=${glance.agentId}` : "",
    aim,
  ]
    .filter(Boolean)
    .join(" ");
}

function fieldsOf(said, answer) {
  const e = said?.e;
  const text = typeof e?.text === "string" ? e.text : typeof e?.answer === "string" ? e.answer : "";
  return {
    event: String(said?.event ?? "event"),
    ...glanceOf(e),
    ...(said?.origin?.kind ? { origin: String(said.origin.kind) } : {}),
    ...(text ? { chars: String(text.length) } : {}),
    answer: JSON.stringify(answer),
    text: JSON.stringify({ e: e ?? null, origin: said?.origin ?? null }, null, 1),
  };
}

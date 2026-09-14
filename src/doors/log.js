// The log. One file, .se/log/session.jsonl, holds the session, one JSON object
// per line, and this door appends to it. The level this box writes at decides
// which line reaches the file. The log stamps its own time, and it understands
// the foreign objects a writer hands it: an event and its answer become one
// line with the fields worth a glance beside the whole event.
// [[spec/design_output/log#every-writer-appends]]

import { rowOf, SESSION, writes } from "../../.claude/skills/level0/lib/log.js";

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

export function log(disk, clock, init = {}) {
  const folder = init.folder ?? SESSION.slice(0, SESSION.lastIndexOf("/"));
  const path = `${folder}/${SESSION.slice(SESSION.lastIndexOf("/") + 1)}`;
  const rows = [];
  let made = false;

  const say = async (level, kind, said, more) => {
    const row = rowOf(clock.stamp(), level, kind, said, more);
    if (!writes(init.level, row.level)) return row;
    rows.push(row);
    if (!made) {
      await disk.makeDir(folder);
      made = true;
    }
    await disk.append(path, `${JSON.stringify(row)}\n`);
    return row;
  };

  return {
    path,
    lines: () => rows.map((one) => ({ ...one })),
    say,
    // [[spec/design_output/level0#the-bridgehead-and-the-server]]
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

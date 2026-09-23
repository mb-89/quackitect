// The log. This door appends one JSON object per line to the session file,
// and the level this box writes at decides which line reaches it.
// [[spec/design_output/log#every-writer-appends]]

import { rowOf, SESSION, writes } from "../../.claude/skills/level0/lib/log.js";

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

// The level is a name or a function answering one, so a box reads the config as it runs. The door keeps a row in memory only where `keep` asks, as the fake does, so a server writes a row and forgets it. [[spec/design_output/log#what-a-box-writes]]
export function log(disk, clock, init = {}) {
  const folder = init.folder ?? SESSION.slice(0, SESSION.lastIndexOf("/"));
  const path = `${folder}/${SESSION.slice(SESSION.lastIndexOf("/") + 1)}`;
  const rows = [];
  const levelOf = typeof init.level === "function" ? init.level : () => init.level;
  let made = false;

  const say = async (level, kind, said, more) => {
    const row = rowOf(clock.stamp(), level, kind, said, more);
    if (!writes(levelOf(), row.level)) return row;
    if (init.keep) rows.push(row);
    if (!made) {
      await disk.makeDir(folder);
      made = true;
    }
    const line = `${JSON.stringify(row)}\n`;
    try {
      await disk.append(path, line);
    } catch {
      // A retro's collect drains the folder under a running writer, so the writer makes it again. [[spec/design_output/log#every-writer-appends]]
      await disk.makeDir(folder);
      await disk.append(path, line);
    }
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
    if (value !== undefined && value !== null && typeof value !== "object")
      out[key] = String(value);
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
  const text =
    typeof e?.text === "string"
      ? e.text
      : typeof e?.answer === "string"
        ? e.answer
        : "";
  return {
    event: String(said?.event ?? "event"),
    ...glanceOf(e),
    ...(said?.origin?.kind ? { origin: String(said.origin.kind) } : {}),
    ...(text ? { chars: String(text.length) } : {}),
    answer: JSON.stringify(answer),
    text: JSON.stringify({ e: e ?? null, origin: said?.origin ?? null }, null, 1),
  };
}

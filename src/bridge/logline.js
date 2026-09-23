// The log tool. The agent writes one line of its own into the session log, the
// one the owner reads in the viewer, and the box stamps and levels it.
// [[spec/design_output/log#the-log-tool]]

import { LEVELS, LOG_TOOL, logSpec } from "../../.claude/skills/level0/lib/log.js";

export const LOG_CALL = `mcp__level0__${LOG_TOOL}`;

export const SPECS = () => [logSpec()];
export const TOOLS = { [LOG_CALL]: writesLine };

// [[spec/design_output/log#the-log-tool]]
async function writesLine(e, box) {
  const kind = String(e?.kind ?? "").trim();
  const said = String(e?.said ?? "").trim();
  if (!kind || !said) {
    return { result: { result: `${LOG_TOOL} takes a kind and one sentence.` } };
  }
  const level = LEVELS.includes(String(e?.level)) ? String(e.level) : "info";
  const text = String(e?.text ?? "").trim();
  await box.log.say(level, kind, said, text ? { text } : {});
  return { result: { result: `The line stands in the log under ${kind}.` } };
}

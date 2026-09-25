// The code door: the formatter applies itself, and a function or a file past
// the size ceiling or a lint row lands with a warning.
// [[spec/design_output/level0#the-formatter-applies-itself]]

import { FILE_RULE, grows } from "../../.claude/skills/level0/lib/size.js";
import { rowOf, warnedNote } from "../../.claude/skills/level0/lib/warnings.js";
import { asks } from "./config.js";

// The levels of a Biome row the Problems panel draws, so the note names each one. [[spec/design_output/level0#the-panel-holds-a-warning]]
const DRAWN = new Set(["error", "warning"]);

export async function codeDoor(e, writing, where, whole, box) {
  // [[spec/design_output/level0#the-size-ceiling]]
  const grown = grows(textAt(box.disk, writing.path), whole, where, {
    function: asks(box, "code.functionLines"),
    file: asks(box, "code.fileLines"),
  });
  if (!box.biome.stands()) return landed(e, writing, whole, grown, where, box);
  let text = whole;
  if (e.tool === "Write") {
    const put = await box.biome.format(text, writing.path);
    if (put.ran) text = put.text;
  }
  const said = await box.biome.lint(text, writing.path);
  const linted = (said.found ?? []).filter((one) => DRAWN.has(String(one?.severity)));
  return landed(e, writing, text, [...grown, ...linted], where, box);
}

// The write lands with the formatted text, and a break of form rides the context and the log. [[spec/design_output/level0#the-panel-holds-a-warning]]
function landed(e, writing, text, found, where, box) {
  const event =
    e.tool === "Write" && text !== writing.text ? { ...e, content: text } : null;
  if (!found.length) return event ? { event } : { pass: true };
  const rows = found.map((one) => ({ ...one, file: one?.file || where }));
  box.log.say("warn", "write", `${rows.length} line(s) stand at warning in ${where}`, {
    file: where,
    rule: rows[0]?.rule,
    tool: String(e.tool),
    detail: rows.map(rowOf).join("\n"),
  });
  const note = [warnedNote(where, rows), cutsOf(where, rows)]
    .filter(Boolean)
    .join("\n");
  return { ...(event ? { event } : {}), after: { context: [note] } };
}

// A warning naming the file ceiling names the verb that cuts the file. [[spec/design_output/level0#the-ceiling-names-the-cut]]
function cutsOf(where, grown) {
  if (!grown.some((one) => one.rule === FILE_RULE)) return "";
  return `To cut ${where}, run ./RUNME.sh split ${where} --to <path> --lines <from>-<to>.`;
}

function textAt(disk, path) {
  try {
    return disk.exists(path) ? String(disk.read(path)) : "";
  } catch {
    return "";
  }
}

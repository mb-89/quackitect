// The code door: the formatter applies itself, and a function or a file past
// the size ceiling comes back refused.
// [[spec/design_output/level0#the-formatter-applies-itself]]

import { FILE_RULE, grows } from "../../.claude/skills/level0/lib/size.js";
import { refusal } from "../../.claude/skills/level0/lib/refuse.js";
import { asks } from "./config.js";
import { splitTicket } from "./split-ticket.js";

export async function codeDoor(e, writing, where, whole, box) {
  // [[spec/design_output/level0#the-size-ceiling]]
  const grown = grows(textAt(box.disk, writing.path), whole, where, {
    function: asks(box, "code.functionLines"),
    file: asks(box, "code.fileLines"),
  });
  if (grown.length) {
    box.log.say("warn", "write", `refused ${grown.length} ceiling(s) in ${where}`, {
      file: where,
      rule: grown[0]?.rule,
      tool: String(e.tool),
    });
    // A file past the file ceiling takes a ticket, so the cut becomes work somebody sees. [[spec/design_output/level0#the-size-ceiling]]
    const minted = grown.some((one) => one.rule === FILE_RULE)
      ? splitTicket(box, where)
      : "";
    return { result: { deny: [refusal(where, grown), minted].filter(Boolean).join("\n") } };
  }
  if (!box.biome.stands()) return { pass: true };
  let text = whole;
  if (e.tool === "Write") {
    const put = await box.biome.format(text, writing.path);
    if (put.ran) text = put.text;
  }
  const said = await box.biome.lint(text, writing.path);
  const found = (said.found ?? []).filter((one) => one.severity === "error");
  if (found.length) {
    box.log.say("warn", "write", `refused ${found.length} line(s) in ${where}`, {
      file: where,
      rule: found[0]?.rule,
      tool: String(e.tool),
    });
    return { result: { deny: refusal(where, found) } };
  }
  if (e.tool === "Write" && text !== writing.text)
    return { event: { ...e, content: text } };
  return { pass: true };
}

function textAt(disk, path) {
  try {
    return disk.exists(path) ? String(disk.read(path)) : "";
  } catch {
    return "";
  }
}

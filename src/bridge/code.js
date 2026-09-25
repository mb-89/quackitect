// The code door: the formatter applies itself, and a function or a file past
// the size ceiling comes back refused.
// [[spec/design_output/level0#the-formatter-applies-itself]]

import { refusal } from "../../.claude/skills/level0/lib/refuse.js";
import { FILE_RULE, grows } from "../../.claude/skills/level0/lib/size.js";
import { asks } from "./config.js";

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
    return {
      result: {
        deny: [refusal(where, grown), cutsOf(where, grown)].filter(Boolean).join("\n"),
      },
    };
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

// A refusal naming the file ceiling names the verb that cuts the file. [[spec/design_output/level0#the-ceiling-names-the-cut]]
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

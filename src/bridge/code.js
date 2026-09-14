// The code door, the other half of the write door. A Write to code goes
// through the formatter first and lands formatted, and the lint refuses an
// error with the reason and the line. An Edit meets the lint over the file
// as it stands after the edit. A box with no Biome lets code through.
// [[spec/design_output/level0#the-formatter-applies-itself]]

import { refusal } from "../../.claude/skills/level0/lib/refuse.js";

export async function codeDoor(e, writing, where, whole, box) {
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
  if (e.tool === "Write" && text !== writing.text) return { event: { ...e, content: text } };
  return { pass: true };
}

// The voice rules over an Ask, at the one moment a hand still writes it: the
// open. The Ask belongs to the engine from there, so a rule broken past this
// point stands until a person reaches for the ticket door.
// [[spec/design_output/pull#a-draft-opens]]

import { CONFIG, faultIn, fromJson } from "../../.claude/skills/level0/lib/vale.js";

export function askFaults(it, path, rows) {
  const text = rows.join("\n");
  if (!it.vale || !text.trim()) return [];
  let ran;
  try {
    ran = it.proc.run(
      [it.vale, `--config=${CONFIG}`, `--path=${path}`, "--output=JSON", "--no-exit"],
      { stdin: text, cwd: it.root },
    );
  } catch {
    return [];
  }
  if (faultIn(ran.stdout)) return [];
  return fromJson(ran.stdout)
    .filter((fault) => fault.severity === "error")
    .map((fault) => `  line ${fault.line} breaks ${fault.rule}: ${fault.message}`);
}

export function askRefusal(said, found) {
  return [
    `${said} holds an Ask that breaks the voice rules, and the Ask is the engine's once it opens:`,
    ...found,
    "",
    "Rewrite the Ask, then open it again.",
  ].join("\n");
}

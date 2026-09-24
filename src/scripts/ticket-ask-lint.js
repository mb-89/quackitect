// The voice rules over an Ask, at the moments a hand still writes it: the open,
// the note and the retro's mint. The Ask belongs to the engine from there, so a
// rule broken past this point stands until a person reaches for the ticket door.
// [[spec/design_output/pull#a-draft-opens]]

import { readNote } from "../../.claude/skills/level0/lib/schema.js";
import { voiceOver } from "../bridge/findings.js";
import { chapterEnd } from "./pull-chapter.js";

const ASK = "ask";
const TOP = 1;

// The whole ticket goes to Vale, and the findings on the Ask's lines stay, so a line number names the file's line. [[spec/design_output/pull#a-draft-opens]]
export function askFaults(it, path, text) {
  const said = String(text ?? "");
  const sections = readNote(said).sections;
  const at = sections.findIndex((one) => one.header.toLowerCase() === ASK);
  if (at < 0) return [];
  const span = {
    first: sections[at].line,
    last: chapterEnd(sections, at, TOP, said.split(/\r?\n/).length),
  };
  return voiceOver(it, path, said, span).map(
    (fault) => `  line ${fault.line} breaks ${fault.rule}: ${fault.message}`,
  );
}

export function askRefusal(said, found) {
  return [
    `${said} holds an Ask that breaks the voice rules, and the Ask is the engine's once it opens:`,
    ...found,
    "",
    "Rewrite the Ask, then open it again.",
  ].join("\n");
}

// A verb that writes the Ask from a hand's line refuses before it writes, so no file stands. [[spec/design_output/pull#a-draft-opens]]
export function lineRefusal(said, found) {
  return [
    `${said} would hold an Ask that breaks the voice rules, so the verb writes nothing:`,
    ...found,
    "",
    "Rewrite the line, then run the verb again.",
  ].join("\n");
}

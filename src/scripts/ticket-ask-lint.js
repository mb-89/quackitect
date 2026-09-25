// The voice rules over an Ask, at the moments a hand still writes it: the open,
// the note and the retro's mint. A break of form warns and the verb goes on,
// and a private name refuses before the Ask becomes the engine's.
// [[spec/design_output/pull#a-draft-opens]]

import { readNote } from "../../.claude/skills/level0/lib/schema.js";
import { formIn, refusesIn } from "../../.claude/skills/level0/lib/warnings.js";
import { voiceOver } from "../bridge/findings.js";
import { chapterEnd } from "./pull-chapter.js";

const ASK = "ask";
const TOP = 1;

// The whole ticket goes to Vale, and the findings on the Ask's lines stay, so a line number names the file's line. The lines that refuse and the lines that warn come back apart. [[spec/design_output/pull#a-draft-opens]]
export function askFaults(it, path, text) {
  const said = String(text ?? "");
  const sections = readNote(said).sections;
  const at = sections.findIndex((one) => one.header.toLowerCase() === ASK);
  if (at < 0) return { refused: [], warned: [] };
  const span = {
    first: sections[at].line,
    last: chapterEnd(sections, at, TOP, said.split(/\r?\n/).length),
  };
  const found = voiceOver(it, path, said, span);
  const row = (fault) => `  line ${fault.line} breaks ${fault.rule}: ${fault.message}`;
  return { refused: refusesIn(found).map(row), warned: formIn(found).map(row) };
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

// A break of form lands with the Ask, and the verb names each line. [[spec/design_output/pull#a-draft-opens]]
export function askWarning(said, found) {
  return [
    `${said} holds an Ask that breaks a rule of form, and it lands. Leave the lines as they stand, and carry on:`,
    ...found,
  ].join("\n");
}

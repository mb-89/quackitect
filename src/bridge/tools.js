// Two tools the agent calls by hand. check_answer reads a draft answer through
// the voice rules and the answer's own rules, in the wording the gate uses, so
// a draft checked here meets the gate clean. mint_note writes a new note in
// the shape its schema names, and the write door reads it before it lands.
// [[spec/design_output/level0#the-tool-reads-a-draft]]

import { join } from "node:path";
import {
  bandOf,
  CHECK,
  checkSpec,
  lengthFaults,
  needsFaults,
  scoreOf,
  tableFaults,
} from "../../.claude/skills/level0/lib/answer.js";
import { answerFindings } from "../../.claude/skills/level0/lib/refuse.js";
import { MINT_TOOL, mintedNote, mintSpec } from "../../.claude/skills/level0/lib/schema.js";
import { asks } from "./config.js";
import { onWrite } from "./write.js";

// The name Vale reads an answer under, so the rules for an answer apply.
const ANSWER = "level0-answer.md";

export const SPECS = (box) => [checkSpec(), mintSpec(box.schemas)];
export const TOOLS = {
  [`mcp__level0__${CHECK}`]: checksAnswer,
  [`mcp__level0__${MINT_TOOL}`]: mintsNote,
};

// [[spec/design_output/level0#the-tool-reads-a-draft]]
async function checksAnswer(e, box) {
  const text = String(e?.text ?? "");
  if (!text.trim()) return { result: { result: `${CHECK} takes the text of one draft.` } };
  if (!box.vale.stands()) return { result: { result: "No vale stands here, so the draft goes unread." } };
  const ran = await box.vale.lint(text, ANSWER);
  if (!ran.ran) return { result: { result: `Vale read nothing: ${ran.why}` } };
  const found = [
    ...tableFaults(text, box.asks ?? 0),
    ...needsFaults(text, Boolean(e?.stop)),
    ...lengthFaults(text, asks(box, "answer.words")),
    ...ran.found,
  ];
  const score = scoreOf(text, found);
  const bands = { warnAt: asks(box, "answer.warnAt"), ceiling: asks(box, "answer.ceiling") };
  const band = found.length ? bandOf(score, bands, found) : "clean";
  box.log.say("info", "answer", `a draft reads ${band}`, { detail: `score=${score} findings=${found.length}` });
  return { result: { result: answerFindings(ANSWER, { found, score, band }) } };
}

// [[spec/design_output/schema#the-tool-writes-the-note]]
async function mintsNote(e, box) {
  const made = mintedNote(box.schemas, e);
  if (made.why) return said(box, false, made.why, e);
  const at = join(box.work, made.path);
  if (box.disk.exists(at)) return said(box, false, `${made.path} stands already. Name a path nothing holds yet.`, e);
  const door = await onWrite({ tool: "Write", file_path: at, content: made.text }, box);
  if (door?.result?.deny) return said(box, false, door.result.deny, e);
  try {
    box.disk.makeDir(join(at, ".."));
    box.disk.write(at, made.text);
  } catch (why) {
    return said(box, false, `${made.path} takes no write: ${String(why?.message ?? why)}`, e);
  }
  return said(box, true, leftIn(made), e);
}

function said(box, ok, result, e) {
  box.log.say(ok ? "info" : "warn", "schema", result.split("\n")[0], { file: String(e?.path ?? ""), tool: MINT_TOOL });
  return { result: { result } };
}

function leftIn(made) {
  const rows = made.left.map((one) => `  ${one.file}:${one.line}:1  ${one.rule}\n    ${one.message}`);
  if (!rows.length) return `${made.path} stands, in the shape ${made.kind} names.`;
  return [
    `${made.path} stands, in the shape ${made.kind} names.`,
    "",
    ...rows,
    "",
    "Edit each one, because the sweep names every placeholder still standing.",
  ].join("\n");
}

// The hand tools: the draft check over an answer, and the mint that writes a
// note under its schema through the write door.
// [[spec/design_output/level0#the-tool-reads-a-draft]]

import { join } from "node:path";
import { CHECK, checkSpec } from "../../.claude/skills/level0/lib/answer.js";
import { answerFindings } from "../../.claude/skills/level0/lib/refuse.js";
import { MINT_TOOL } from "../../.claude/skills/level0/lib/schema.js";
import { mintedNote, mintSpec } from "../../.claude/skills/level0/lib/schema-mint.js";
import { ANSWER, readsAnswer } from "./answer-read.js";
import { onWrite } from "./write.js";

export const SPECS = (box) => [checkSpec(), mintSpec(box.schemas)];
export const TOOLS = {
  [`mcp__level0__${CHECK}`]: checksAnswer,
  [`mcp__level0__${MINT_TOOL}`]: mintsNote,
};

// [[spec/design_output/level0#the-tool-reads-a-draft]]
async function checksAnswer(e, box) {
  const text = String(e?.text ?? "");
  if (!text.trim())
    return { result: { result: `${CHECK} takes the text of one draft.` } };
  const read = await readsAnswer(box, text, e?.stop);
  if (read.why) return { result: { result: read.why } };
  return { result: { result: answerFindings(ANSWER, read) } };
}

// [[spec/design_output/schema#the-tool-writes-the-note]]
async function mintsNote(e, box) {
  const made = mintedNote(box.schemas, e);
  if (made.why) return said(box, false, made.why, e);
  const at = join(box.work, made.path);
  if (box.disk.exists(at))
    return said(
      box,
      false,
      `${made.path} stands already. Name a path nothing holds yet.`,
      e,
    );
  // The write carries the call's hand, as the agent's own write does. [[spec/design_output/level0#the-write-door]]
  const door = await onWrite(
    { tool: "Write", file_path: at, content: made.text, agentId: e?.agentId },
    box,
  );
  if (door?.result?.deny) return said(box, false, door.result.deny, e);
  try {
    box.disk.makeDir(join(at, ".."));
    box.disk.write(at, made.text);
  } catch (why) {
    return said(
      box,
      false,
      `${made.path} takes no write: ${String(why?.message ?? why)}`,
      e,
    );
  }
  return said(box, true, leftIn(made), e);
}

function said(box, ok, result, e) {
  box.log.say(ok ? "info" : "warn", "schema", result.split("\n")[0], {
    file: String(e?.path ?? ""),
    tool: MINT_TOOL,
  });
  return { result: { result } };
}

function leftIn(made) {
  const rows = made.left.map(
    (one) => `  ${one.file}:${one.line}:1  ${one.rule}\n    ${one.message}`,
  );
  if (!rows.length) return `${made.path} stands, in the shape ${made.kind} names.`;
  return [
    `${made.path} stands, in the shape ${made.kind} names.`,
    "",
    ...rows,
    "",
    "Edit each one, because the sweep names every placeholder still standing.",
  ].join("\n");
}

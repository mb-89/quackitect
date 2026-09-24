// The reading of one answer: the draft tool runs it, and the stop door runs it
// over the turn's last text, holding a draft past the ceiling.
// [[spec/design_output/level0#the-gate-reads-the-answer]]

import {
  bandOf,
  lengthFaults,
  needsFaults,
  REWRITE,
  scoreOf,
  tableFaults,
} from "../../.claude/skills/level0/lib/answer.js";
import { answerFindings } from "../../.claude/skills/level0/lib/refuse.js";
import { stopsAlone } from "../../.claude/skills/level0/lib/stop.js";
import { asks } from "./config.js";
import { readsProse } from "./prose.js";

export const ANSWER = "level0-answer.md";
const ENABLED = "answer.enabled";
// The tooth's own limit, so the gate holds no more turns in a row than the tooth does. [[spec/design_output/level0#the-gate-reads-the-answer]]
const MOST = "stop.mostInARow";

// The reading answers why where it reads nothing, and the findings, the score and the band where it reads. [[spec/design_output/level0#the-tool-reads-a-draft]]
export async function readsAnswer(box, text, stop) {
  // The stop line alone ends a turn the answer before it reported, so it reads clean. [[spec/design_output/stop#the-stop-is-one-line]]
  if (stopsAlone(text)) return { found: [], score: 0, band: "clean" };
  if (!box.vale.stands())
    return { why: "No vale stands here, so the draft goes unread." };
  const ran = await box.vale.lint(text, ANSWER);
  if (!ran.ran) return { why: `Vale read nothing: ${ran.why}` };
  const found = [
    ...tableFaults(text, box.asks ?? 0),
    ...needsFaults(text, Boolean(stop)),
    ...lengthFaults(text, asks(box, "answer.words")),
    ...readsProse(box, text, ran.found),
  ];
  const score = scoreOf(text, found);
  const bands = {
    warnAt: asks(box, "answer.warnAt"),
    ceiling: asks(box, "answer.ceiling"),
  };
  const band = found.length ? bandOf(score, bands, found) : "clean";
  // The band tells the owner nothing to act on, so it stands at debug. [[spec/design_output/level0#the-three-bands]]
  box.log.say("debug", "draft", `a draft reads ${band}`, {
    detail: `score=${score} findings=${found.length}`,
  });
  return { found, score, band };
}

// A draft past the ceiling holds the turn with its findings, and the holds in a row stop at the tooth's limit. [[spec/design_output/level0#the-gate-reads-the-answer]]
export async function gatesAnswer(e, box) {
  const text = String(e?.last_assistant_message ?? "");
  if (e?.agentId || !text.trim() || asks(box, ENABLED) === false) return null;
  // The turn's end asks for no needs table, which an answer stopping for the owner carries alone. [[spec/design_output/level0#the-gate-reads-the-answer]]
  const read = await readsAnswer(box, text, false);
  const most = Number(asks(box, MOST) ?? 0);
  if (read.band !== REWRITE || (most > 0 && (box.answerHolds ?? 0) >= most)) {
    box.answerHolds = 0;
    return null;
  }
  box.answerHolds = (box.answerHolds ?? 0) + 1;
  box.log.say("debug", "draft", "the gate holds the turn for a rewrite", {
    detail: `holds=${box.answerHolds} score=${read.score}`,
  });
  return { result: { block: answerFindings(ANSWER, read) } };
}

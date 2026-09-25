// The reading of one answer: the draft tool runs it, and the stop door runs it
// over the turn's last text, so its findings ride the next call.
// [[spec/design_output/level0#the-gate-reads-the-answer]]

import {
  bandOf,
  CARRY,
  lengthFaults,
  needsFaults,
  REWRITE,
  scoreOf,
  tableFaults,
} from "../../.claude/skills/level0/lib/answer.js";
import { gateNote } from "../../.claude/skills/level0/lib/refuse.js";
import { stopsAlone } from "../../.claude/skills/level0/lib/stop.js";
import { rowOf } from "../../.claude/skills/level0/lib/warnings.js";
import { asks } from "./config.js";
import { readsProse } from "./prose.js";

export const ANSWER = "level0-answer.md";
const ENABLED = "answer.enabled";

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

// A break of form in an answer holds no turn: the findings of a draft past the warning edge reach the log, and wait for the next call. [[spec/design_output/level0#the-findings-ride-the-call]]
export async function gatesAnswer(e, box) {
  const text = String(e?.last_assistant_message ?? "");
  if (e?.agentId || !text.trim() || asks(box, ENABLED) === false) return null;
  // The turn's end asks for no needs table, which an answer stopping for the owner carries alone. [[spec/design_output/level0#the-gate-reads-the-answer]]
  const read = await readsAnswer(box, text, false);
  if (read.band !== REWRITE && read.band !== CARRY) return null;
  box.log.say("warn", "gate", `the answer reads ${read.band}, and it stands as sent`, {
    detail: read.found.map((one) => rowOf({ ...one, file: ANSWER })).join("\n"),
  });
  box.answerWaits = gateNote(ANSWER, read);
  return null;
}

// The findings of the last answer ride the next call of the agent's own, once. [[spec/design_output/level0#the-findings-ride-the-call]]
export function answerRides(e, box, before = null) {
  const note = box.answerWaits;
  if (e?.agentId || !note) return before;
  box.answerWaits = "";
  const context = [...(before?.after?.context ?? []), note];
  return { ...(before ?? {}), after: { ...(before?.after ?? {}), context } };
}

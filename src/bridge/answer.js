// The answer door. A prompt or an ask opens a demand for a reply, the first
// call after it passes, and every call after asks the bridgehead for the
// texts until one pays. A helper is untouched.
// [[spec/design_output/level0#the-owners-prompt-comes-first]]

import {
  namesNote,
  newestNote,
  notesIn,
  questionsIn,
} from "../../.claude/skills/level0/lib/answer.js";
import { SAID } from "../../.claude/skills/level0/lib/log.js";

const OWNER = new Set(["composer", "sdk"]);
const REACHES = new Set(["AskUserQuestion", "mcp__level0__report"]);
export const SPOKE = "agent.spoke";

// The owner reads the chat, and the log reads the report, so a mid-turn answer goes to both. [[spec/design_output/level0#the-reply-line]]
export const SAYS = (why) =>
  [
    `${why}, and nothing has answered it. Answer it before the next tool call: write it in the`,
    "chat as text, and call mcp__level0__report with the same text so the log carries it.",
    "Say what you understood and what you do next. Then work.",
  ].join(" ");

export function demands(box, why, block = "", onPaid = null) {
  box.demand = { why, seen: box.spoken ?? "", skips: 1, block, onPaid };
}

// [[spec/design_output/level0#which-prompt-opens-a-turn]]
export function onPromptSubmit(e, box) {
  const from = String(e?.origin?.kind ?? "");
  box.log.say("info", "prompt", String(e?.text ?? ""), {
    detail: from,
    text: String(e?.text ?? ""),
  });
  if (!OWNER.has(from)) return { pass: true };
  demands(box, "The owner sent a prompt");
  // A prompt asking for a note takes a parked note as its answer. [[spec/design_output/level0#a-note-answers-its-prompt]]
  if (namesNote(String(e?.text ?? ""))) box.demand.notes = notesIn(box);
  box.asks = questionsIn(String(e?.text ?? ""));
  return { pass: true };
}

export function onMessageDisplay(e, box) {
  const text = String(e?.delta ?? "").trim();
  if (text) box.spoken = text;
  if (!box.demand || !text || box.demand.fits?.(text)) return { pass: true };
  return paid(box, text);
}

// [[spec/design_output/level0#the-owners-prompt-comes-first]]
export function holdsForAnswer(e, box) {
  const demand = box.demand;
  if (!demand || e?.agentId || REACHES.has(String(e?.tool ?? ""))) return null;
  // [[spec/design_output/level0#a-note-answers-its-prompt]]
  if (demand.notes !== undefined && notesIn(box) > demand.notes) {
    paid(box, newestNote(box));
    return null;
  }
  if (demand.skips > 0) {
    demand.skips -= 1;
    return demand.block ? { after: { context: [demand.block] } } : null;
  }
  return { needs: "reply" };
}

export function onAgentSpoke(e, box) {
  const demand = box.demand;
  if (!demand) return { pass: true };
  const fresh = textsSince(e, demand.seen);
  const fitting = fresh.filter((one) => !demand.fits?.(one));
  if (fitting.length) return paid(box, fitting.at(-1));
  const newest = fresh.at(-1) ?? "";
  const lacks = newest
    ? `${demand.fits(newest)} The last text seen (${newest.length} characters) reads: "${head(newest)}".`
    : `${SAYS(demand.why)} The last text seen stands from before the ask, and reads: "${head(demand.seen)}".`;
  box.log.say("debug", "gate", `refused ${e?.tool ?? "a call"} before a reply`, {
    tool: String(e?.tool ?? ""),
    detail: lacks,
  });
  return { result: { deny: lacks } };
}

function textsSince(e, seen) {
  const texts = [...(Array.isArray(e?.texts) ? e.texts : []), e?.text ?? ""]
    .map((one) => String(one).trim())
    .filter(Boolean);
  const at = texts.lastIndexOf(seen);
  return (at >= 0 ? texts.slice(at + 1) : texts.filter((one) => one !== seen)).filter(
    (one, where, all) => all.indexOf(one) === where,
  );
}

function head(text) {
  return String(text ?? "").replace(/\s+/g, " ").slice(0, SAID);
}

export function pays(box, text) {
  const demand = box.demand;
  if (!demand) {
    box.log.say("info", "reply", text, { text });
    box.spoken = text;
    return "The reply stands in the log. Nothing asked for one, so carry on, and write it in the chat too where the owner reads it.";
  }
  const lacks = demand.fits?.(text) ?? "";
  if (lacks) return lacks;
  paid(box, text);
  return `The reply stands in the log, and it answers: ${demand.why}. Write it in the chat too, as text, and carry on.`;
}

function paid(box, text) {
  const demand = box.demand;
  box.demand = null;
  box.spoken = text;
  box.log.say("info", "reply", text, { text, detail: `answers: ${demand.why}` });
  if (demand.onPaid) demand.onPaid();
  return { pass: true };
}

export function onTurnEnd(e, box) {
  const text = String(e?.answer ?? "").trim();
  const demand = box.demand;
  const answered = e?.reason === "answer" && text;
  if (answered && demand && !demand.fits?.(text)) return paid(box, text);
  if (answered && text !== box.spoken) box.log.say("info", "reply", text, { text });
  if (answered) box.spoken = text;
  if (demand && !demand.fits) box.demand = null;
  return { pass: true };
}

export function holdsTurn(e, box) {
  if (e?.agentId) return { pass: true };
  const demand = box.demand;
  const text = String(e?.last_assistant_message ?? "").trim();
  const lacks = demand?.fits ? demand.fits(text) : "";
  if (!lacks) return { pass: true };
  box.log.say("info", "stop", `the turn holds: ${lacks}`, { detail: demand.why });
  return { result: { block: `${lacks} ${demand.why}, and the turn ends when it stands.` } };
}

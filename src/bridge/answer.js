// The answer door. A prompt from the owner, or an ask from the sidebar, opens
// a demand for a reply in the chat before anything else. The first call after
// it passes, because the reply may stand in that very step and the client
// raises no event for it yet. Every call after that asks the bridgehead for
// the last text the agent wrote, off the transcript: a text new since the
// demand pays it and lands in the log as the reply, and no new text refuses
// the call. A helper is untouched.
// [[spec/design_output/level0#the-owners-prompt-comes-first]]

import { questionsIn } from "../../.claude/skills/level0/lib/answer.js";

const OWNER = new Set(["composer", "sdk"]);
const REACHES = new Set(["AskUserQuestion"]);
export const SPOKE = "agent.spoke";

export const SAYS = (why) =>
  [
    `${why}, and nothing has answered it. Write the reply in the chat, as text,`,
    "before the next tool call: what you understood and what you do next. Then work.",
  ].join(" ");

// A demand: why it stands, the text that stood before it, one free call, and
// what happens the moment it is paid.
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
  box.asks = questionsIn(String(e?.text ?? ""));
  return { pass: true };
}

// The chat itself: a message shown after the demand is the reply.
export function onMessageDisplay(e, box) {
  const text = String(e?.delta ?? "").trim();
  if (text) box.spoken = text;
  if (!box.demand || !text || box.demand.fits?.(text)) return { pass: true };
  return paid(box, text);
}

// The first call passes with the block, the rest ask the bridgehead for the text.
// [[spec/design_output/level0#the-owners-prompt-comes-first]]
export function holdsForAnswer(e, box) {
  const demand = box.demand;
  if (!demand || e?.agentId || REACHES.has(String(e?.tool ?? ""))) return null;
  if (demand.skips > 0) {
    demand.skips -= 1;
    return demand.block ? { after: { context: [demand.block] } } : null;
  }
  return { needs: "reply" };
}

// The bridgehead posts the last text the agent wrote, and the demand is paid or the call refused.
export function onAgentSpoke(e, box) {
  const demand = box.demand;
  const text = String(e?.text ?? "").trim();
  if (!demand) return { pass: true };
  const lacks = text && text !== demand.seen ? (demand.fits?.(text) ?? "") : SAYS(demand.why);
  if (!lacks) return paid(box, text);
  box.log.say("debug", "gate", `refused ${e?.tool ?? "a call"} before a reply`, {
    tool: String(e?.tool ?? ""),
    detail: lacks.slice(0, 120),
  });
  return { result: { deny: lacks } };
}

function paid(box, text) {
  const demand = box.demand;
  box.demand = null;
  box.spoken = text;
  box.log.say("info", "reply", text, { text, detail: `answers: ${demand.why}` });
  if (demand.onPaid) demand.onPaid();
  return { pass: true };
}

// The turn ends: the reply lands in the log once, and a demand still standing
// is paid by it, unless it asks for a shape the answer lacks. That demand stands
// on into the next turn, and the stop door holds the turn where it can.
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

// The stop: a turn whose last message lacks the shape a demand asks for holds,
// and the reason re-prompts the agent. Any other turn ends.
export function holdsTurn(e, box) {
  if (e?.agentId) return { pass: true };
  const demand = box.demand;
  const text = String(e?.last_assistant_message ?? "").trim();
  const lacks = demand?.fits ? demand.fits(text) : "";
  if (!lacks) return { pass: true };
  box.log.say("info", "stop", `the turn holds: ${lacks}`, { detail: demand.why });
  return { result: { block: `${lacks} ${demand.why}, and the turn ends when it stands.` } };
}

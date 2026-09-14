// The answer door. A prompt from the owner opens a demand for a reply in the
// chat. A prompt opening a turn refuses every tool call of the main agent
// until the first message shows, because the client raises a display event
// for that message before the first call. A prompt landing inside a turn
// refuses nothing: the client raises no display event for text written beside
// a tool call until the whole message ends, so the door rides one warning on
// the next call and takes the turn's own text as the reply. A helper is
// untouched, and one kind, reply, names the message that answers the owner.
// [[spec/design_output/level0#the-owners-prompt-comes-first]]

import { questionsIn } from "../../.claude/skills/level0/lib/answer.js";

const OWNER = new Set(["composer", "sdk"]);
const REACHES = new Set(["AskUserQuestion"]);
const WHY = "The owner sent a prompt";

export const SAYS = [
  `${WHY}, and nothing has answered it. Write the reply in the chat, as text,`,
  "before the next tool call: what you understood and what you do next. Then work.",
].join(" ");

export const ASKS = [
  `${WHY} mid-turn. Answer it in your next text: what you understood and what`,
  "you do next. The turn's end takes that text as the reply.",
].join(" ");

// [[spec/design_output/level0#which-prompt-opens-a-turn]]
export function onPromptSubmit(e, box) {
  const from = String(e?.origin?.kind ?? "");
  box.log.say("info", "prompt", String(e?.text ?? ""), { detail: from, text: String(e?.text ?? "") });
  if (!OWNER.has(from)) return { pass: true };
  const inFlight = box.turn ? box.turn.open : true;
  box.demand = { why: WHY, inFlight, warned: false, refused: 0 };
  // The questions the prompt asks, which the draft check and the gate count.
  box.asks = questionsIn(String(e?.text ?? ""));
  return { pass: true };
}

export function onTurnStart(e, box) {
  box.turn = { open: true, id: String(e?.turnId ?? "") };
  return { pass: true };
}

// The chat itself: the first message shown after the prompt is the reply.
export function onMessageDisplay(e, box) {
  const demand = box.demand;
  const text = String(e?.delta ?? "").trim();
  if (!demand || !text) return { pass: true };
  box.demand = null;
  box.log.say("info", "reply", text, { text, detail: `answers: ${demand.why}` });
  return { pass: true };
}

// A refused call is the agent's to read, so the line stands at debug.
// [[spec/design_output/level0#the-owners-prompt-comes-first]]
export function holdsForAnswer(e, box) {
  const demand = box.demand;
  if (!demand || e?.agentId || REACHES.has(String(e?.tool ?? ""))) return null;
  if (demand.inFlight) {
    if (demand.warned) return null;
    demand.warned = true;
    box.log.say("debug", "gate", `asked ${e?.tool ?? "a call"} for a reply mid-turn`, {
      tool: String(e?.tool ?? ""),
      detail: demand.why,
    });
    return { after: { context: [ASKS] } };
  }
  demand.refused += 1;
  box.log.say("debug", "gate", `refused ${e?.tool ?? "a call"} before a reply`, {
    tool: String(e?.tool ?? ""),
    detail: demand.why,
  });
  return { result: { deny: SAYS } };
}

// The turn ends: the reply lands in the log once, and a demand still standing is paid by it.
export function onTurnEnd(e, box) {
  const text = String(e?.answer ?? "").trim();
  if (e?.reason === "answer" && text) {
    box.log.say("info", "reply", text, { text, ...(box.demand ? { detail: `answers: ${box.demand.why}` } : {}) });
  }
  box.demand = null;
  box.turn = { open: false, id: "" };
  return { pass: true };
}

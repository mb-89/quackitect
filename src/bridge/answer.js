// The answer door. A prompt from the owner, at the start of a turn or inside
// one, opens a demand: every tool call of the main agent refuses until a
// message shows in the chat, and the first message shown pays it and lands in
// the log as the answer. A helper is untouched. The turn end pays a demand
// still standing off the turn's own text, so nothing carries over.
// [[spec/design_output/level0#the-owners-prompt-comes-first]]

const OWNER = new Set(["composer", "sdk"]);
const REACHES = new Set(["AskUserQuestion"]);
const WHY = "The owner sent a prompt";

export const SAYS = [
  `${WHY}, and nothing has answered it. Write the answer in the chat, as text,`,
  "before the next tool call: what you understood and what you do next. Then work.",
].join(" ");

// [[spec/design_output/level0#which-prompt-opens-a-turn]]
export function onPromptSubmit(e, box) {
  const from = String(e?.origin?.kind ?? "");
  box.log.say("info", "prompt", String(e?.text ?? ""), { detail: from, text: String(e?.text ?? "") });
  if (OWNER.has(from)) box.demand = { why: WHY, refused: 0 };
  return { pass: true };
}

// The chat itself: the first message shown after the prompt is the answer,
// whatever turn it names, because a prompt landing mid-turn names the turn to
// come and the answer shows under the turn in flight.
export function onMessageDisplay(e, box) {
  const demand = box.demand;
  const text = String(e?.delta ?? "").trim();
  if (!demand || !text) return { pass: true };
  box.demand = null;
  box.log.say("info", "answer", text, { text, detail: demand.why });
  return { pass: true };
}

// A refused call is the agent's to read, so the line stands at debug.
// [[spec/design_output/level0#the-owners-prompt-comes-first]]
export function holdsForAnswer(e, box) {
  const demand = box.demand;
  if (!demand || e?.agentId || REACHES.has(String(e?.tool ?? ""))) return null;
  demand.refused += 1;
  box.log.say("debug", "gate", `refused ${e?.tool ?? "a call"} before an answer`, {
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
  return { pass: true };
}

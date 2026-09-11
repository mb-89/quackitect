// The owner's prompt comes first. This holds the rule the answer door reads:
// which prompts open a turn a person is waiting on, whether the session has
// said anything back since, which call counts as reaching them anyway, and
// what a refusal says.
// [[spec/design_output/level0#the-owners-prompt-comes-first]]

// [[spec/design_output/level0#which-prompt-opens-a-turn]]
const OPENS = new Set([
  "composer",
  "bridge",
  "sdk",
  "scheduled-trigger",
  "slack-ping",
  "channel",
  "auto-continuation",
]);

// [[spec/design_output/level0#where-it-must-not-bite]]
const REACHES = new Set(["AskUserQuestion"]);

// [[spec/design_output/level0#what-the-refusal-says]]
export const SAYS = [
  "The owner asked something and nothing has answered it. Say back what you",
  "understood and what you do next, then work.",
].join("\n");

// [[spec/design_output/level0#one-warning-then-a-refusal]]
export function warns(why) {
  return [
    `${why}, and nothing has answered it yet. Say back what you understood and`,
    "what you do next before the next tool call. Level zero refuses that call",
    "until an answer stands.",
  ].join(" ");
}

// [[spec/design_output/level0#what-the-door-reads]]
export function lastSaid(messages) {
  const rows = Array.isArray(messages) ? messages : [];
  for (let i = rows.length - 1; i >= 0; i--) {
    const text = String(rows[i]?.text ?? "").trim();
    if (rows[i]?.role === "assistant" && text) return text;
  }
  return "";
}

// [[spec/design_output/log#the-answer-under-its-prompt]]
export function answerAfter(messages, seen) {
  const rows = sinceTheOwner(messages);
  const texts = rows.map((one) => String(one?.text ?? "").trim());
  const start = seen ? texts.lastIndexOf(seen) + 1 : 0;
  return rows
    .slice(start)
    .filter((one) => one?.role === "assistant")
    .map((one) => String(one?.text ?? "").trim())
    .filter(Boolean)
    .join("\n\n");
}

function sinceTheOwner(messages) {
  const rows = Array.isArray(messages) ? messages : [];
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i]?.role !== "user") continue;
    if ((rows[i]?.toolResults ?? []).length) continue;
    return rows.slice(i + 1);
  }
  return rows;
}

export function opensATurn(origin) {
  return OPENS.has(String(origin?.kind ?? ""));
}

export function reachesTheOwner(tool) {
  return REACHES.has(String(tool ?? ""));
}

// [[spec/design_output/level0#what-the-door-reads]]
export function spokeSince(messages) {
  return Boolean(answerAfter(messages, ""));
}

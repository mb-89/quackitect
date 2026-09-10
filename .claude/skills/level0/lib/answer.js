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

export function opensATurn(origin) {
  return OPENS.has(String(origin?.kind ?? ""));
}

export function reachesTheOwner(tool) {
  return REACHES.has(String(tool ?? ""));
}

// [[spec/design_output/level0#what-the-door-reads]]
export function spokeSince(messages) {
  const rows = Array.isArray(messages) ? messages : [];
  let from = 0;
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i]?.role !== "user") continue;
    if ((rows[i]?.toolResults ?? []).length) continue;
    from = i + 1;
    break;
  }
  return rows
    .slice(from)
    .some((one) => one?.role === "assistant" && String(one?.text ?? "").trim());
}

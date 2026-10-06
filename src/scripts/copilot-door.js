// Copilot's hook off the hooks door: each Claude call the event stands for
// posts to the door, and its effects answer as Copilot's result.
// [[spec/tickets/copilot-answers-off-the-door]]

import {
  guarded,
  HOOKS_FILE,
  postOf,
  refusedText,
  stepOf,
} from "../../.claude/skills/level0/hooks/cage.ts";
import { callsOf, postedAs } from "../../.claude/skills/level0/lib/copilot.js";

// Copilot calls none of the reads the plugin serves, so every tool call is guarded while the door stands down. [[spec/tickets/a-down-index-refuses-calls]]
const SERVED_READS = [];

// The result a Copilot event answers: the first deny or block a call meets, else the afters joined as context. A door that answers nothing refuses a guarded call and passes the rest. [[spec/tickets/copilot-answers-off-the-door]]
export async function answers(event, it) {
  const posted = postedAs(event.event);
  const calls = posted === "tool.call" ? callsOf(event, (path) => it.read(path)) : [{}];
  const context = [];
  for (const call of calls) {
    const e = { ...call, session_id: event.session };
    const answer = await asked(it, posted, e);
    if (!answer) {
      if (guarded(posted, e, SERVED_READS)) return { deny: refusedText(e) };
      continue;
    }
    const step = stepOf(answer, posted, { asks: false, served: false });
    if (step.answer?.deny) return { deny: String(step.answer.deny) };
    if (step.answer?.block) return { block: String(step.answer.block) };
    context.push(...(step.after ?? []));
  }
  return context.length ? { context: context.join("\n\n") } : {};
}

async function asked(it, event, e) {
  try {
    const post = postOf(JSON.parse(String(it.read(HOOKS_FILE))), event, e, it.root, {});
    const said = await it.fetch(post.where, post.init);
    return said.ok ? JSON.parse(said.text || "{}") : null;
  } catch {
    return null;
  }
}

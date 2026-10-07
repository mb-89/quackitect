// Copilot's hook off the hooks door: each Claude call the event stands for
// posts to the door, and the step it answers is Copilot's result. While the
// door stands down, the cage verb answers a guarded call.
// [[spec/tickets/copilot-answers-off-the-door]] [[spec/tickets/level0-hooks-hold-no-rule]]

import {
  cageDeny,
  cageInput,
  HOOKS_FILE,
  hookOf,
  verbOf,
} from "../../.claude/skills/level0/hooks/cage.ts";
import { callsOf, postedAs } from "../../.claude/skills/level0/lib/copilot.js";

// The result a Copilot event answers: the first deny or block a call meets, else the afters joined as context. A door that answers nothing hands each call to the cage verb. [[spec/tickets/copilot-answers-off-the-door]]
export async function answers(event, it) {
  const posted = postedAs(event.event);
  const calls = posted === "tool.call" ? callsOf(event, (path) => it.read(path)) : [{}];
  const context = [];
  for (const call of calls) {
    const e = { ...call, session_id: event.session };
    const answer = await asked(it, posted, e);
    if (!answer) {
      const deny = caged(it, posted, e);
      if (deny) return deny;
      continue;
    }
    const step = answer.step ?? {};
    if (step.answer?.deny) return { deny: String(step.answer.deny) };
    if (step.answer?.block) return { block: String(step.answer.block) };
    context.push(...(step.after ?? []));
  }
  return context.length ? { context: context.join("\n\n") } : {};
}

// Copilot asks no rows back, so each post says so. [[spec/tickets/level0-hooks-hold-no-rule]]
async function asked(it, event, e) {
  try {
    const post = hookOf(JSON.parse(String(it.read(HOOKS_FILE))), event, e, it.root, {
      back: true,
    });
    const said = await it.fetch(post.where, post.init);
    return said.ok ? JSON.parse(said.text || "{}") : null;
  } catch {
    return null;
  }
}

// The cage verb's deny over a call, or null where it passes. [[spec/tickets/level0-hooks-hold-no-rule]]
function caged(it, event, e) {
  if (event !== "tool.call") return null;
  try {
    const ran = it.run(verbOf(it.root, "cage"), {
      cwd: it.root,
      stdin: cageInput(event, e),
    });
    return cageDeny(ran?.stdout);
  } catch {
    return null;
  }
}

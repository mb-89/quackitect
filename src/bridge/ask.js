// The ask. The owner sets ask.wanted to short or full from the sidebar, and
// the next tool call carries what the owner asks for, once. The turn's end
// writes the key back to quiet and says so, so the ask asks once and the
// sidebar draws the answer as the widget falling back to rest.
// [[spec/design_output/extension#the-ask-is-a-line]]

import { join } from "node:path";
import { ASK, controlBlock, QUIET } from "../../.claude/skills/level0/lib/controls.js";
import { asks } from "./config.js";

const LOCAL = ".se/config.json";

// [[spec/design_output/extension#the-ask-is-a-line]]
export function asksForUpdate(e, box) {
  if (e?.agentId) return null;
  const wanted = String(asks(box, ASK) ?? QUIET);
  if (wanted === QUIET || box.asked === wanted) return null;
  box.asked = wanted;
  box.log.say("info", "ask", `the owner asks for a ${wanted} update`, {
    tool: String(e?.tool ?? ""),
  });
  return { after: { context: [controlBlock({ wanted })] } };
}

// The turn ends: the ask drops to quiet, so it asks once.
export function dropsAsk(_e, box) {
  box.asked = "";
  const wanted = String(asks(box, ASK) ?? QUIET);
  if (wanted === QUIET) return { pass: true };
  const at = join(box.work, LOCAL);
  let held = {};
  try {
    held = JSON.parse(String(box.disk.read(at)));
  } catch {}
  const [section, leaf] = ASK.split(".");
  held[section] = { ...(held[section] ?? {}), [leaf]: QUIET };
  box.disk.makeDir(join(box.work, ".se"));
  box.disk.write(at, `${JSON.stringify(held, null, 2)}\n`);
  box.log.say("info", "config", `the ask stood at ${wanted}, and drops to ${QUIET}`);
  return { pass: true };
}

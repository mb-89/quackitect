// The ask. The owner sets ask.wanted to short or full from the sidebar, and
// it opens a demand like a prompt: the block rides on the next call, and the
// reply stands before anything else. The turn's end writes the key back to
// quiet, so the ask asks once and the widget falls back to rest.
// [[spec/design_output/extension#the-ask-is-a-line]]

import { join } from "node:path";
import { ASK, controlBlock, QUIET } from "../../.claude/skills/level0/lib/controls.js";
import { demands } from "./answer.js";
import { asks } from "./config.js";

const LOCAL = ".se/config.json";

// [[spec/design_output/extension#the-ask-is-a-line]]
export function asksForUpdate(e, box) {
  if (e?.agentId) return;
  const wanted = String(asks(box, ASK) ?? QUIET);
  if (wanted === QUIET || box.asked === wanted) return;
  box.asked = wanted;
  box.log.say("debug", "ask", `the owner asks for a ${wanted} update`, {
    tool: String(e?.tool ?? ""),
  });
  demands(box, `The owner asks for a ${wanted} update`, controlBlock({ wanted }), () => dropsAsk(null, box));
}

// The ask drops to quiet the moment its reply pays it, or at the turn's end at the latest.
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
  box.log.say("debug", "config", `the ask stood at ${wanted}, and drops to ${QUIET}`);
  return { pass: true };
}

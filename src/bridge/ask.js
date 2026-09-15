// The ask. The owner sets ask.wanted to short or full from the sidebar, and
// it opens a demand like a prompt: the block rides on the next call, and the
// reply stands before anything else. The turn's end writes the key back to
// quiet, so the ask asks once and the widget falls back to rest.
// [[spec/design_output/extension#the-ask-is-a-line]]

import { ASK, controlBlock, QUIET } from "../../.claude/skills/level0/lib/controls.js";
import { demands } from "./answer.js";
import { asks, writes } from "./config.js";
import { statusAsks, statusLacks, statusShape } from "./status.js";

const FULL = "full";

// [[spec/design_output/extension#the-ask-is-a-line]]
export function asksForUpdate(e, box) {
  if (e?.agentId) return;
  const wanted = String(asks(box, ASK) ?? QUIET);
  if (wanted === QUIET || (box.asked === wanted && box.demand)) return;
  box.asked = wanted;
  box.log.say("debug", "ask", `the owner asks for a ${wanted} update`, {
    tool: String(e?.tool ?? ""),
  });
  const chapters = wanted === FULL ? statusShape(box.disk, box.method) : [];
  const block = [controlBlock({ wanted }), chapters.length ? statusAsks(chapters) : ""].filter(Boolean).join("\n\n");
  demands(box, `The owner asks for a ${wanted} update`, block, () => dropsAsk(box, wanted));
  if (chapters.length) box.demand.fits = (text) => statusLacks(text, chapters);
}

// The ask drops to quiet the moment its reply pays it. The drop takes back the
// value it answered alone: a fresh press of the button stands, and the next
// call asks for it.
export function dropsAsk(box, wanted) {
  box.asked = "";
  const stands = String(asks(box, ASK) ?? QUIET);
  if (stands === QUIET) return { pass: true };
  if (stands !== wanted) {
    box.log.say("debug", "config", `the ask stood at ${wanted}, and ${stands} stands pressed since`);
    return { pass: true };
  }
  writes(box, ASK, QUIET);
  box.log.say("debug", "config", `the ask stood at ${wanted}, and drops to ${QUIET}`);
  return { pass: true };
}

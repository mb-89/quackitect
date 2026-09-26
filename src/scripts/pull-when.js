// The conditions a leaf's `when` names, read off the box and the ticket. A
// leaf whose condition fails stands skipped, so a route carries a step some
// tickets meet and others pass by.
// [[spec/design_output/pull#a-condition-skips-a-leaf]]

import { entriesOf } from "./pull-writes.js";

// The lines under `# Ask` a condition reads: the view the owner reads the change in, and where the ask comes from. [[spec/tickets/the-owner-view-decides-done]]
const VIEW = "view";
const FROM = "from";
export const HANDOVER = "handover";
const NONE = "none";

// [[spec/design_output/pull#a-condition-skips-a-leaf]]
export function holdsHere(it, when, front, text = "") {
  if (!when) return { holds: true };
  if (when === "cloud")
    return { holds: Boolean(it.cloud), why: "the box runs off the cloud" };
  if (when === "desk") return { holds: !it.cloud, why: "the box runs on the cloud" };
  if (when === "returned") {
    const last = entriesOf(front)
      .filter((one) => !one.skipped)
      .at(-1);
    return {
      holds: Number(last?.returns ?? 0) > 0,
      why: "the ticket arrives here by no on_fail",
    };
  }
  if (when === "view") {
    const named = viewOf(text);
    return { holds: named !== "", why: "the ask names no view the owner reads" };
  }
  // [[spec/tickets/the-owners-words-travel-verbatim]]
  if (when === "handed") {
    const from = askLine(text, FROM).toLowerCase();
    return { holds: from === HANDOVER, why: "the ask comes off no handover" };
  }
  return { holds: false, why: `${when} names no condition the pull reads` };
}

// The view the Ask names, or nothing where it names none. [[spec/tickets/the-owner-view-decides-done]]
export function viewOf(text) {
  return askLine(text, VIEW);
}

// The value of a `<name>:` line under `# Ask`, or nothing where the line stands elsewhere or says none. [[spec/tickets/the-owners-words-travel-verbatim]]
export function askLine(text, name) {
  const ask = String(text ?? "").split(/^# (?!Ask\s*$)/m)[0];
  const at = ask.search(/^# Ask\s*$/m);
  if (at < 0) return "";
  const said =
    ask
      .slice(at)
      .match(new RegExp(`^${name}:[ \\t]*(.*)$`, "im"))?.[1]
      ?.trim() ?? "";
  return said.toLowerCase() === NONE ? "" : said;
}

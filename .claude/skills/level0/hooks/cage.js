// THE CAGE UNDER NEW. The hooks door decides the events it ports, and the bridge keeps the rest until the bridge server leaves. A guarded call meets a refusal while the door stands down, so a fault shows on the first call. The loader follows $ into no import, so the bridgehead makes every call on $, and this file holds the words and the choices. [[spec/tickets/a-down-index-refuses-calls]] [[spec/rationales/the-cage-refuses-while-down]]

import { RUN } from "../lib/folders.js";

// The slice key the cage reads, and the value that hands the events to the door. [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
export const CAGE_KEY = "migration.cage";
export const NEW = "new";
// The standing file the hooks door writes, which StandingFile in src/modules/hooks/hooks.go owns, spelled again here because this hook imports its own folder alone. [[spec/tickets/a-down-index-refuses-calls]]
export const HOOKS_FILE = `${RUN}/hooks.json`;
const DOORED = new Set(["tool.call", "classic.Stop"]);
// The calls that pass while the door stands down: the harness reads, beside the level zero read tools. [[spec/tickets/a-down-index-refuses-calls]]
const UNGUARDED = new Set(["Read", "Grep", "Glob"]);
// The commands the refusal names, which pass while the door stands down, so a box whose index stands unbuilt brings it back. [[spec/rationales/the-cage-refuses-while-down]]
const REMEDY = /^\s*\.\/RUNME\.sh (serve|doctor)(\s+--[\w-]+)*\s*$/;
// The alarm the index keeps its fault under, which AlarmsName in the index owns. [[spec/rationales/the-cage-refuses-while-down]]
const ALARMS = "session/alarms";

// Whether the door decides the event, where the key reads new. [[spec/tickets/a-down-index-refuses-calls]]
export function doors(event) {
  return DOORED.has(event);
}

// The post the door reads: its address, and the body with the standing token as a bearer. [[spec/design_output/model#a-post-and-its-answer]]
export function postOf(standing, event, e, root, extra) {
  return {
    where: `http://127.0.0.1:${standing?.port}/hook`,
    init: {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${standing?.token}`,
      },
      body: JSON.stringify({ event, e: e ?? null, root, ...extra }),
    },
  };
}

// The step the effects answer, in order: a result answers the call with its text as a deny, a block holds the Stop, rows ask back, and an after rides the answer as context. A tool the bridge serves and the door passes goes on to the bridge. [[spec/design_output/model#the-effects]]
export function stepOf(answer, event, { asks, served }) {
  const after = [];
  for (const one of answer?.effects ?? []) {
    const kind = String(one?.kind ?? "");
    if (kind === "result")
      return { answer: one.text ? { deny: String(one.text) } : one.result };
    if (kind === "block") return { answer: { block: String(one.text ?? "") } };
    if (kind === "rows" && asks) return { rows: String(one.call ?? "") };
    if (kind === "after" && one.text) after.push(String(one.text));
  }
  if (event === "tool.call" && served) return { bridge: true };
  return after.length ? { after } : {};
}

// A guarded call meets the refusal while the door stands down. [[spec/tickets/a-down-index-refuses-calls]]
export function guarded(event, e, reads) {
  const tool = String(e?.tool ?? "");
  if (event !== "tool.call" || UNGUARDED.has(tool) || reads.includes(tool))
    return false;
  return !(
    tool === "Bash" && REMEDY.test(String(e?.command ?? e?.input?.command ?? ""))
  );
}

// The one line a guarded call meets while the hooks door stands down. [[spec/tickets/a-down-index-refuses-calls]]
export function refusedText(e) {
  return [
    `Level zero refuses ${String(e?.tool ?? "this call")}: the index answers nothing,`,
    "so no cage stands behind the call.",
    `The index keeps the fault under ${ALARMS}.`,
    "Run ./RUNME.sh serve to bring it back, or ./RUNME.sh doctor where that fails.",
    "Both pass, and so do read, grep and glob.",
  ].join(" ");
}

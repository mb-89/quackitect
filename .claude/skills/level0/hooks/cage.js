// THE CAGE UNDER NEW. The hooks door decides the events it ports, and the bridge keeps the rest until the bridge server leaves. A guarded call meets a refusal while the door stands down, so a fault shows on the first call. [[spec/tickets/a-down-index-refuses-calls]] [[spec/rationales/the-cage-refuses-while-down]]

import { configOf } from "../lib/config.js";

// The slice key the cage reads, and the value that hands the events to the door. [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
const CAGE_KEY = "migration.cage";
const NEW = "new";
// The standing file the hooks door writes, which StandingFile in src/modules/hooks/hooks.go owns, spelled again here because this hook imports its own folder alone. [[spec/tickets/a-down-index-refuses-calls]]
const HOOKS_FILE = ".se/.runtime/hooks.json";
const DOORED = new Set(["tool.call", "classic.Stop"]);
// The calls that pass while the door stands down: the harness reads, beside the level zero read tools. [[spec/tickets/a-down-index-refuses-calls]]
const UNGUARDED = new Set(["Read", "Grep", "Glob"]);
// The door passes a tool the bridge serves, and the bridge answers it. [[spec/tickets/a-down-index-refuses-calls]]
export const BRIDGE = Symbol("bridge");
// The alarm the index keeps its fault under, which AlarmsName in the index owns. [[spec/rationales/the-cage-refuses-while-down]]
const ALARMS = "session/alarms";

// Whether the door decides the event: an event it ports, under a key reading new through the same layers the bridge reads, so a local override moves the hook as it moves the bridge. [[spec/tickets/a-down-index-refuses-calls]]
export async function doored($, event) {
  if (!DOORED.has(event)) return false;
  try {
    return (
      String(await configOf({ read: (at) => $.fs.read(at) }).ask(CAGE_KEY)) === NEW
    );
  } catch {
    return false;
  }
}

// The door road, given what it reaches in the bridgehead: the fill, the start road, the fall, the answer, the root, the transcript, the merge, and the tools the bridge serves and reads. [[spec/tickets/a-down-index-refuses-calls]]
export function doorOf(road) {
  // The door answers the event, or the road starts the server once and asks again. Still down, a guarded call meets the refusal, and every other event passes. [[spec/tickets/a-down-index-refuses-calls]]
  async function door($, event, e, next) {
    const extra = await road.fill($, event, e);
    let answer = await asked($, event, e, extra);
    if (!answer) {
      await road.starts($);
      answer = await asked($, event, e, extra);
    }
    if (!answer) return guarded(event, e) ? { deny: refusedText(e) } : next(e);
    return effected($, answer, event, e, next, true);
  }

  async function asked($, event, e, extra) {
    let where = HOOKS_FILE;
    try {
      const standing = JSON.parse(String(await $.fs.read(HOOKS_FILE)));
      where = `http://127.0.0.1:${standing.port}/hook`;
      const said = await $.http.fetch(where, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${standing.token}`,
        },
        body: JSON.stringify({ event, e: e ?? null, root: road.root(), ...extra }),
      });
      if (!said.ok)
        throw Object.assign(new Error(`status ${said.status}`), {
          status: said.status,
        });
      const answer = JSON.parse(said.text || "{}");
      road.answered();
      return answer;
    } catch (error) {
      await road.down($, event, error, where);
      return null;
    }
  }

  // The effects in order: a result answers the call, its text as a deny, a block holds the Stop, rows ask back once, and an after rides the answer as context. [[spec/design_output/model#the-effects]]
  async function effected($, answer, event, e, next, asks) {
    let after = null;
    for (const one of answer?.effects ?? []) {
      const kind = String(one?.kind ?? "");
      if (kind === "result") return one.text ? { deny: String(one.text) } : one.result;
      if (kind === "block") return { block: String(one.text ?? "") };
      if (kind === "rows" && asks) {
        const back = await spokeBack($, e, one.call);
        if (back) return effected($, back, event, e, next, false);
      }
      if (kind === "after" && one.text)
        after = road.merged(after, { context: [String(one.text)] });
    }
    if (event === "tool.call" && road.served(String(e?.tool ?? ""))) return BRIDGE;
    return after ? road.merged(await next(e), after) : next(e);
  }

  // A held call asks back for the newest rows, and the door meets them on agent.spoke. [[spec/tickets/spoke-answer-reaches-the-door]]
  async function spokeBack($, e, call) {
    const spoken = await road.spoken($);
    return asked(
      $,
      "agent.spoke",
      { tool: e?.tool, agentId: e?.agentId, ...spoken, call },
      {},
    );
  }

  function guarded(event, e) {
    const tool = String(e?.tool ?? "");
    return event === "tool.call" && !UNGUARDED.has(tool) && !road.reads(tool);
  }

  return door;
}

// The one line a guarded call meets while the hooks door stands down. [[spec/tickets/a-down-index-refuses-calls]]
export function refusedText(e) {
  return [
    `Level zero refuses ${String(e?.tool ?? "this call")}: the index answers nothing,`,
    "so no cage stands behind the call.",
    `The index keeps the fault under ${ALARMS}.`,
    "Run ./RUNME.sh serve to bring it back, and read, grep and glob pass meanwhile.",
  ].join(" ");
}

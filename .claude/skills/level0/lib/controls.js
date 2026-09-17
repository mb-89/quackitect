// The controls the sidebar hands to level zero. The hold reaches the
// tooth as a mechanical check, and the ask reaches the standing block as a
// line. Both read one key, and the sidebar writes it.
// [[spec/design_output/extension#what-level-zero-holds]]

export const HOLD = "stop.hold";
export const ASK = "ask.wanted";
export const OFF = "off";
export const FINISH = "finish";
export const STOP = "stop";
export const QUIET = "quiet";

// [[spec/design_output/extension#the-hold-is-one-rule]]
export function holds(said) {
  return String(said ?? OFF) === STOP;
}

// [[spec/design_output/extension#the-ask-is-a-line]]
export function controlBlock(said = {}) {
  const rows = [...heldSays(said.hold), ...askSays(said.wanted)];
  if (!rows.length) return "";
  return ["# What the owner asks for", "", ...rows].join("\n");
}

function heldSays(hold) {
  const said = String(hold ?? OFF);
  if (said === STOP) {
    return [
      "The owner holds this session at stop. Put the work down where it stands.",
      "Say what stands and what is left, and end the turn with the stop line.",
      "",
    ];
  }
  if (said !== FINISH) return [];
  return [
    "The owner holds this session at finish. Bring what you hold to a point you",
    "pick it up from later, take nothing new out of the queue, and end the turn.",
    "You judge where that point stands. Say what stands and what is left.",
    "",
  ];
}

function askSays(wanted) {
  const said = String(wanted ?? QUIET);
  if (said === QUIET) return [];
  if (said === "short") {
    return [
      "The owner asks what this session is doing. Say it in a line or two",
      "through the tool mcp__level0__report, then carry on.",
    ];
  }
  return [
    "The owner asks for a full report: what stands done, what stands open, and",
    "what you take next. Hand it in through the tool mcp__level0__report, then carry on.",
  ];
}

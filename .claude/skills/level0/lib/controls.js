// The two controls the sidebar hands to level zero. The hold reaches the
// tooth as a mechanical check, and the ask reaches the standing block as a
// line. Both read one key, and the sidebar writes it.
// [[spec/design_output/extension#what-level-zero-holds]]

export const HOLD = "stop.hold";
export const ASK = "ask.wanted";
export const RUNNING = "running";
export const FINISHING = "finishing";
export const STOPPED = "stopped";
export const QUIET = "quiet";

// [[spec/design_output/extension#the-hold-is-one-rule-in-the-table]]
export function holds(said) {
  return String(said ?? RUNNING) === STOPPED;
}

// [[spec/design_output/extension#the-ask-is-a-line-in-the-block]]
export function controlBlock(said = {}) {
  const rows = [...heldSays(said.hold), ...askSays(said.wanted)];
  if (!rows.length) return "";
  return ["# What the owner asks for", "", ...rows].join("\n");
}

function heldSays(hold) {
  if (String(hold ?? RUNNING) !== FINISHING) return [];
  return [
    "The owner holds this session at finishing. Carry what stands to its end,",
    "start nothing new, and say what is left where you stop.",
    "",
  ];
}

function askSays(wanted) {
  const said = String(wanted ?? QUIET);
  if (said === QUIET) return [];
  if (said === "short") {
    return [
      "The owner asks what this session is doing. Say it in a line or two,",
      "then carry on.",
    ];
  }
  return [
    "The owner asks for a full report: what stands done, what stands open, and",
    "what you take next. Write it, then carry on.",
  ];
}

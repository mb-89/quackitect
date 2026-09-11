// What the status bar says and what a toast warns, for the binding and the hold.
// Every state away from rest shows, and a click puts its key back at rest.
// [[spec/design_output/extension#the-status-bar-says-it]]

const STATES = {
  "engine.binding": {
    rest: "queue",
    god: {
      text: "$(alert) level zero refuses nothing",
      tone: "error",
      tip: "God mode: every refusal level zero holds stands off. Click to put them back.",
      toast:
        "God mode is on. Level zero refuses nothing, and nothing checks the agent.",
    },
    unbound: {
      text: "$(unlock) unbound",
      tone: "warning",
      tip: "Unbound: the queue picks no work. Click to bind it again.",
      toast: "Unbound: the queue picks no work.",
    },
  },
  "stop.hold": {
    rest: "running",
    finishing: {
      text: "$(clock) finishing",
      tone: "warning",
      tip: "Hold: the agent finishes this work, then stops. Click to let it run.",
      toast: "Hold: the agent finishes this work, then stops.",
    },
    stopped: {
      text: "$(debug-pause) stopped",
      tone: "error",
      tip: "Hold: the agent stops at the end of this turn. Click to let it run.",
      toast: "Hold: the agent stops at the end of this turn.",
    },
  },
};

function statesOf(values) {
  const out = [];
  for (const [key, table] of Object.entries(STATES)) {
    const value = String(values?.get?.(key)?.value ?? table.rest);
    const one = table[value];
    if (value === table.rest || !one || typeof one !== "object") continue;
    out.push({ key, value, rest: table.rest, ...one });
  }
  return out;
}

function toastsOf(before, after) {
  const was = new Map((before ?? []).map((one) => [one.key, one.value]));
  return (after ?? []).filter((one) => was.get(one.key) !== one.value);
}

module.exports = { STATES, statesOf, toastsOf };

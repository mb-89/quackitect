// The tooth. At a turn end it counts what stands and answers whether the turn
// goes on. Every rule lives in a file under spec/config/stop, the agent claims
// the reasons only it knows, and the hook holds the mechanical checks.
// [[spec/design_output/stop#the-vote]]

import { readEntries } from "./rulefile.js";

export const RULES = "spec/config/stop";
export const TOOL = "claim_stop";
export const CALLED = `mcp__level0__${TOOL}`;
export const OFF = "stop-hook-off";
export const LIVES = 2;
export const IN_A_ROW = 3;
export const FRESH = 10;

const NEEDS = ["id", "side", "priority", "decides"];
const SIDES = ["stop", "continue"];
const DECIDES = ["claimed", "mechanical"];
const DONE = ["completed", "deleted"];
const MADE = "TaskCreate";
const ENDED = "TaskUpdate";
const FLOOR = 0;

// [[spec/design_output/stop#where-the-rules-live]]
export function rulesOf(text) {
  const rules = [];
  let broken = 0;
  for (const one of readEntries(text)) {
    if (whole(one)) rules.push(one);
    else broken += 1;
  }
  return { rules, broken };
}

export function pool(files) {
  const rules = [];
  const broken = [];
  for (const one of files ?? []) {
    const said = rulesOf(one.text);
    if (said.broken || !said.rules.length) broken.push(one.name);
    rules.push(...said.rules);
  }
  return { rules, broken };
}

function whole(one) {
  for (const key of NEEDS) {
    if (one[key] === undefined || one[key] === "") return false;
  }
  if (!SIDES.includes(one.side)) return false;
  if (!DECIDES.includes(one.decides)) return false;
  return Number.isInteger(one.priority);
}

// [[spec/design_output/stop#the-vote]]
export function decide(rules, held = {}) {
  const unknown = [];
  const all = rules ?? [];
  const firing = all.filter((one) => fires(one, held, unknown));
  const off = firing.find((one) => one.runs === OFF);
  const stop = highest(firing, "stop");
  const go = highest(firing, "continue");

  return {
    ends: Boolean(off) || (go ? go.priority : -1) <= (stop ? stop.priority : FLOOR),
    stop: off ?? stop,
    go,
    off: Boolean(off),
    unclaimed: all.filter((one) => asks(one) && held.claimed !== one.id),
    unknown,
  };
}

function fires(one, held, unknown) {
  if (one.decides === "claimed") return held.claimed === one.id;
  const said = held.ran ? held.ran(one.runs) : undefined;
  if (said === undefined) {
    unknown.push(String(one.runs ?? ""));
    return false;
  }
  return Boolean(said);
}

function asks(one) {
  return one.side === "stop" && one.decides === "claimed" && Boolean(one.asks);
}

function highest(firing, side) {
  return firing
    .filter((one) => one.side === side)
    .sort((a, b) => b.priority - a.priority)[0];
}

// [[spec/design_output/stop#every-decision-writes-a-line]]
export function detail(decision, inARow) {
  const named = (one) => (one ? `${one.id}@${one.priority}` : "none@0");
  return `stop=${named(decision.stop)} continue=${named(decision.go)} inARow=${inARow}`;
}

// [[spec/design_output/stop#what-the-re-prompt-says]]
export function reprompt(decision) {
  return [
    decision.go?.says ?? "",
    "",
    "If that reading is wrong, claim the stop and end the turn:",
    ...decision.unclaimed.map((one) => `  - ${one.asks}`),
  ]
    .join("\n")
    .trimStart();
}

// [[spec/design_output/stop#the-claim-and-its-life]]
export function claimSpec(rules) {
  const claimable = (rules ?? []).filter((one) => one.decides === "claimed");
  return {
    name: TOOL,
    description: [
      "Claims a reason this turn may end, or a reason to carry on.",
      "Level zero counts the claim at the turn end, and the claim goes",
      `after ${LIVES} more tool calls. One rule id and one sentence:`,
      ...claimable.map((one) => `${one.id} (${one.side}) ${one.asks ?? one.says ?? ""}`),
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        rule: { type: "string", enum: claimable.map((one) => one.id) },
        why: { type: "string" },
      },
      required: ["rule", "why"],
    },
  };
}

// [[spec/design_output/stop#the-tooth-holds-its-state]]
export function toothOf(init = {}) {
  const lives = init.lives ?? LIVES;
  const mostInARow = init.mostInARow ?? IN_A_ROW;
  const fresh = init.fresh ?? FRESH;

  let calls = 0;
  let granted = false;
  let inARow = 0;
  let claim = null;
  let since = 0;

  return {
    calls: () => calls,
    inARow: () => inARow,
    claim: () => claim,
    isNew: () => calls < fresh && !granted,

    claims(rule, why) {
      claim = { rule, why };
      since = 0;
      return claim;
    },

    sawCall(tool) {
      calls += 1;
      if (!claim || tool === TOOL || tool === CALLED) return claim;
      since += 1;
      if (since > lives) claim = null;
      return claim;
    },

    sawPrompt(mine) {
      if (!mine) inARow = 0;
    },

    atTurnEnd(decision) {
      const held = claim;
      claim = null;
      const runaway = !decision.ends && inARow >= mostInARow;
      const ends = decision.ends || runaway;
      if (ends) {
        granted = true;
        inARow = 0;
      } else {
        inARow += 1;
      }
      return { ...decision, ends, runaway, claim: held, inARow };
    },
  };
}

// [[spec/design_output/stop#what-the-todo-list-says]]
export function todos() {
  let list = null;
  let made = 0;
  let ended = 0;

  return {
    sawCall(call) {
      const said = call?.todos;
      if (Array.isArray(said)) {
        list = said.map((one) => String(one?.status ?? ""));
        return;
      }
      if (call?.tool === MADE) made += 1;
      if (call?.tool === ENDED && DONE.includes(String(call.status ?? ""))) ended += 1;
    },

    standing: () =>
      list ? list.some((one) => !DONE.includes(one)) : made > ended,
  };
}

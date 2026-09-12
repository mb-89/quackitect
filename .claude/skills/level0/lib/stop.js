// The tooth. At a turn end it counts what stands and answers whether the turn
// goes on. Every rule lives in a file under spec/config/stop, the agent claims
// the reasons only it knows, and the hook holds the mechanical checks.
// [[spec/design_output/stop#the-vote]]

import { readEntries } from "./rulefile.js";

export const RULES = "spec/config/stop";
export const OFF = "stop-hook-off";
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
    "Where that reading falls, end your next answer with this line, last:",
    "",
    "  Stop requested. Reason [<id>]. <what the owner does next>",
    "",
    ...decision.unclaimed.map((one) => `  - ${one.id}: ${one.asks}`),
  ]
    .join("\n")
    .trimStart();
}

// [[spec/design_output/stop#the-line-ends-a-turn]]
export const LINE = /^Stop requested\. Reason \[([a-z0-9-]+)\]\.\s*(.*)$/;

export function stopLineIn(answer) {
  const rows = String(answer ?? "")
    .split(/\r?\n/)
    .map((one) => one.trim())
    .filter(Boolean);
  const found = LINE.exec(rows[rows.length - 1] ?? "");
  if (!found) return null;
  return { reason: found[1], context: found[2].trim() };
}

// [[spec/design_output/stop#the-voice-skips-the-line]]
export function withoutStopLine(answer) {
  const rows = String(answer ?? "").split(/\r?\n/);
  while (rows.length && !rows[rows.length - 1].trim()) rows.pop();
  if (rows.length && LINE.test(rows[rows.length - 1].trim())) {
    rows.pop();
    while (rows.length && !rows[rows.length - 1].trim()) rows.pop();
  }
  return rows.join("\n");
}

export function stopReasons(rules) {
  return (rules ?? []).filter(asks);
}

// [[spec/design_output/stop#what-the-challenge-says]]
export function challenge(rules, reason) {
  const named = stopReasons(rules).find((one) => one.id === reason);
  const others = stopReasons(rules).filter((one) => one.id !== reason);
  return [
    `You ask to stop for ${reason}. ${named?.says ?? named?.asks ?? ""}`.trim(),
    "",
    "Read this before your next step, and answer it to yourself.",
    "",
    "  - going on needs the owner, so the stop stands",
    "  - the stop hands over an update the work carries past",
    "",
    "An update is a line in your next answer, and the work goes on under it.",
    "",
    "Where the stop stands, end your next answer with the same line and this",
    "turn ends. Where it falls, carry on and say nothing of it.",
    ...(others.length ? ["", "The other reasons this tree holds:"] : []),
    ...others.map((one) => `  - ${one.id}: ${one.says ?? one.asks}`),
  ].join("\n");
}

// [[spec/design_output/stop#a-turn-with-no-line]]
export function askForLine(rules, said) {
  const opens = said
    ? `\`${said}\` names no rule this tree holds, so the turn holds open.`
    : "This turn ends with no stop line, so level zero holds it open.";
  return [
    opens,
    "",
    "Carry on where work stands. Where you mean to stop, end your answer with",
    "one line, last, and exactly this shape:",
    "",
    "  Stop requested. Reason [<id>]. <what the owner does next>",
    "",
    "The ids:",
    ...stopReasons(rules).map((one) => `  - ${one.id}: ${one.says ?? one.asks}`),
  ].join("\n");
}

// [[spec/design_output/stop#the-tooth-holds-its-state]]
export function toothOf(init = {}) {
  const fresh = init.fresh ?? FRESH;

  let calls = 0;
  let granted = false;
  let inARow = 0;

  return {
    calls: () => calls,
    inARow: () => inARow,
    isNew: () => calls < fresh && !granted,

    sawCall() {
      calls += 1;
    },

    sawPrompt(mine) {
      if (!mine) inARow = 0;
    },

    // [[spec/design_output/config#a-caller-hands-it-in]]
    atTurnEnd(decision, mostInARow) {
      const runaway = !decision.ends && mostInARow > 0 && inARow >= mostInARow;
      const ends = decision.ends || runaway;
      if (ends) {
        granted = true;
        inARow = 0;
      } else {
        inARow += 1;
      }
      return { ...decision, ends, runaway, inARow };
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

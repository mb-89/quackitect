// The queue's one decider. A score weighs the mark, what waits under a ticket,
// how long it stands and how often a hand failed on it. The pull orders by this
// answer, and every column naming an order reads the same one.
// [[spec/design_output/pull#the-queue-is-a-score]]

import { dependsOn, spanOf, TICKETS, urgent } from "../engine/group.js";
import { entriesOf } from "./pull-writes.js";

// A second reads as this many of what a clock answers. [[spec/design_output/pull#the-queue-is-a-score]]
const MS = 1000;
const DAY = spanOf("1d");

// Every ticket waiting on each one, read straight off `depends_on`. [[spec/design_output/pull#the-queue-is-a-score]]
export function waitsUnder(all) {
  const out = new Map();
  for (const one of all ?? []) {
    for (const dep of dependsOn(one.front)) {
      if (!out.has(dep)) out.set(dep, []);
      out.get(dep).push(one.name);
    }
  }
  return out;
}

// The walk reaches the whole chain, so a blocker of a blocker counts. [[spec/design_output/pull#the-queue-is-a-score]]
export function chainUnder(name, waits, seen = new Set([name])) {
  let count = 0;
  for (const one of waits.get(name) ?? []) {
    if (seen.has(one)) continue;
    seen.add(one);
    count += 1 + chainUnder(one, waits, seen);
  }
  return count;
}

// A hand-back that failed carries `returns`, so the record counts them. [[spec/design_output/pull#the-queue-is-a-score]]
export function failsOn(front) {
  return entriesOf(front).filter((one) => Number(one.returns) > 0).length;
}

// [[spec/design_output/pull#the-queue-is-a-score]]
export function daysStood(since, now) {
  if (!since || !now) return 0;
  return Math.max(0, Math.floor((Math.floor(now / MS) - Number(since)) / DAY));
}

// The sum of the terms, in the weights the config holds. [[spec/design_output/pull#the-queue-is-a-score]]
export function scoreOf(one, waits, stood, weights = {}, now = 0) {
  const weigh = (key) => Number(weights?.[key]) || 0;
  return (
    weigh("block") * chainUnder(one.name, waits) +
    weigh("day") * daysStood(stood?.get(one.path), now) +
    weigh("fail") * failsOn(one.front)
  );
}

// The mark stands over the score, and the score orders everything under it. [[spec/design_output/pull#the-queue-is-a-score]]
export function queued(list, all, it = {}) {
  const waits = waitsUnder(all);
  const now = it.clock ? it.clock.now().getTime() : 0;
  const scored = [...list].map((one) => ({
    one,
    mark: urgent(one.text) ? 1 : 0,
    score: scoreOf(one, waits, it.stood, it.weights, now),
  }));
  scored.sort(
    (a, b) => b.mark - a.mark || b.score - a.score || a.one.name.localeCompare(b.one.name),
  );
  return scored.map((held) => held.one);
}

// When each ticket came in, off one git log over the folder holding them. [[spec/design_output/pull#the-queue-is-a-score]]
export function stoodHere(it) {
  const said = it.git.run(
    ["log", "--diff-filter=A", "--format=%ct", "--name-only", "--", TICKETS],
    true,
  );
  return said.ok ? stoodIn(said.out) : new Map();
}

// [[spec/design_output/pull#the-queue-is-a-score]]
export function stoodIn(said) {
  const out = new Map();
  let when = 0;
  for (const row of String(said ?? "").split("\n")) {
    const line = row.trim();
    if (!line) continue;
    if (/^\d+$/.test(line)) {
      when = Number(line);
      continue;
    }
    if (!out.has(line)) out.set(line, when);
  }
  return out;
}

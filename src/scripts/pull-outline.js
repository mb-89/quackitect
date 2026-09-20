// The queue as an outline. A row at the left takes one number, a ticket
// under it a sub-number, and a person's row a negative number that sorts
// first. One order feeds it: the person's rows by score, then the agent's.
// [[spec/design_output/pull#the-queue-is-an-outline]]

import { CLOSED, fieldOf, GROUP } from "../engine/group.js";

// The place of a ticket the pull holds back, which every order puts after the placed ones. [[spec/design_output/pull#the-queue-is-an-outline]]
export const UNPLACED = "∞";

// The outline, a place a name, off the two ordered lists and every ticket the tree holds. A ticket in neither list stands unplaced, and a closed one takes no place at all. [[spec/design_output/pull#the-queue-is-an-outline]]
export function outlineIn(persons, agents, all) {
  const ordinal = new Map();
  for (const one of [...persons, ...agents]) {
    if (!ordinal.has(one.name)) ordinal.set(one.name, ordinal.size);
  }
  const kids = kidsOf(all);
  const best = new Map();
  const roots = all
    .map((one) => one.name)
    .filter((name) => !kids.parent.has(name))
    .map((name) => ({ name, best: bestUnder(name, kids, ordinal, best) }))
    .filter((one) => one.best !== undefined)
    .sort((a, b) => a.best - b.best);
  const out = new Map();
  // A person's row counts down to minus one, so the most pressing stands first, and the agent's count up from one. [[spec/design_output/pull#the-queue-is-an-outline]]
  const own = roots.filter((one) => one.best < persons.length);
  own.forEach((one, at) => {
    numberUnder(one.name, String(at - own.length), kids, best, out);
  });
  roots
    .filter((one) => one.best >= persons.length)
    .forEach((one, at) => {
      numberUnder(one.name, String(at + 1), kids, best, out);
    });
  for (const one of all) {
    if (!out.has(one.name) && fieldOf(one.text, "state") !== CLOSED) out.set(one.name, UNPLACED);
  }
  return out;
}

// A ticket names its group, so the tree reads both ways off one pass. [[spec/design_output/pull#the-queue-is-an-outline]]
function kidsOf(all) {
  const names = new Set(all.map((one) => one.name));
  const parent = new Map();
  const under = new Map();
  for (const one of all) {
    const group = fieldOf(one.text, GROUP);
    if (!group || group === one.name || !names.has(group)) continue;
    parent.set(one.name, group);
    if (!under.has(group)) under.set(group, []);
    under.get(group).push(one.name);
  }
  return { parent, under };
}

// The best ordinal in a subtree, which is what the subtree sorts by, and nothing where none of it stands in the queue. [[spec/design_output/pull#the-queue-is-an-outline]]
function bestUnder(name, kids, ordinal, best, seen = new Set()) {
  if (best.has(name)) return best.get(name);
  if (seen.has(name)) return undefined;
  seen.add(name);
  let held = ordinal.get(name);
  for (const kid of kids.under.get(name) ?? []) {
    const said = bestUnder(kid, kids, ordinal, best, seen);
    if (said !== undefined && (held === undefined || said < held)) held = said;
  }
  best.set(name, held);
  return held;
}

// A row takes its number, and its kids take the number, a dot and their own place under it. [[spec/design_output/pull#the-queue-is-an-outline]]
function numberUnder(name, place, kids, best, out) {
  out.set(name, place);
  (kids.under.get(name) ?? [])
    .filter((kid) => best.get(kid) !== undefined)
    .sort((a, b) => best.get(a) - best.get(b))
    .forEach((kid, at) => {
      numberUnder(kid, `${place}.${at + 1}`, kids, best, out);
    });
}

// Two places compare segment by segment as numbers, so `-2` stands before `1`, and `1.2` before `1.10`. [[spec/design_output/pull#the-queue-is-an-outline]]
export function compareOutline(left, right) {
  const a = segmentsOf(left);
  const b = segmentsOf(right);
  for (let at = 0; at < Math.max(a.length, b.length); at++) {
    if (a[at] === undefined) return -1;
    if (b[at] === undefined) return 1;
    if (a[at] !== b[at]) return a[at] - b[at];
  }
  return 0;
}

// A segment reads as a number, and one reading as none stands past every number. [[spec/design_output/pull#the-queue-is-an-outline]]
function segmentsOf(said) {
  return String(said ?? "")
    .split(".")
    .map((one) => (Number.isNaN(Number(one)) ? Number.POSITIVE_INFINITY : Number(one)));
}

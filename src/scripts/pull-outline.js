// The queue as an outline. A row at the left takes one number, a ticket
// under it a sub-number, and a person's row a negative number that sorts
// first. Ordered lists feed it, and a todo moves a row before the one it
// names, whatever the score says.
// [[spec/design_output/pull#the-queue-is-an-outline]]

import { fieldOf, GROUP, todoOf } from "../engine/group.js";

// The words a todo carries in place of a row's name: the front of the level, and its end. [[spec/design_output/pull#the-queue-is-an-outline]]
export const FIRST = "first";
export const LAST = "last";

// The place of a row a cloud branch holds: this box cannot take it, so it stands past every number. [[spec/design_output/pull#the-queue-is-an-outline]]
export const CLOUD_PLACE = "∞";

// The outline, a place a name. The person's list comes first and counts down, the others count up, and a ticket in no list takes no place. [[spec/design_output/pull#the-queue-is-an-outline]]
export function outlineIn(persons, held, rest, all, places = {}) {
  const ordinal = new Map();
  for (const one of [...persons, ...held, ...rest]) {
    if (!ordinal.has(one.name)) ordinal.set(one.name, ordinal.size);
  }
  const kids = kidsOf(all, places);
  const best = new Map();
  const roots = all
    .map((one) => one.name)
    .filter((name) => !kids.parent.has(name))
    .filter((name) => bestUnder(name, kids, ordinal, best) !== undefined);
  const out = new Map();
  const ordered = anchored(roots, kids, best);
  // A person's row counts down to minus one, so the most pressing stands first, and the rest count up from one. [[spec/design_output/pull#the-queue-is-an-outline]]
  const own = ordered.filter((name) => best.get(name) < persons.length);
  own.forEach((name, at) => {
    numberUnder(name, String(at - own.length), kids, best, out);
  });
  // A ticket in hand stands at zero, so the queue shows what a hand holds and no letter says it. [[spec/design_output/pull#the-queue-is-an-outline]]
  const inHand = persons.length + held.length;
  for (const name of ordered.filter((name) => best.get(name) >= persons.length && best.get(name) < inHand)) {
    numberUnder(name, "0", kids, best, out);
  }
  ordered
    .filter((name) => best.get(name) >= inHand)
    .forEach((name, at) => {
      numberUnder(name, String(at + 1), kids, best, out);
    });
  return out;
}

// A ticket names its group, so the tree reads both ways off one pass. [[spec/design_output/pull#the-queue-is-an-outline]]
function kidsOf(all, places = {}) {
  const names = new Set(all.map((one) => one.name));
  const parent = new Map();
  const under = new Map();
  const todo = new Map();
  for (const one of all) {
    // The override on this box stands over the front's tag, and travels nowhere. [[spec/design_output/pull#a-todo-forces-a-place]]
    todo.set(one.name, String(places?.[one.name] ?? "") || todoOf(one.front ?? {}));
    const group = fieldOf(one.text, GROUP);
    if (!group || group === one.name || !names.has(group)) continue;
    parent.set(one.name, group);
    if (!under.has(group)) under.set(group, []);
    under.get(group).push(one.name);
  }
  return { parent, under, todo };
}

// The best ordinal in a subtree, which is what the subtree sorts by, and nothing where none of it stands in a list. [[spec/design_output/pull#the-queue-is-an-outline]]
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

// One level in order: by the best ordinal, then each todo moved before the row it names, or to the front where it names none standing here. [[spec/design_output/pull#the-queue-is-an-outline]]
function anchored(names, kids, best) {
  const order = [...names].sort((a, b) => best.get(a) - best.get(b));
  const moved = order.filter((name) => kids.todo.get(name)).sort();
  for (const name of moved) {
    order.splice(order.indexOf(name), 1);
    const said = kids.todo.get(name);
    if (said === LAST) {
      order.push(name);
      continue;
    }
    const at = order.indexOf(levelOf(said, names, kids));
    order.splice(at < 0 ? 0 : at, 0, name);
  }
  return order;
}

// The row of this level a todo's name stands under, so a todo naming a ticket inside a group lands before that group. [[spec/design_output/pull#the-queue-is-an-outline]]
function levelOf(said, names, kids) {
  let name = said;
  const seen = new Set();
  while (name && !names.includes(name) && !seen.has(name)) {
    seen.add(name);
    name = kids.parent.get(name);
  }
  return name ?? "";
}

// A row takes its number, and its kids take the number, a dot and their own place under it. [[spec/design_output/pull#the-queue-is-an-outline]]
function numberUnder(name, place, kids, best, out) {
  out.set(name, place);
  const under = (kids.under.get(name) ?? []).filter(
    (kid) => best.get(kid) !== undefined,
  );
  anchored(under, kids, best).forEach((kid, at) => {
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

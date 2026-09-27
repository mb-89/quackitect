// A gate's reject: the phase before the gate goes in again as copies, each
// named for its round, so every round keeps its own evidence. From the second
// reject on, a person step goes in before the copies.
// [[spec/design_output/pull#the-gate]]

import { reRouted } from "../../.claude/skills/level0/lib/schema-mint.js";
import { acceptAsks, acceptCapped } from "./pull-accept.js";
import { frontOf, OPEN, withEntry, withField } from "../engine/group.js";
import { dropHold } from "./guidance-hand.js";
import { roleOf } from "./pull-hand-of.js";
import { withPersonStep } from "./pull-hand.js";
import { landed } from "./pull-landed.js";
import { REFUSED, say } from "./pull-route.js";
import {
  onward,
  refusedPush,
  returnsOf,
  sentOut,
  tipOf,
  unlanded,
} from "./pull-writes.js";
import { schemasHere } from "./ticket.js";

// The reject count past which a person step goes in. [[spec/design_output/pull#the-gate]]
const REJECTS_BEFORE_PERSON = 2;

// [[spec/design_output/pull#the-gate]]
export function rejected(it, who, one, leaf, held, reason, answered) {
  // Past its cap a final gate closes onto a question. [[spec/design_output/pull#the-final-acceptance]]
  if (leaf.final && acceptCapped(it, one, leaf))
    return acceptAsks(it, who, one, leaf, held, reason, answered);
  const round = returnsOf(one.front, leaf.path) + 1;
  one.text = withEntry(
    one.text,
    {
      step: leaf.path,
      hand: roleOf(who.hand),
      hash_before: held.hash,
      hash_after: one.private ? "" : tipOf(it),
      returns: round,
      why: reason,
      answered,
    },
    it.front,
  );
  const copy = reworked(it, one, leaf.path, round);
  if (!copy) {
    say(REFUSED, [
      `${leaf.path} stands after no phase, so a reject puts nothing in again.`,
    ]);
    return 1;
  }
  const changes = [`rejects at ${leaf.path}`, `inserts ${copy.names.join(", ")}`];
  if (round >= REJECTS_BEFORE_PERSON) {
    const asks = `${leaf.path} rejects ${round} times: ${reason}`;
    const person = withPersonStep(it, one, copy.first, asks).path;
    if (person) changes.push(`asks ${person}`);
  }
  const finding = landed(it, one, changes);
  if (finding) return unlanded(one, leaf, finding);
  dropHold(it, who.hand);
  const sent = sentOut(it, one, who.branch);
  if (!sent.ok) return refusedPush(sent);
  return onward(it, who, [`${one.name} ${changes.join(", ")}.`, ...sent.why]);
}

// The phase a gate closes is the step before it. Its leaves go in again at its end, each named `<leaf>-<round + 1>`, and a leaf a condition holds, a person step or an earlier copy stays out. [[spec/design_output/pull#the-gate]]
function reworked(it, one, gatePath, round) {
  const steps = structuredClone(frontOf(one.text).steps ?? []);
  const parts = gatePath.split("/");
  let list = steps;
  for (const part of parts.slice(0, -1)) {
    const phase = list.find((held) => String(held?.name) === part);
    if (!phase) return null;
    phase.steps = [phase.steps ?? []].flat();
    list = phase.steps;
  }
  const at = list.findIndex((held) => String(held?.name) === parts.at(-1));
  const before = at > 0 ? list[at - 1] : null;
  if (!before) return null;
  const nested = Array.isArray(before.steps);
  const into = nested ? before.steps : list;
  const prefix = nested ? [...parts.slice(0, -1), before.name] : parts.slice(0, -1);
  const originals = (nested ? before.steps : [before]).filter(
    (held) => !held.steps && !held.when && !COPIED.test(String(held.name)),
  );
  const copies = originals.map((held) => ({
    ...structuredClone(held),
    name: `${held.name}-${round + 1}`,
  }));
  if (!copies.length) return null;
  const named = new Map(
    originals.map((held, i) => [String(held.name), copies[i].name]),
  );
  const pathed = new Map(
    [...named].map(([from, to]) => [
      [...prefix, from].join("/"),
      [...prefix, to].join("/"),
    ]),
  );
  for (const copy of copies)
    if (copy.input !== undefined) copy.input = rewired(copy.input, named, pathed);
  into.splice(nested ? into.length : at, 0, ...copies);
  readsBoth(steps, new Set(copies), pathed);

  const schema = schemasHere(it).get("ticket");
  const text = schema ? reRouted(one.text, schema, steps, "", it.front) : one.text;
  const first = [...prefix, copies[0].name].join("/");
  one.text = withField(
    withField(text, "step", first, it.front),
    "state",
    OPEN,
    it.front,
  );
  return { first, names: copies.map((held) => held.name) };
}

// A copy reads the copies of its own round, in place of the leaves they copy. [[spec/design_output/pull#the-gate]]
function rewired(input, named, pathed) {
  const list = [input]
    .flat()
    .map((one) => named.get(String(one)) ?? pathed.get(String(one)) ?? one);
  return Array.isArray(input) ? list : list[0];
}

// A step reading a copied leaf by path reads its copy beside it, so every round keeps a reader. [[spec/design_output/pull#the-gate]]
function readsBoth(list, copies, pathed) {
  for (const held of list) {
    if (!copies.has(held) && held.input !== undefined) {
      const reads = [held.input].flat().map(String);
      const more = reads
        .map((one) => pathed.get(one))
        .filter((one) => one && !reads.includes(one));
      if (more.length) held.input = [...reads, ...more];
    }
    if (Array.isArray(held.steps)) readsBoth(held.steps, copies, pathed);
  }
}

// A copy an earlier round inserts, or a person step, which a reject copies nothing of. [[spec/design_output/pull#the-gate]]
const COPIED = /(-\d+$)|(^person$)/;

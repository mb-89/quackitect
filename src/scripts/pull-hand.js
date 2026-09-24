// Which tickets stand, which of them a hand takes, and who takes which leaf.
// The offer, the hold, and the rules a hand meets on its way to one.
// [[spec/design_output/pull#the-hand-out]]

import { inCloud } from "../../.claude/skills/level0/lib/cloud.js";
import { entryNamed } from "../../.claude/skills/level0/lib/schema.js";
import { reRouted } from "../../.claude/skills/level0/lib/schema-mint.js";
import { writesHere } from "../../.claude/skills/level0/lib/ticket.js";
import { TRUNK } from "../../.claude/skills/level0/lib/trunk.js";

export { HELPER, SPAWN, spawnPrompt } from "./pull-spawn.js";

import {
  agentOpens,
  CLOSED,
  dependsOn,
  fieldOf,
  frontOf,
  GROUP,
  isGroup,
  NOTE_END,
  OPEN,
  TICKETS,
  ticketNamed,
  todoOf,
  urgent,
  withEntry,
  withField,
} from "../engine/group.js";
import { noteRows, readsOf, writeHold } from "./guidance-hand.js";
import { workAnswer } from "./pull-chapter.js";
import { roleOf } from "./pull-hand-of.js";
import { landedAlone } from "./pull-landed.js";
import { queued, stoodHere } from "./pull-queue.js";
import {
  DONE,
  ENGINE,
  holdsVerb,
  leafOf,
  MOST_MOVES,
  say,
  stepPathOf,
  WAIT,
  walkOf,
} from "./pull-route.js";
import { HELPER, SPAWN, spawnPrompt, unblockPrompt } from "./pull-spawn.js";
import { entriesOf, pushed, returnsOf, shut, target, tipOf } from "./pull-writes.js";
import { NOTES, opensDraft, schemasHere } from "./ticket.js";

export function ticketsHere(it) {
  const out = [];
  for (const [folder, priv] of [
    [TICKETS, false],
    [NOTES, true],
  ]) {
    const at = it.join(it.root, ...folder.split("/"));
    if (!it.disk.exists(at)) continue;
    for (const one of it.disk.list(at)) {
      if (one.kind !== "file" || !one.name.endsWith(NOTE_END)) continue;
      const text = it.disk.read(it.join(at, one.name));
      out.push({
        name: ticketNamed(one.name),
        path: `${folder}/${one.name}`,
        at: it.join(at, one.name),
        text,
        front: frontOf(text),
        private: priv,
      });
    }
  }
  return out;
}

// [[spec/design_output/pull#children-before-their-group]]
export function childrenOf(all, group) {
  const names = new Set([group]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const one of all) {
      if (one.private || names.has(one.name)) continue;
      if (names.has(fieldOf(one.text, GROUP))) {
        names.add(one.name);
        grew = true;
      }
    }
  }
  names.delete(group);
  return all.filter((one) => names.has(one.name));
}

// The children stand before their group, so a group no ticket names refuses. [[spec/design_output/work#a-group-is-a-ticket]]
export function emptyGroup(it, text, name) {
  if (!isGroup(text) || childrenOf(ticketsHere(it), name).length) return "";
  return `${name} is a group, and no ticket names it under group. Mint a child naming ${name} under group first, then the group.`;
}

// The score orders the queue, and the terms a weighing carries answer it. [[spec/design_output/pull#the-queue-is-a-score]]
export function weighing(it, all) {
  return { clock: it.clock, weights: it.weights, stood: stoodHere(it), all };
}

// [[spec/design_output/pull#the-queue-is-a-score]]
export function sorted(list, at = {}) {
  return queued(list, at.all ?? list, at);
}

// A tagged ticket stands first, as the list holds it, and the score orders the rest. [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
export function taggedFirst(list, at = {}) {
  const tagged = taggedIn(list);
  return [...tagged, ...sorted(list.filter((one) => !tagged.includes(one)), at)];
}

// The tickets a tag parks for the next pull. [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
export function taggedIn(list) {
  return list.filter((one) => todoOf(one.front) !== "");
}

// [[spec/design_output/pull#what-a-hand-out-reads]]
export function handOut(it, who) {
  repairPersonSteps(it, who);
  const all = ticketsHere(it);
  const groupTicket = all.find((one) => !one.private && one.name === who.group);
  // The tag says the next pull hands it first, on a note and on a ticket alike. [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
  const tagged = taggedIn(all);
  const privates = all.filter((one) => one.private && !tagged.includes(one));
  const at = weighing(it, all);
  // [[spec/design_output/pull#the-engine-takes-the-branch]]
  const pools = who.group
    ? [
        tagged,
        sorted(childrenOf(all, who.group), at),
        groupTicket ? [groupTicket] : [],
        sorted(privates, at),
      ]
    : [tagged, sorted(freeIn(all), at), sorted(privates, at)];
  if (!who.group) cutForGroups(it, all);
  // A name on the pull asks for one ticket, so the pools carry that one alone. [[spec/design_output/pull#the-hand-out]]
  const asked = who.wanted
    ? pools.map((pool) => pool.filter((one) => one.name === who.wanted))
    : pools;

  const why = [];
  let other = null;
  let person = null;
  for (const pool of asked) {
    for (const found of pool) {
      const one = agentOpens(found.text) ? openedHere(it, found, all) : found;
      if (one.why) {
        why.push(`${one.name} ${one.why}`);
        continue;
      }
      const said = offer(it, who, one, all);
      if (said.leaf) return handed(it, who, one, said.leaf);
      if (said.why) why.push(`${one.name} ${said.why}`);
      if (said.person && !person) person = { name: one.name, leaf: said.person };
      if (said.other && !other) other = { one, leaf: said.other, why: said.why };
    }
    if (other && !who.oneStep) return spawnAnswer(other);
  }

  say(WAIT, why.length ? why : [nothingFor(who)]);
  // A person's question leaves the branch, so the group lands. [[spec/design_output/work#a-person-step-leaves]]
  if (person) console.log(`\n${unblockPrompt(person.name, person.leaf)}`);
  return 0;
}

// A trivial draft the pull meets opens through the verb's road, and stands in the reading as open from there. [[spec/design_output/pull#a-draft-opens]]
function openedHere(it, one, all) {
  const opened = opensDraft(it, { path: one.at, said: one.path });
  if (opened.refused)
    return {
      name: one.name,
      why: `stands a trivial draft the pull cannot open: ${opened.refused}`,
    };
  console.log(
    `${one.path} opens at ${opened.step}, because a trivial draft waits on no person.`,
  );
  const text = it.disk.read(one.at);
  const now = { ...one, text, front: frontOf(text) };
  all.splice(all.indexOf(one), 1, now);
  return now;
}

// What the wait answer says where no ticket at all offers a leaf. [[spec/design_output/pull#the-hand-out]]
function nothingFor(who) {
  if (!who.wanted) return "no ticket of this group stands open";
  return `${who.wanted} stands nowhere here, or it stands closed`;
}

// A free ticket stands in no group and is no group, so a desk works it on trunk. [[spec/design_output/pull#the-engine-takes-the-branch]]
export function freeIn(all) {
  return all.filter(
    (one) => !one.private && !fieldOf(one.text, GROUP) && !isGroup(one.text),
  );
}

// An open group works on a branch, so a desk cuts one where none stands and leaves the group to the cloud. [[spec/design_output/pull#the-engine-takes-the-branch]]
export function cutForGroups(it, all) {
  const stands = new Set(
    it.git
      .run(["ls-remote", "--heads", "origin", "work/*"], true)
      .out.split("\n")
      .filter(Boolean)
      .map((row) => row.split("\t")[1]?.replace("refs/heads/", "") ?? ""),
  );
  for (const one of all) {
    if (one.private || !isGroup(one.text) || fieldOf(one.text, "state") !== OPEN)
      continue;
    const branch = `work/${one.name}`;
    if (stands.has(branch)) continue;
    if (!it.git.run(["branch", branch, TRUNK], true).ok) continue;
    it.git.run(["push", "-u", "origin", branch], true);
    console.log(
      `${branch} is cut and pushed, because a group works on a branch and the cloud takes it.`,
    );
  }
}

// A desk takes a group on two roads alone: the owner names it, or it carries the mark. [[spec/design_output/pull#the-engine-takes-the-branch]]
export function namedGroup(it, name) {
  const one = ticketsHere(it).find((held) => !held.private && held.name === name);
  return one && isGroup(one.text) ? name : "";
}

export function urgentGroup(it) {
  const all = ticketsHere(it);
  const groups = all.filter(
    (one) =>
      !one.private &&
      isGroup(one.text) &&
      fieldOf(one.text, "state") === OPEN &&
      urgent(one.text),
  );
  return groups.length ? (sorted(groups, weighing(it, all))[0]?.name ?? "") : "";
}

export function spawnAnswer(other) {
  const helper = `${HELPER}-${entriesOf(other.one.front).length + 1}`;
  say(SPAWN, [
    `${other.one.name} at ${other.leaf.path} ${other.why}.`,
    "Spawn a hand of its own with the prompt below, and pull again once it answers.",
  ]);
  console.log("");
  console.log(spawnPrompt(other.one.name, other.leaf, helper));
  return 0;
}

// [[spec/design_output/pull#done-leaves-no-takeable-step]]
export function takeable(it, one, all = [], group = "") {
  const front = frontOf(one.text);
  // A trivial draft opens at the pull, so it reads as the open ticket it becomes. [[spec/design_output/pull#a-draft-opens]]
  if (String(front.state ?? "") !== OPEN && !agentOpens(one.text)) return "";
  // The offer waits on a dependency, so this waits on it too. [[spec/design_output/work#a-dependency-waits-for-trunk]]
  if (dependsOn(front).some((dep) => !closedHere(it, all, dep))) return "";
  const path = stepPathOf(front);
  const leaf = leafOf(front, path);
  if (!leaf) return "";
  // [[spec/tickets/the-one-answer-takes-shape]]
  // The session spawns the hand a helper leaf waits for, so a harness on the box holds the group. [[spec/tickets/the-spawn-answers-a-helper]]
  if (!writesHere(leaf, handRule(it, front, all, group, it.agent)).writes) return "";
  if (leaf.needs.some((need) => !holdsVerb(need))) return "";
  return leaf.path;
}

// [[spec/design_output/pull#what-a-hand-out-reads]]
export function offer(it, who, one, all) {
  const state = fieldOf(one.text, "state");
  if (state === CLOSED) return {};
  if (state !== OPEN) return { why: `stands ${state || "with no state"}` };

  const open =
    one.name === who.group
      ? []
      : dependsOn(one.front).filter((dep) => !closedHere(it, all, dep));
  if (open.length) return { why: `waits for ${open.join(", ")}` };

  const moved = advanced(it, one, all);
  if (moved.why) return { why: moved.why };
  if (!moved.leaf) return {};
  return admits(it, who, one, moved.leaf, all);
}

export { dependsOn } from "../engine/group.js";

// [[spec/design_output/pull#children-before-their-group]]
export function closedHere(it, all, dep) {
  const here = all.find((one) => one.name === dep);
  if (here) return fieldOf(here.text, "state") === CLOSED;
  const said = it.git.run(["show", `origin/${TRUNK}:${TICKETS}/${dep}.md`], true);
  if (!said.ok) return true;
  return fieldOf(said.out, "state") === CLOSED;
}

// [[spec/design_output/pull#a-condition-skips-a-leaf]]
export function advanced(it, one, all) {
  let text = one.text;
  let front = one.front;
  let path = stepPathOf(front);
  let moved = false;
  const changes = [];

  for (let guard = 0; guard < MOST_MOVES; guard++) {
    const leaf = leafOf(front, path);
    if (!leaf) {
      return { why: `stands at ${path || "no step"}, which its route lacks` };
    }

    const when = holdsHere(it, leaf.when, front);
    if (!when.holds) {
      text = withEntry(text, { step: leaf.path, skipped: true, why: when.why });
      changes.push(`skips ${leaf.path}`);
    } else if (leaf.by === "children") {
      const said = childrenSay(all, one.name);
      if (said.dropped.length) {
        const back = target(leaf, leaf.on_fail);
        text = withEntry(text, {
          step: leaf.path,
          hand: ENGINE,
          returns: returnsOf(front, leaf.path) + 1,
          why: `${said.dropped.join(", ")} closed dropped`,
        });
        changes.push(`${leaf.path} fails back to ${back}`);
        moved = true;
        front = frontOf(text);
        path = back;
        continue;
      }
      if (said.open.length) {
        const busy = said.open.filter((name) => {
          const child = all.find((held) => !held.private && held.name === name);
          return child && takeable(it, child, all);
        });
        if (busy.length)
          return { why: `waits for ${busy.join(", ")}, which a hand can take` };
        // Every open child waits for a person, so the group stands here and hands no retro out. [[spec/tickets/the-group-leaves-at-todo]]
        return { why: `waits for ${said.open.join(", ")}` };
      } else {
        text = withEntry(text, {
          step: leaf.path,
          hand: ENGINE,
          hash_before: tipOf(it),
          hash_after: tipOf(it),
        });
        changes.push(`passes ${leaf.path}`);
      }
    } else {
      if (moved) {
        text = withField(text, "step", path);
        one.text = text;
        one.front = frontOf(text);
        landedAlone(it, one, changes);
      }
      return { leaf };
    }

    moved = true;
    front = frontOf(text);
    const next = leaf.leaves[leaf.at + 1];
    if (!next) {
      text = shut(text, front, DONE);
      one.text = text;
      one.front = frontOf(text);
      landedAlone(it, one, changes.concat(`closes ${DONE}`));
      return {};
    }
    path = next.path;
  }
  return { why: "loops in its route" };
}

// [[spec/design_output/pull#a-condition-skips-a-leaf]]
export function holdsHere(it, when, front) {
  if (!when) return { holds: true };
  if (when === "cloud")
    return { holds: Boolean(it.cloud), why: "the box runs off the cloud" };
  if (when === "desk") return { holds: !it.cloud, why: "the box runs on the cloud" };
  if (when === "returned") {
    const last = entriesOf(front)
      .filter((one) => !one.skipped)
      .at(-1);
    return {
      holds: Number(last?.returns ?? 0) > 0,
      why: "the ticket arrives here by no on_fail",
    };
  }
  return { holds: false, why: `${when} names no condition the pull reads` };
}

// [[spec/design_output/pull#children-before-their-group]]
export function childrenSay(all, name) {
  const mine = all.filter((one) => !one.private && fieldOf(one.text, GROUP) === name);
  const open = mine
    .filter((one) => fieldOf(one.text, "state") !== CLOSED)
    .map((one) => one.name);
  const dropped = mine
    .filter(
      (one) =>
        fieldOf(one.text, "state") === CLOSED &&
        fieldOf(one.text, "reason") === "dropped",
    )
    .map((one) => one.name);
  return { open, dropped, all: mine.map((one) => one.name) };
}

// [[spec/design_output/pull#the-hand-rule]]
export function admits(it, who, one, leaf, all) {
  const rule = handRule(it, one.front, all, who.group, who.oneStep);
  const said = writesHere(leaf, rule);
  if (!said.writes) {
    // A box carrying a harness spawns the hand a helper leaf waits for. [[spec/tickets/the-spawn-answers-a-helper]]
    const spawns = String(leaf.by) === HELPER && Boolean(it.agent);
    return {
      why: said.why,
      ...(said.person ? { person: leaf } : {}),
      ...(spawns ? { other: leaf } : {}),
    };
  }
  const lacking = leaf.needs.filter((need) => !holdsVerb(need));
  if (lacking.length)
    return { why: `needs ${lacking.join(", ")}, which this box lacks` };
  const other = excludes(one.front, leaf, who.hand);
  if (other) return { why: other, other: leaf };
  return { leaf };
}

// The hand the one answer reads: who this is, and what the group stands at. [[spec/tickets/the-one-answer-takes-shape]]
// The helper answer differs by road, so the caller hands it in: the hand-out reads the hand under --as, and the leave reads the harness on the box. [[spec/tickets/the-spawn-answers-a-helper]]
export function handRule(it, front, all, group, helper = false) {
  return {
    helper: Boolean(helper),
    agent: Boolean(it.agent),
    ownerSays: Boolean(it.ownerSays),
    cloud: Boolean(it.cloud ?? inCloud(it.env ?? {})),
    atRetro: todoOf(front) !== "" || atRetro(all ?? [], group),
  };
}

export function atRetro(all, group) {
  const one = all.find((held) => !held.private && held.name === group);
  return one ? String(one.front.step ?? "").startsWith("retro") : false;
}

// [[spec/design_output/pull#the-hand-rule]]
export function excludes(front, leaf, hand) {
  if (!leaf.not) return "";
  const named = entryNamed(leaf.walk, leaf.not, leaf);
  if (!named) return "";
  const under = leaf.walk.filter(
    (one) => one.path === named.path || one.path.startsWith(`${named.path}/`),
  );
  const paths = new Set(under.map((one) => one.path));
  const wrote = entriesOf(front).filter(
    (one) => paths.has(String(one.step)) && !one.skipped,
  );
  if (!wrote.length) return "";
  // The record holds the role, so the rule reads the hand as its role too. [[spec/design_output/pull#the-hand-rule]]
  if (wrote.some((one) => String(one.hand ?? "") === roleOf(hand))) {
    return `waits for a hand other than ${hand}, which wrote ${named.path}`;
  }
  return "";
}

// [[spec/design_output/pull#the-work-answer]]
export function handed(it, who, one, leaf) {
  const hash = one.private ? "" : tipOf(it);
  const reads = readsOf(it, leaf.reads);
  noteRows(it, leaf.path, reads);
  writeHold(it, who.hand, {
    ticket: one.name,
    path: one.path,
    step: leaf.path,
    // The write door reads what this hand works, in place of working it out again. [[spec/tickets/the-one-answer-takes-shape]]
    by: leaf.by,
    group: who.group,
    hand: who.hand,
    hash,
    taken: it.clock ? it.clock.stamp() : "",
    refused: 0,
    reads,
  });
  console.log(workAnswer(it, one, leaf));
  return 0;
}

// [[spec/design_output/pull#the-work-answer]]

export function repairPersonSteps(it, who) {
  for (const one of ticketsHere(it)) {
    const put = withEngineReader(it, one);
    if (!put) continue;
    one.text = put;
    landedAlone(it, one, ["a person step names the engine as its reader"]);
    if (!one.private) pushed(it, who.branch);
  }
}

export function withEngineReader(it, one) {
  const front = frontOf(one.text);
  const lacking = walkOf(front).filter(
    (held) =>
      /^person(-\d+)?$/.test(held.name) &&
      String(held.said.by) === "person" &&
      !held.said.to,
  );
  const bare = String(one.text)
    .split(/\r?\n/)
    .some((row) => /^\s+asks: [^"'].*: /.test(row));
  if (!lacking.length && !bare) return "";
  const steps = structuredClone(front.steps ?? []);
  for (const held of lacking) {
    let list = steps;
    const parts = held.path.split("/");
    for (const part of parts.slice(0, -1)) {
      list = [list.find((step) => String(step?.name) === part)?.steps ?? []].flat();
    }
    const step = list.find((step) => String(step?.name) === parts.at(-1));
    if (step) step.to = "engine";
  }
  const schema = schemasHere(it).get("ticket");
  return schema ? reRouted(one.text, schema, steps, "") : "";
}

// [[spec/design_output/pull#a-person-step-goes-in]]
export function withPersonStep(it, one, before, asks, options) {
  const standing = stepsNamed(one, "person");
  const most = Number(it.splits);
  if (most > 0 && standing >= most) {
    console.error(
      `${one.name} carries ${standing} person steps already, so split it: hand back --became <ticket>.`,
    );
    return { path: "" };
  }
  return inserted(it, one, before, `person-${standing + 1}`, {
    does: "answers the question the engine asks",
    // A cloud box answers its own questions, so the step it inserts waits for nobody. [[spec/guidance/cloud]]
    by: it.cloud ? "anyone" : "person",
    to: "engine",
    asks,
    evidence: [
      {
        name: "answer",
        form: options ? "choice" : "text",
        says: "the answer, which the step behind this one reads",
        ...(options ? { options } : {}),
      },
    ],
  });
}

// [[spec/design_output/pull#a-person-step-goes-in]]
function stepsNamed(one, kind) {
  const held = new RegExp(`^${kind}(-\\d+)?$`);
  return walkOf(frontOf(one.text)).filter((step) => held.test(step.name)).length;
}

// [[spec/design_output/pull#a-person-step-goes-in]]
function inserted(it, one, before, name, said) {
  const steps = structuredClone(frontOf(one.text).steps ?? []);
  const parts = before.split("/");
  let list = steps;
  for (const part of parts.slice(0, -1)) {
    const phase = list.find((held) => String(held?.name) === part);
    if (!phase) return { path: "" };
    phase.steps = [phase.steps ?? []].flat();
    list = phase.steps;
  }
  const at = list.findIndex((held) => String(held?.name) === parts.at(-1));
  if (at < 0) return { path: "" };
  list.splice(at, 0, { name, ...said });

  const path = [...parts.slice(0, -1), name].join("/");
  const schema = schemasHere(it).get("ticket");
  const text = schema ? reRouted(one.text, schema, steps, "") : one.text;
  one.text = withField(withField(text, "step", path), "state", OPEN);
  return { path };
}

// [[spec/design_output/pull#the-pass]]
// [[spec/design_output/pull#the-refused-commit]]

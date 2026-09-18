import { inCloud } from "../../.claude/skills/level0/lib/cloud.js";
import { entryNamed, reRouted } from "../../.claude/skills/level0/lib/schema.js";
import { writesHere } from "../../.claude/skills/level0/lib/ticket.js";
import { TRUNK } from "../../.claude/skills/level0/lib/trunk.js";

export { HELPER, SPAWN, spawnPrompt } from "./spawn.js";

import {
  CLOSED,
  fieldOf,
  frontOf,
  GROUP,
  isGroup,
  NOTE_END,
  OPEN,
  TICKETS,
  ticketNamed,
  withEntry,
  withField,
} from "./group.js";
import { noteRows, readsOf, writeHold } from "./guidance-hand.js";
import { landed } from "./landed.js";
import { workAnswer } from "./pull-chapter.js";
import {
  DONE,
  ENGINE,
  holdsVerb,
  leafOf,
  leavesOf,
  MOST_MOVES,
  say,
  WAIT,
  walkOf,
} from "./pull-route.js";
import { entriesOf, pushed, returnsOf, shut, target, tipOf } from "./pull-writes.js";
import { HELPER, SPAWN, spawnPrompt, unblockPrompt } from "./spawn.js";
import { NOTES, schemasHere } from "./ticket.js";

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

export const URGENCY = ["now", "soon", "whenever"];

export function sorted(list) {
  return [...list].sort(
    (a, b) =>
      URGENCY.indexOf(urgency(a.text)) - URGENCY.indexOf(urgency(b.text)) ||
      a.name.localeCompare(b.name),
  );
}

export function urgency(text) {
  const said = fieldOf(text, "urgency");
  return URGENCY.includes(said) ? said : "soon";
}

// [[spec/design_output/pull#what-a-hand-out-reads]]
export function handOut(it, who) {
  repairPersonSteps(it, who);
  const all = ticketsHere(it);
  const groupTicket = all.find((one) => !one.private && one.name === who.group);
  // The tag says the next pull hands it first, on a note and on a ticket alike. [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
  const tagged = all.filter((one) => String(one.front.todo) === "true");
  const privates = all.filter(
    (one) => one.private && String(one.front.todo) !== "true",
  );
  // [[spec/design_output/pull#the-engine-takes-the-branch]]
  const pools = who.group
    ? [
        tagged,
        sorted(childrenOf(all, who.group)),
        groupTicket ? [groupTicket] : [],
        sorted(privates),
      ]
    : [tagged, sorted(freeIn(all)), sorted(privates)];
  if (!who.group) cutForGroups(it, all);
  // A name on the pull asks for one ticket, so the pools carry that one alone. [[spec/design_output/pull#the-hand-out]]
  const asked = who.wanted
    ? pools.map((pool) => pool.filter((one) => one.name === who.wanted))
    : pools;

  const why = [];
  let other = null;
  let person = null;
  for (const pool of asked) {
    for (const one of pool) {
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

// A desk takes a group on two roads alone: the owner names it, or its urgency reads now. [[spec/design_output/pull#the-engine-takes-the-branch]]
export function namedGroup(it, name) {
  const one = ticketsHere(it).find((held) => !held.private && held.name === name);
  return one && isGroup(one.text) ? name : "";
}

export function urgentGroup(it) {
  const groups = ticketsHere(it).filter(
    (one) =>
      !one.private &&
      isGroup(one.text) &&
      fieldOf(one.text, "state") === OPEN &&
      urgency(one.text) === "now",
  );
  return sorted(groups)[0]?.name ?? "";
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
  if (String(front.state ?? "") !== OPEN) return "";
  // The offer waits on a dependency, so this waits on it too. [[spec/design_output/work#a-dependency-waits-for-trunk]]
  if (dependsOn(front).some((dep) => !closedHere(it, all, dep))) return "";
  const path = String(front.step ?? "").trim() || (leavesOf(front)[0]?.path ?? "");
  const leaf = leafOf(front, path);
  if (!leaf) return "";
  // [[spec/tickets/the-one-answer-takes-shape]]
  if (!writesHere(leaf, handRule(it, front, all, group)).writes) return "";
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

  const moved = advanced(it, who, one, all);
  if (moved.why) return { why: moved.why };
  if (!moved.leaf) return {};
  return admits(it, who, one, moved.leaf, all);
}

export function dependsOn(front) {
  return [front?.depends_on ?? []]
    .flat()
    .flatMap((one) => String(one).split(","))
    .map((one) =>
      one
        .trim()
        .replace(/^\[|\]$/g, "")
        .replace(/^["']|["']$/g, "")
        .trim(),
    )
    .filter(Boolean);
}

// [[spec/design_output/pull#children-before-their-group]]
export function closedHere(it, all, dep) {
  const here = all.find((one) => one.name === dep);
  if (here) return fieldOf(here.text, "state") === CLOSED;
  const said = it.git.run(["show", `origin/${TRUNK}:${TICKETS}/${dep}.md`], true);
  if (!said.ok) return true;
  return fieldOf(said.out, "state") === CLOSED;
}

// [[spec/design_output/pull#a-condition-skips-a-leaf]]
export function advanced(it, who, one, all) {
  let text = one.text;
  let front = one.front;
  let path = String(front.step ?? "").trim() || (leavesOf(front)[0]?.path ?? "");
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
        const left = entriesOf(front)
          .filter((entry) => String(entry.step) === leaf.path)
          .at(-1);
        const again = left?.skipped && String(left.hand ?? "") === who.hand;
        if (!leaf.leaves[leaf.at + 1] || again)
          return { why: `waits for ${said.open.join(", ")}` };
        text = withEntry(text, {
          step: leaf.path,
          hand: who.hand,
          skipped: true,
          why: `the box leaves it while ${said.open.join(", ")} stand open`,
        });
        changes.push(`leaves ${leaf.path}`);
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
        landed(it, one, changes);
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
      landed(it, one, changes.concat(`closes ${DONE}`));
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
  const said = writesHere(leaf, handRule(it, one.front, all, who.group));
  if (!said.writes) return { why: said.why, ...(said.person ? { person: leaf } : {}) };
  const lacking = leaf.needs.filter((need) => !holdsVerb(need));
  if (lacking.length)
    return { why: `needs ${lacking.join(", ")}, which this box lacks` };
  const other = excludes(one.front, leaf, who.hand);
  if (other) return { why: other, other: leaf };
  return { leaf };
}

// The hand the one answer reads: who this is, and what the group stands at. [[spec/tickets/the-one-answer-takes-shape]]
export function handRule(it, front, all, group) {
  return {
    agent: Boolean(it.agent),
    ownerSays: Boolean(it.ownerSays),
    cloud: inCloud(it.env ?? process.env),
    atRetro: String(front?.todo) === "true" || atRetro(all ?? [], group),
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
  if (wrote.some((one) => String(one.hand ?? "") === hand)) {
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
    landed(it, one, ["a person step names the engine as its reader"]);
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

// A count says two hands disagree, and another hand settles that, because a person waiting on a call the box owns costs a whole session. [[spec/design_output/pull#a-settle-step-goes-in]]
export function withSettleStep(it, one, before, asks) {
  const standing = stepsNamed(one, "settle");
  const most = Number(it.splits);
  if (most > 0 && standing >= most) return withPersonStep(it, one, before, asks);
  return inserted(it, one, before, `settle-${standing + 1}`, {
    does: "decides between the step and the findings, and writes why",
    by: "anyone",
    to: "engine",
    asks,
    evidence: [
      { name: "answer", form: "text", says: "the decision, and why it stands" },
    ],
  });
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
    by: "person",
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

// The pull. One verb hands a hand the next leaf of a ticket, and the same verb
// takes the leaf back with a verdict. The engine checks the hand-back, writes
// the record, moves the step, commits, pushes, and hands out the next leaf.
// [[spec/design_output/pull#the-answers]]

import { actionables } from "../../.claude/skills/level0/lib/guidance.js";
import {
  checkNote,
  entriesIn,
  entryNamed,
  hashOf,
  readNote,
  reRouted,
} from "../../.claude/skills/level0/lib/schema.js";
import { shortOf } from "../../.claude/skills/level0/lib/runs.js";
import { TRUNK } from "../../.claude/skills/level0/lib/trunk.js";
import { CONFIG as VALE_CONFIG, faultIn, fromJson } from "../../.claude/skills/level0/lib/vale.js";
import { agentOf, BOX, handOf } from "./hand.js";
import {
  CLOSED,
  fieldOf,
  frontOf,
  GROUP,
  isGroup,
  NOTE_END,
  OPEN,
  recordIn,
  ticketNamed,
  TICKETS,
  withEntry,
  withField,
} from "./group.js";
import { NOTES, schemasHere } from "./ticket.js";
import { landed, unlandedRows } from "./landed.js";
import { changedIn } from "./work.js";
export const HOLDS = ".se/hold";
export const WORK = "work";
export const REFUSED = "refused";
export const WAIT = "wait";
export const ENGINE = "the engine";
const MOST_MOVES = 64;
const CUT = { said: 120, error: 160 };
const DONE = "done";
const CHECKED = "checked";
const COMMENT = /^\s*<!--.*-->\s*$/;
const ANSWERED = /^\s*answered:/;
const FENCE = /^\s*(```|~~~)/;

// [[spec/design_output/pull#a-need-is-a-verb]]
export const VERBS = {
  branch: [
    "new",
    "take",
    "sync",
    "done",
    "release",
    "merge",
    "close",
    "read",
    "review",
    "list",
    "pull",
    "test",
  ],
  work: [
    "new",
    "take",
    "sync",
    "done",
    "release",
    "merge",
    "close",
    "read",
    "review",
    "list",
    "pull",
    "test",
  ],
  ticket: ["note", "update", "open"],
  retro: ["notes"],
};

// [[spec/design_output/pull#a-need-is-a-verb]]
export function holdsVerb(need, verbs = VERBS) {
  const [verb, sub] = String(need ?? "")
    .trim()
    .split(/\s+/);
  if (!verbs[verb]) return false;
  return !sub || verbs[verb].includes(sub);
}

export { agentOf, BOX, handOf };

// [[spec/design_output/pull#the-hand-and-the-hold]]
export function holdAt(it, hand) {
  const slug = String(hand).replace(/[^A-Za-z0-9]+/g, "-");
  return it.join(it.root, ...`${HOLDS}/${slug}.json`.split("/"));
}

export function holdOf(it, hand) {
  const at = holdAt(it, hand);
  return it.disk.exists(at) ? parsed(it.disk.read(at)) : null;
}

export function parsed(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function writeHold(it, hand, hold) {
  it.disk.makeDir(it.join(it.root, ...HOLDS.split("/")));
  it.disk.write(holdAt(it, hand), `${JSON.stringify(hold, null, 2)}\n`);
}

function dropHold(it, hand) {
  const at = holdAt(it, hand);
  if (it.disk.exists(at)) it.disk.remove(at);
}

// [[spec/design_output/pull#a-leaf-inherits]]
export function walkOf(front) {
  return entriesIn(front?.steps, "steps");
}

export function leavesOf(front) {
  return walkOf(front).filter((one) => one.leaf);
}

// [[spec/design_output/pull#a-leaf-inherits]]
export function leafOf(front, path) {
  const walk = walkOf(front);
  const leaf = walk.find((one) => one.path === path && one.leaf);
  if (!leaf) return null;

  const parts = leaf.path.split("/");
  const chain = [];
  for (let i = 1; i < parts.length; i++) {
    const found = walk.find((one) => one.path === parts.slice(0, i).join("/"));
    if (found) chain.push(found);
  }
  chain.push(leaf);

  const nearest = (key) => {
    for (let i = chain.length - 1; i >= 0; i--) {
      if (chain[i].said[key] !== undefined) return chain[i].said[key];
    }
    return undefined;
  };
  const sum = (key) =>
    chain
      .flatMap((one) => [one.said[key] ?? []].flat())
      .filter((one) => one !== undefined && one !== null && String(one).trim())
      .map((one) => String(one).trim());

  const leaves = walk.filter((one) => one.leaf);
  return {
    ...leaf,
    by: String(nearest("by") ?? "anyone"),
    not: nearest("not") === undefined ? "" : String(nearest("not")),
    on_fail: nearest("on_fail") === undefined ? "" : String(nearest("on_fail")),
    when: String(leaf.said.when ?? ""),
    does: String(leaf.said.does ?? ""),
    asks: String(leaf.said.asks ?? ""),
    options: [leaf.said.options ?? []].flat().map(String),
    reads: sum("reads").map(bare),
    needs: sum("needs"),
    checklist: sum("checklist"),
    evidence: [leaf.said.evidence ?? []].flat().filter((one) => one?.name),
    at: leaves.findIndex((one) => one.path === path),
    of: leaves.length,
    walk,
    leaves,
  };
}

// [[spec/design_output/pull#the-hand-out]]
export function pull(it, argv) {
  const rest = (argv ?? []).slice(1);
  const name = positionalOf(rest);
  const as = flagValue(rest, "--as");
  const verdict = verdictFlag(rest);
  if (verdict.why) {
    console.error(verdict.why);
    return 2;
  }

  const branch = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out;
  const onTrunk = branch === TRUNK;
  if (!onTrunk && !branch.startsWith("work/")) {
    console.error(`branch pull runs on ${TRUNK} or a work branch, and this is ${branch}.`);
    console.error(`Run ./RUNME.sh branch pull from ${TRUNK}, which hands out work there.`);
    return 2;
  }
  const group = onTrunk ? "" : branch.replace(/^work\//, "");
  const hand = as ? `${handOf(it)} · ${as}` : handOf(it);
  const held = holdOf(it, hand);
  const who = { hand, branch, group, held, oneStep: Boolean(as) };
  it.argv = rest;

  if (rest.includes("--judge")) return judgeMaterial(it, held, name);
  if (rest.includes("--drop")) return dropped(it, who);
  if (verdict.said === "back") return takeBack(it, who, name, verdict.reason);
  // A name on trunk that is a group takes its branch, and any other name hands a ticket back. [[spec/design_output/pull#the-engine-takes-the-branch]]
  const named = onTrunk && name && !verdict.said ? namedGroup(it, name) : "";
  if (!named && (verdict.said || name)) return handBack(it, who, name, verdict);
  if (held) {
    say(REFUSED, [
      `${held.ticket} stands in your hand at ${held.step}, and one hand holds one ticket.`,
      `Hand it back: ./RUNME.sh branch pull ${held.ticket} --pass, or --fail "why".`,
    ]);
    return 1;
  }
  // [[spec/design_output/pull#the-engine-takes-the-branch]]
  if (onTrunk && it.take) {
    if (it.cloud && !named) return it.take();
    const wanted = named || urgentGroup(it);
    if (wanted || it.ready?.()) return wanted ? it.take(wanted) : 0;
  }
  if (!fetched(it, branch)) return 1;
  return handOut(it, who);
}

// [[spec/design_output/pull#a-hand-of-its-own]]
const TAKES = ["--as", "--fail", "--became", "--back", "--fields"];

function positionalOf(rest) {
  for (let i = 0; i < rest.length; i++) {
    const one = rest[i];
    if (one.startsWith("--")) {
      if (TAKES.includes(one)) i++;
      continue;
    }
    return one;
  }
  return "";
}

function flagValue(rest, flag) {
  const at = rest.indexOf(flag);
  if (at >= 0) return String(rest[at + 1] ?? "").trim();
  const inline = rest.find((one) => one.startsWith(`${flag}=`));
  return inline ? inline.slice(flag.length + 1).trim() : "";
}

// [[spec/design_output/pull#the-hand-and-the-hold]]
function dropped(it, who) {
  if (!who.held) {
    say(WAIT, ["nothing stands in your hand, so nothing drops."]);
    return 0;
  }
  dropHold(it, who.hand);
  say(WORK, [
    `the hold drops, and ${who.held.ticket} stays at ${who.held.step} for the next pull.`,
  ]);
  return 0;
}

// [[spec/design_output/pull#the-checks]]
function judgeMaterial(it, held, name) {
  if (!held || (name && name !== held.ticket)) {
    console.log("null");
    return 1;
  }
  const at = it.join(it.root, ...held.path.split("/"));
  if (!it.disk.exists(at)) {
    console.log("null");
    return 1;
  }
  const text = it.disk.read(at);
  const leaf = leafOf(frontOf(text), held.step);
  const chapter = chapterOf(text, held.step);
  const evidence = [
    ...chapter.own,
    ...[...chapter.fields].flatMap(([field, rows]) => [`${field}:`, ...rows]),
  ].join("\n");
  const rules = (leaf?.reads ?? []).flatMap((path) => actionables(guidanceText(it, path)));
  console.log(JSON.stringify({ ticket: held.ticket, step: held.step, evidence, rules }));
  return 0;
}

// [[spec/design_output/pull#the-hand-out]]
function verdictFlag(rest) {
  const said = rest.find((one) => /^--(pass|fail|became|back)(=|$)/.test(one));
  if (!said) return { said: "" };
  const [, word, eq, inline] = /^--(pass|fail|became|back)(=)?(.*)$/.exec(said);
  const after = eq ? inline : (rest[rest.indexOf(said) + 1] ?? "");
  if (word === "pass") return { said: "pass" };
  if (!after || after.startsWith("--")) {
    const takes = { fail: "a reason", became: "the successor", back: "the leaf" }[word];
    return { why: `--${word} takes ${takes}: --${word} "..."` };
  }
  return { said: word, reason: after };
}

// [[spec/design_output/pull#the-pull-fetches-first]]
function fetched(it, branch) {
  it.git.run(["fetch", "origin", branch], true);
  const behind = it.git.run(
    ["rev-list", "--count", `HEAD..origin/${branch}`],
    true,
  ).out;
  if (!behind || behind === "0") return true;
  if (it.git.run(["merge", "--ff-only", `origin/${branch}`], true).ok) return true;
  say(REFUSED, [
    `origin/${branch} holds ${behind} commit(s) this box lacks, and the two diverge.`,
    `Run git pull --rebase origin ${branch}, then pull again.`,
  ]);
  return false;
}

// [[spec/design_output/pull#what-a-hand-out-reads]]
function ticketsHere(it) {
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

const URGENCY = ["now", "soon", "whenever"];

function sorted(list) {
  return [...list].sort(
    (a, b) =>
      URGENCY.indexOf(urgency(a.text)) - URGENCY.indexOf(urgency(b.text)) ||
      a.name.localeCompare(b.name),
  );
}

function urgency(text) {
  const said = fieldOf(text, "urgency");
  return URGENCY.includes(said) ? said : "soon";
}

// [[spec/design_output/pull#what-a-hand-out-reads]]
function handOut(it, who) {
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
    ? [tagged, sorted(childrenOf(all, who.group)), groupTicket ? [groupTicket] : [], sorted(privates)]
    : [tagged, sorted(freeIn(all)), sorted(privates)];
  if (!who.group) cutForGroups(it, all);

  const why = [];
  let other = null;
  for (const pool of pools) {
    for (const one of pool) {
      const said = offer(it, who, one, all);
      if (said.leaf) return handed(it, who, one, said.leaf);
      if (said.why) why.push(`${one.name} ${said.why}`);
      if (said.other && !other) other = { one, leaf: said.other, why: said.why };
    }
    if (other && !who.oneStep) return spawnAnswer(other);
  }

  say(WAIT, why.length ? why : ["no ticket of this group stands open"]);
  return 0;
}

// A free ticket stands in no group and is no group, so a desk works it on trunk. [[spec/design_output/pull#the-engine-takes-the-branch]]
export function freeIn(all) {
  return all.filter(
    (one) => !one.private && !fieldOf(one.text, GROUP) && !isGroup(one.text),
  );
}

// An open group works on a branch, so a desk cuts one where none stands and leaves the group to the cloud. [[spec/design_output/pull#the-engine-takes-the-branch]]
function cutForGroups(it, all) {
  const stands = new Set(
    it.git
      .run(["ls-remote", "--heads", "origin", "work/*"], true)
      .out.split("\n")
      .filter(Boolean)
      .map((row) => row.split("\t")[1]?.replace("refs/heads/", "") ?? ""),
  );
  for (const one of all) {
    if (one.private || !isGroup(one.text) || fieldOf(one.text, "state") !== OPEN) continue;
    const branch = `work/${one.name}`;
    if (stands.has(branch)) continue;
    if (!it.git.run(["branch", branch, TRUNK], true).ok) continue;
    it.git.run(["push", "-u", "origin", branch], true);
    console.log(`${branch} is cut and pushed, because a group works on a branch and the cloud takes it.`);
  }
}

// A desk takes a group on two roads alone: the owner names it, or its urgency reads now. [[spec/design_output/pull#the-engine-takes-the-branch]]
function namedGroup(it, name) {
  const one = ticketsHere(it).find((held) => !held.private && held.name === name);
  return one && isGroup(one.text) ? name : "";
}

function urgentGroup(it) {
  const groups = ticketsHere(it).filter(
    (one) =>
      !one.private &&
      isGroup(one.text) &&
      fieldOf(one.text, "state") === OPEN &&
      urgency(one.text) === "now",
  );
  return sorted(groups)[0]?.name ?? "";
}

// [[spec/design_output/pull#a-hand-of-its-own]]
export const SPAWN = "spawn";
export const HELPER = "helper";

function spawnAnswer(other) {
  const helper = `${HELPER}-${entriesOf(other.one.front).length + 1}`;
  say(SPAWN, [
    `${other.one.name} at ${other.leaf.path} ${other.why}.`,
    "Spawn a hand of its own with the prompt below, and pull again once it answers.",
  ]);
  console.log("");
  console.log(spawnPrompt(other.one.name, other.leaf, helper));
  return 0;
}

// [[spec/design_output/pull#a-hand-of-its-own]]
export function spawnPrompt(ticket, leaf, helper) {
  const verdict = leaf.evidence.some((field) => field.form === "verdict");
  const back = verdict
    ? `./RUNME.sh branch pull ${ticket} --as ${helper}`
    : `./RUNME.sh branch pull ${ticket} --as ${helper} --pass, or --fail "why"`;
  return [
    `You are a hand of your own on this box, named ${helper}, and you work one step of one ticket.`,
    "",
    `1. Run \`./RUNME.sh branch pull --as ${helper}\` from the root. It hands you ${ticket} at ${leaf.path}, with its fields and its guidance.`,
    "2. Write the fields into the ticket where the answer says, under the headings it names, and change nothing else.",
    `3. Run \`${back}\`. It checks the hand-back and answers done, or refused with what to fix.`,
    "4. Answer with what the last pull said, word for word.",
  ].join("\n");
}

// [[spec/design_output/pull#done-leaves-no-takeable-step]]
export function takeable(it, one) {
  const front = frontOf(one.text);
  if (String(front.state ?? "") !== OPEN) return "";
  const path = String(front.step ?? "").trim() || (leavesOf(front)[0]?.path ?? "");
  const leaf = leafOf(front, path);
  if (!leaf) return "";
  if (["person", "children", "helper"].includes(leaf.by)) return "";
  if (leaf.by === "agent" && !it.agent) return "";
  if (leaf.needs.some((need) => !holdsVerb(need))) return "";
  return leaf.path;
}

// [[spec/design_output/pull#what-a-hand-out-reads]]
function offer(it, who, one, all) {
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

function dependsOn(front) {
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
function closedHere(it, all, dep) {
  const here = all.find((one) => one.name === dep);
  if (here) return fieldOf(here.text, "state") === CLOSED;
  const said = it.git.run(["show", `origin/${TRUNK}:${TICKETS}/${dep}.md`], true);
  if (!said.ok) return true;
  return fieldOf(said.out, "state") === CLOSED;
}

// [[spec/design_output/pull#a-condition-skips-a-leaf]]
function advanced(it, who, one, all) {
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
          return child && takeable(it, child);
        });
        if (busy.length) return { why: `waits for ${busy.join(", ")}, which a hand can take` };
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
function holdsHere(it, when, front) {
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
function admits(it, who, one, leaf, all) {
  if (leaf.by === "person" && it.agent)
    return { why: `waits for a person at ${leaf.path}` };
  if (leaf.by === "agent" && !it.agent)
    return { why: `waits for an agent at ${leaf.path}` };
  if (leaf.by === "helper")
    return { why: `waits for a hand the engine spawns at ${leaf.path}` };
  if (leaf.by === "retro" && String(one.front.todo) !== "true" && !atRetro(all, who.group)) {
    return { why: `waits for a hand at a retro step, at ${leaf.path}` };
  }
  const lacking = leaf.needs.filter((need) => !holdsVerb(need));
  if (lacking.length)
    return { why: `needs ${lacking.join(", ")}, which this box lacks` };
  const other = excludes(one.front, leaf, who.hand);
  if (other) return { why: other, other: leaf };
  return { leaf };
}

function atRetro(all, group) {
  const one = all.find((held) => !held.private && held.name === group);
  return one ? String(one.front.step ?? "").startsWith("retro") : false;
}

// [[spec/design_output/pull#the-hand-rule]]
function excludes(front, leaf, hand) {
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
function handed(it, who, one, leaf) {
  const hash = one.private ? "" : tipOf(it);
  const reads = leaf.reads.map((path) => ({
    name: path,
    hash: hashOf(guidanceText(it, path)),
  }));
  writeHold(it, who.hand, {
    ticket: one.name,
    path: one.path,
    step: leaf.path,
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
export function workAnswer(it, one, leaf) {
  const rows = [];
  const phase = leaf.parent ? ` under ${leaf.parent}` : "";
  rows.push(
    `${WORK}  ${one.name} at ${leaf.path}, leaf ${leaf.at + 1} of ${leaf.of}${phase}`,
  );
  if (leaf.does) rows.push(`      ${leaf.does}`);
  rows.push("", "# Ask", "", askOf(one.text) || "(the ask stands empty)", "");

  const deep = "#".repeat(leaf.path.split("/").length);
  rows.push(`Write under ${deep} ${leaf.name} in ${one.path}, one heading a field:`);
  for (const field of leaf.evidence) {
    const more = field.expects !== undefined ? `, expects ${field.expects}` : "";
    const options = field.options
      ? `, one of ${[field.options].flat().join(", ")}`
      : "";
    rows.push(
      `  ${deep}# ${field.name}  ${field.form}${more}${options}: ${field.says ?? ""}`,
    );
  }
  if (leaf.checklist.length) {
    rows.push(
      `  ${deep}# ${CHECKED}  one line per item below, on how you take it into account`,
    );
    rows.push("", "Checklist:");
    for (const item of leaf.checklist) rows.push(`  - ${item}`);
  }
  if (leaf.asks) rows.push("", `Asks: ${leaf.asks}`);

  for (const path of leaf.reads) {
    const items = actionables(guidanceText(it, path));
    if (!items.length) continue;
    rows.push("", `Reads ${path}:`);
    for (const [i, item] of items.entries()) rows.push(`  ${i + 1}. ${item}`);
  }

  rows.push("");
  if (leaf.evidence.some((field) => field.form === "verdict")) {
    rows.push(
      `Hand it back with ./RUNME.sh branch pull ${one.name}, and the verdict field decides.`,
    );
  } else {
    rows.push(
      `Hand it back: ./RUNME.sh branch pull ${one.name} --pass, or --fail "why", or --became <ticket>.`,
    );
  }
  return rows.join("\n");
}

function askOf(text) {
  const said = readNote(text).sections.find(
    (one) => one.header.toLowerCase() === "ask",
  );
  return said
    ? said.own
        .filter((row) => !COMMENT.test(row))
        .join("\n")
        .trim()
    : "";
}

function guidanceText(it, path) {
  const at = it.join(it.root, ...`${path}.md`.split("/"));
  return it.disk.exists(at) ? it.disk.read(at) : "";
}


// [[spec/design_output/pull#a-leaf-comes-back]]
function takeBack(it, who, name, path) {
  if (who.held) {
    say(REFUSED, [`${who.held.ticket} stands in your hand at ${who.held.step}. Hand it back first.`]);
    return 1;
  }
  if (!name) {
    say(REFUSED, ["--back names the ticket and the leaf: branch pull <ticket> --back <leaf>"]);
    return 1;
  }
  if (!fetched(it, who.branch)) return 1;
  const one = ticketsHere(it).find((held) => held.name === name);
  if (!one) {
    say(REFUSED, [`${name} stands nowhere under ${TICKETS} or ${NOTES}.`]);
    return 1;
  }
  const leaf = leafOf(one.front, path);
  if (!leaf) {
    say(REFUSED, [`${path} names no leaf of ${name}.`]);
    return 1;
  }
  const wrote = entriesOf(one.front)
    .filter((entry) => String(entry.step) === path && !entry.skipped)
    .at(-1);
  if (!wrote || String(wrote.hand ?? "") !== who.hand) {
    say(REFUSED, [`${path} carries no hand-back by ${who.hand}, so it is another hand's or nobody's.`]);
    return 1;
  }
  const tip = one.private ? "" : tipOf(it);
  const text = withEntry(one.text, {
    step: path,
    hand: who.hand,
    hash_before: tip,
    hash_after: tip,
    returns: returnsOf(one.front, path) + 1,
    why: "the hand takes it back",
  });
  one.text = withField(withField(text, "step", path), "state", OPEN);
  landed(it, one, [`${who.hand} takes ${path} back`]);
  if (!one.private && !pushed(it, who.branch)) {
    say(REFUSED, [`${who.branch} moves under this take-back, and one rebase fell short. Pull again.`]);
    return 1;
  }
  say(WORK, [`${name} stands at ${path} again, and the next pull hands it out.`]);
  return handOut(it, who);
}

// [[spec/design_output/pull#the-hand-back]]
function handBack(it, who, name, verdict) {
  const held = who.held;
  if (!held) {
    say(REFUSED, [
      "nothing stands in your hand. Run ./RUNME.sh branch pull to take a leaf.",
    ]);
    return 1;
  }
  if (name && name !== held.ticket) {
    say(REFUSED, [
      `${held.ticket} stands in your hand, and ${name} is another ticket.`,
    ]);
    return 1;
  }
  if (!held.path.startsWith(NOTES) && !fetched(it, who.branch)) return 1;

  const at = it.join(it.root, ...held.path.split("/"));
  if (!it.disk.exists(at)) {
    say(REFUSED, [`${held.path} stands nowhere, so nothing hands back.`]);
    dropHold(it, who.hand);
    return 1;
  }
  const one = {
    name: held.ticket,
    path: held.path,
    at,
    private: held.path.startsWith(NOTES),
  };
  one.text = it.disk.read(at);
  one.front = frontOf(one.text);


  // [[spec/design_output/pull#the-hand-back-matches-the-hold]]
  const done = recordIn(one.text).find(
    (entry) =>
      String(entry.step) === held.step &&
      !entry.skipped &&
      entry.hash_after &&
      String(entry.hash_before ?? "") === held.hash,
  );
  if (done) {
    if (!one.private && !pushed(it, who.branch)) {
      say(REFUSED, [
        `${who.branch} moves under this hand-back. Pull again to push it.`,
      ]);
      return 1;
    }
    return onward(it, who, [
      `${held.ticket} at ${held.step} answered already, and the record holds it.`,
    ]);
  }
  if ((fieldOf(one.text, "step") || leavesOf(one.front)[0]?.path) !== held.step) {
    dropHold(it, who.hand);
    say(REFUSED, [
      `${held.ticket} stands at ${fieldOf(one.text, "step") || "no step"} now, and the hold names ${held.step}.`,
      "The take is stale, so the hold drops. Pull again.",
    ]);
    return 1;
  }
  if (
    held.hash &&
    !it.git.run(["merge-base", "--is-ancestor", held.hash, "HEAD"], true).ok
  ) {
    dropHold(it, who.hand);
    say(REFUSED, [
      `the take hash ${shortOf(held.hash)} trails ${who.branch}, so the hold drops. Pull again.`,
    ]);
    return 1;
  }

  const leaf = leafOf(one.front, held.step);
  if (!leaf) {
    say(REFUSED, [`${held.step} names no leaf of ${held.ticket}.`]);
    return 1;
  }

  // A payload rides the hold until the checks pass, so a refused word reaches no disk. [[spec/design_output/pull#the-fields-ride-the-payload]]
  const payload = flagValue(it.argv ?? [], "--fields") || held.payload || "";
  if (payload) {
    const put = withPayload(one.text, held.step, payload);
    if (put.why) {
      say(REFUSED, [put.why]);
      return 1;
    }
    Object.assign(one, { stood: one.text, payload });
    one.text = put.text;
    one.front = frontOf(one.text);
  }
  const verdictField = leaf.evidence.find((field) => field.form === "verdict");
  if (verdictField && verdict.said) {
    say(REFUSED, [
      `${leaf.path} holds the verdict field ${verdictField.name}, so the field decides and the flag stays off.`,
    ]);
    return 1;
  }

  // [[spec/design_output/pull#the-checks]]
  const found = [];
  const schema = schemasHere(it).get("ticket");
  if (schema) {
    for (const fault of checkNote(one.text, schema, held.path, schemasHere(it))) {
      found.push(`${held.path}:${fault.line} ${fault.message}`);
    }
  }
  const chapter = chapterOf(one.text, leaf.path);
  // A became leaves the leaf's fields to the successor, so the hold and the hand alone decide. [[spec/design_output/pull#became]]
  const becomes = verdict.said === "became";
  if (!becomes) {
    found.push(...formFaults(it, one, leaf, chapter, held));
    if (!found.length) found.push(...voiceFaults(it, one, leaf, chapter));
  }
  const answered = found.length || becomes ? [] : commandsRun(it, leaf, chapter, found);
  found.push(...handFaults(it, one, leaf, who.hand, held));

  if (found.length) return refused(it, who, one, leaf, held, found);

  const said = verdictField
    ? verdictIn(chapter.fields.get(verdictField.name) ?? [])
    : { said: verdict.said || "pass", reason: verdict.reason ?? "" };

  if (said.said === "became")
    return became(it, who, one, leaf, held, said.reason, answered);
  if (said.said === "fail")
    return failed(it, who, one, leaf, held, said.reason, answered);
  return passed(it, who, one, leaf, held, answered);
}

// [[spec/design_output/pull#the-hand-back-refused]]
function refused(it, who, one, leaf, held, found) {
  const count = Number(held.refused ?? 0) + 1;
  if (Number(it.refusals) > 0 && count >= Number(it.refusals)) {
    if (one.stood) one.text = one.stood;
    const put = withPersonStep(
      it,
      one,
      leaf.path,
      `the hand-back met refused ${count} times: ${found[0]}`,
    );
    const finding = put.path ? landed(it, one, [`${leaf.path} goes to a person at ${put.path}`]) : "";
    if (finding) found.push(`the hook refuses the commit, so the person step lands not: ${finding}`);
    if (put.path && !finding) {
      dropHold(it, who.hand);
      if (!one.private) pushed(it, who.branch);
      say(REFUSED, [...found, "", `${count} refusals in a row, so ${put.path} now waits for a person.`]);
      return 1;
    }
  }
  writeHold(it, who.hand, { ...held, refused: count, payload: one.payload ?? held.payload });
  say(REFUSED, [
    ...found,
    "",
    `Fix it, and ${one.name} stays in hand at ${leaf.path}.`,
  ]);
  return 1;
}

// [[spec/design_output/pull#the-fields-ride-the-payload]]
export function withPayload(text, path, payload) {
  const fields = parsed(payload);
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
    return { why: "--fields takes a JSON object, one key per field of the leaf in hand." };
  }
  let now = String(text ?? "");
  for (const [name, said] of Object.entries(fields)) {
    const put = withFieldText(now, path, name, String(said ?? ""));
    if (put.why) return put;
    now = put.text;
  }
  return { text: now };
}

// [[spec/design_output/pull#the-fields-ride-the-payload]]
function withFieldText(text, path, name, said) {
  const sections = readNote(text).sections;
  const leaf = sectionAt(sections, path);
  if (leaf < 0) return { why: `${path} holds no chapter to write ${name} into.` };
  const level = path.split("/").length + 1;
  let field = -1;
  for (let i = leaf + 1; i < sections.length; i++) {
    if (sections[i].level < level) break;
    if (sections[i].level === level && sections[i].header === name) {
      field = i;
      break;
    }
  }
  const rows = text.split(/\r?\n/);
  if (field < 0) {
    if (name !== CHECKED) return { why: `${path} holds no field ${name}.` };
    const end = chapterEnd(sections, leaf, level - 1, rows.length);
    rows.splice(end, 0, `${"#".repeat(level)} ${CHECKED}`, "", ...said.split("\n"), "");
    return { text: rows.join("\n") };
  }
  const start = sections[field].line;
  const end = chapterEnd(sections, field, level, rows.length);
  const kept = rows.slice(start, end).filter((row) => COMMENT.test(row));
  const gap = kept.length ? [""] : [];
  rows.splice(start, end - start, "", ...kept, ...gap, ...said.split("\n"), "");
  return { text: rows.join("\n") };
}

function sectionAt(sections, path) {
  const parts = path.split("/");
  let from = 0;
  let found = -1;
  for (let depth = 0; depth < parts.length; depth++) {
    const level = depth + 1;
    found = -1;
    for (let i = from; i < sections.length; i++) {
      if (sections[i].level < level && i > from) break;
      if (sections[i].level === level && sections[i].header === parts[depth]) {
        found = i;
        break;
      }
    }
    if (found < 0) return -1;
    from = found + 1;
  }
  return found;
}

function chapterEnd(sections, at, level, last) {
  for (let i = at + 1; i < sections.length; i++) {
    if (sections[i].level <= level) return sections[i].line - 1;
  }
  return last;
}

// [[spec/design_output/pull#the-fields-hold-their-forms]]
export function chapterOf(text, path) {
  const sections = readNote(text).sections;
  const parts = path.split("/");
  let from = 0;
  let found = -1;
  for (let depth = 0; depth < parts.length; depth++) {
    const level = depth + 1;
    found = -1;
    for (let i = from; i < sections.length; i++) {
      if (sections[i].level < level && i > from) break;
      if (sections[i].level === level && sections[i].header === parts[depth]) {
        found = i;
        break;
      }
    }
    if (found < 0) return { stands: false, own: [], fields: new Map() };
    from = found + 1;
  }

  const level = parts.length;
  const own = lines(sections[found].own);
  const fields = new Map();
  const rawOwn = prose(sections[found].own);
  const rawFields = new Map();
  for (let i = found + 1; i < sections.length; i++) {
    if (sections[i].level <= level) break;
    if (sections[i].level === level + 1) {
      fields.set(sections[i].header, lines(sections[i].own));
      rawFields.set(sections[i].header, prose(sections[i].own));
    }
  }
  return { stands: true, own, fields, rawOwn, rawFields };
}

function prose(own) {
  return (own ?? []).filter((row) => !COMMENT.test(row) && !ANSWERED.test(row));
}

function lines(own) {
  return (own ?? [])
    .filter(
      (row) =>
        row.trim() && !COMMENT.test(row) && !ANSWERED.test(row) && !FENCE.test(row),
    )
    .map((row) => row.trim());
}

// [[spec/design_output/pull#the-fields-hold-their-forms]]
function formFaults(it, one, leaf, chapter, held) {
  const out = [];
  if (!chapter.stands) return [`${one.path} holds no chapter for ${leaf.path}.`];

  for (const field of leaf.evidence) {
    const rows = chapter.fields.get(field.name);
    const where = `${field.name} under ${leaf.path}`;
    if (!rows) {
      out.push(`${where} stands as no heading, and its form is ${field.form}.`);
      continue;
    }
    out.push(...formFault(it, field, rows, where, one, held));
  }
  if (leaf.checklist.length) {
    const rows = chapter.fields.get(CHECKED) ?? [];
    if (rows.length < leaf.checklist.length) {
      out.push(
        `${CHECKED} under ${leaf.path} holds ${rows.length} line(s), and the checklist holds ${leaf.checklist.length} item(s).`,
      );
    }
  }
  return out;
}

// [[spec/design_output/pull#the-fields-hold-their-forms]]
function formFault(it, field, rows, where, one, held) {
  const form = String(field.form ?? "text");
  if (form === "text" || form === "list") {
    return rows.length
      ? []
      : [`${where} holds no ${form === "list" ? "item" : "text"}.`];
  }
  if (form === "command") {
    return rows.length === 1
      ? []
      : [`${where} holds ${rows.length} line(s), and a command is one line.`];
  }
  if (form === "link") {
    if (rows.length !== 1)
      return [`${where} holds ${rows.length} line(s), and a link is one.`];
    const said = bare(rows[0]);
    const at = it.join(it.root, ...said.split("/"));
    const note = it.join(it.root, ...`${said}.md`.split("/"));
    return it.disk.exists(at) || it.disk.exists(note)
      ? []
      : [`${where} names ${said}, which resolves nowhere.`];
  }
  if (form === "choice") {
    const options = [field.options ?? []].flat().map(String);
    if (rows.length !== 1)
      return [`${where} holds ${rows.length} line(s), and a choice is one word.`];
    return options.includes(rows[0])
      ? []
      : [`${where} reads ${rows[0]}, and the options are ${options.join(", ")}.`];
  }
  if (form === "files") {
    const named = new Set(rows.map((row) => row.replace(/^[-*]\s+/, "").trim()));
    const missing = changedSince(it, one, held).filter((path) => !named.has(path));
    if (!rows.length) return [`${where} names no file.`];
    return missing.length
      ? [`${where} leaves out ${missing.join(", ")}, which the branch changes.`]
      : [];
  }
  if (form === "checklist") {
    return rows.length ? [] : [`${where} holds no line.`];
  }
  if (form === "verdict") {
    const said = verdictIn(rows);
    if (!said.said)
      return [
        `${where} opens with pass or fail, and it reads ${rows[0] ?? "nothing"}.`,
      ];
    if (said.said === "fail" && !said.reason)
      return [`${where} fails with no finding under it.`];
    return [];
  }
  return [];
}

// [[spec/design_output/pull#the-fields-hold-their-forms]]
export function verdictIn(rows) {
  const first = String(rows[0] ?? "")
    .replace(/^[-*]\s+/, "")
    .trim();
  const word = first.split(/[\s:.,]+/)[0].toLowerCase();
  if (word !== "pass" && word !== "fail") return { said: "" };
  const rest = [first.slice(word.length).replace(/^[\s:.,]+/, ""), ...rows.slice(1)]
    .map((row) => row.replace(/^[-*]\s+/, "").trim())
    .filter(Boolean);
  return { said: word, reason: rest.join("; ") };
}

// [[spec/design_output/pull#the-voice-reads-the-evidence]]
function voiceFaults(it, one, leaf, chapter) {
  if (!it.vale) return [];
  const prose = new Set([CHECKED]);
  for (const field of leaf.evidence) {
    if (["text", "list", "checklist", "verdict"].includes(String(field.form))) {
      prose.add(String(field.name));
    }
  }
  const rows = [...(chapter.rawOwn ?? [])];
  for (const [name, held] of chapter.rawFields ?? []) {
    if (prose.has(name)) rows.push("", ...held);
  }
  const text = rows.join("\n");
  if (!text.trim()) return [];
  let ran;
  try {
    ran = it.proc.run(
      [it.vale, `--config=${VALE_CONFIG}`, `--path=${one.path}`, "--output=JSON", "--no-exit"],
      { stdin: text, cwd: it.root },
    );
  } catch {
    return [];
  }
  if (faultIn(ran.stdout)) return [];
  return fromJson(ran.stdout)
    .filter((fault) => fault.severity === "error")
    .map(
    (fault) => `${leaf.path} breaks ${fault.rule} at line ${fault.line} of its chapter: ${fault.message}`,
  );
}

// [[spec/design_output/pull#the-commands-answer]]
function commandsRun(it, leaf, chapter, found) {
  const out = [];
  for (const field of leaf.evidence) {
    if (String(field.form) !== "command") continue;
    const line = (chapter.fields.get(field.name) ?? [])[0] ?? "";
    let ran;
    try {
      ran = it.proc.run(["sh", "-c", line], { cwd: it.root });
    } catch (error) {
      found.push(
        `${field.name} under ${leaf.path} runs ${line}, and the box answers ${error.message}.`,
      );
      continue;
    }
    const rows = `${ran.stdout ?? ""}`.trim().split("\n").filter(Boolean);
    const last = rows.at(-1) ?? "";
    out.push({ name: field.name, exit: ran.exitCode, said: last.slice(0, CUT.said) });
    const want = field.expects;
    if (want === undefined || want === null || want === "") continue;
    const asNumber = Number(want);
    if (Number.isInteger(asNumber) && String(want).trim() !== "") {
      if (ran.exitCode !== asNumber) {
        found.push(
          `${field.name} under ${leaf.path} expects exit ${asNumber}, and ${line} answers ${ran.exitCode}: ${last}`,
        );
      }
      continue;
    }
    const word = last.split(/[\s:,.]+/)[0].toLowerCase();
    if (word !== String(want).toLowerCase()) {
      found.push(
        `${field.name} under ${leaf.path} expects ${want}, and ${line} answers ${last || "nothing"}`,
      );
    }
  }
  return out;
}

// [[spec/design_output/pull#the-hand-rule]]
function handFaults(it, one, leaf, hand, held) {
  const out = [];
  if (leaf.by === "person" && it.agent)
    out.push(`${leaf.path} is a person's step, and this hand is an agent.`);
  const other = excludes(one.front, leaf, hand);
  if (other) out.push(`${leaf.path} ${other}.`);
  if (leaf.evidence.some((field) => field.form === "verdict") && !one.private) {
    const tip = tipOf(it);
    if (held.hash && tip !== held.hash) {
      out.push(
        `a verdict comes from a hand that leaves the tip where it stands, and ${shortOf(held.hash)} moved to ${shortOf(tip)}.`,
      );
    }
  }
  return out;
}

// [[spec/design_output/pull#the-pass]]
function passed(it, who, one, leaf, held, answered) {
  const tip = one.private ? "" : tipOf(it);
  let text = withEntry(one.text, {
    step: leaf.path,
    hand: who.hand,
    hash_before: held.hash,
    hash_after: tip,
    answered,
  });
  const changes = [`passes ${leaf.path}`];

  let next = leaf.leaves[leaf.at + 1];
  while (next) {
    const when = holdsHere(it, String(next.said.when ?? ""), frontOf(text));
    if (when.holds) break;
    text = withEntry(text, { step: next.path, skipped: true, why: when.why });
    changes.push(`skips ${next.path}`);
    next = leaf.leaves[leaf.leaves.findIndex((one) => one.path === next.path) + 1];
  }

  if (next) {
    text = withField(withField(text, "step", next.path), "state", OPEN);
  } else {
    const waiting = childrenWaiting(it, one, frontOf(text));
    if (waiting) {
      text = withField(withField(text, "step", waiting.path), "state", OPEN);
      changes.push(`returns to ${waiting.path}, because ${waiting.why}`);
    } else {
      text = shut(text, frontOf(text), DONE);
      changes.push(`closes ${DONE}`);
    }
  }

  one.text = text;
  const finding = landed(it, one, changes);
  if (finding) return unlanded(one, leaf, finding);
  dropHold(it, who.hand);
  if (!one.private && !pushed(it, who.branch)) {
    say(REFUSED, [
      `${who.branch} moves under this hand-back, and one rebase fell short. The hand-back stands here, so push ${who.branch} and pull again.`,
    ]);
    return 1;
  }
  return onward(it, who, [`${one.name} ${changes.join(", ")}.`]);
}

// [[spec/design_output/pull#children-before-their-group]]
function childrenWaiting(it, one, front) {
  const step = walkOf(front).find((held) => String(held.said.by ?? "") === "children");
  if (!step) return null;
  const said = childrenSay(ticketsHere(it), one.name);
  if (!said.open.length) return null;
  return { path: step.path, why: `${said.open.join(", ")} stand open` };
}

// [[spec/design_output/pull#the-fail]]
function failed(it, who, one, leaf, held, reason, answered) {
  const back = target(leaf, leaf.on_fail);
  const returns = returnsOf(one.front, leaf.path) + 1;
  const text = withEntry(one.text, {
    step: leaf.path,
    hand: who.hand,
    hash_before: held.hash,
    hash_after: one.private ? "" : tipOf(it),
    returns,
    why: reason,
    answered,
  });
  const changes = [`fails ${leaf.path} back to ${back}`];
  one.text = withField(withField(text, "step", back), "state", OPEN);

  const most = Number(it.fails);
  if (most > 0 && returns >= most) {
    const put = withPersonStep(
      it,
      one,
      back,
      `${leaf.path} failed back ${returns} times: ${reason}`,
    );
    if (put.path) changes.push(`${back} waits for a person at ${put.path}`);
  }

  const finding = landed(it, one, changes);
  if (finding) return unlanded(one, leaf, finding);
  dropHold(it, who.hand);
  if (!one.private && !pushed(it, who.branch)) {
    say(REFUSED, [
      `${who.branch} moves under this hand-back, and one rebase fell short. The hand-back stands here, so push ${who.branch} and pull again.`,
    ]);
    return 1;
  }
  return onward(it, who, [`${one.name} ${changes.join(", ")}.`]);
}

// [[spec/design_output/pull#the-fail]]
function target(leaf, said) {
  if (!said) return leaf.path;
  const named = entryNamed(leaf.walk, said, leaf);
  if (!named) return leaf.path;
  if (named.leaf) return named.path;
  const first = leaf.walk.find(
    (one) => one.leaf && one.path.startsWith(`${named.path}/`),
  );
  return first ? first.path : leaf.path;
}

function entriesOf(front) {
  return [front?.record ?? []].flat().filter((one) => one && typeof one === "object");
}

function returnsOf(front, path) {
  return entriesOf(front)
    .filter((one) => String(one.step) === path)
    .reduce((most, one) => Math.max(most, Number(one.returns ?? 0)), 0);
}

// [[spec/design_output/pull#became]]
function became(it, who, one, leaf, held, successor, answered) {
  const all = ticketsHere(it);
  if (!all.some((held) => held.name === successor)) {
    say(REFUSED, [
      `${successor} stands nowhere yet. Mint it, then hand back --became ${successor}.`,
    ]);
    return 1;
  }
  const text = withEntry(one.text, {
    step: leaf.path,
    hand: who.hand,
    hash_before: held.hash,
    hash_after: one.private ? "" : tipOf(it),
    answered,
  });
  one.text = withField(shut(text, frontOf(text), "became"), "successors", `[${successor}]`);
  const finding = landed(it, one, [`closes became ${successor}`]);
  if (finding) return unlanded(one, leaf, finding);
  dropHold(it, who.hand);
  if (!one.private && !pushed(it, who.branch)) {
    say(REFUSED, [
      `${who.branch} moves under this hand-back, and one rebase fell short. The hand-back stands here, so push ${who.branch} and pull again.`,
    ]);
    return 1;
  }
  return onward(it, who, [`${one.name} closes became ${successor}.`]);
}

// [[spec/design_output/pull#a-hand-of-its-own]]
function onward(it, who, rows) {
  dropHold(it, who.hand);
  say(WORK, rows);
  if (!who.oneStep) return handOut(it, who);
  say(DONE, [`${who.hand} works one step, and it is done. Stop here.`]);
  return 0;
}

function shut(text, front, reason) {
  let now = withField(withField(text, "state", CLOSED), "reason", reason);
  if (front.todo !== undefined) now = withField(now, "todo", "false");
  return now;
}

// [[spec/design_output/pull#a-person-step-goes-in]]
function repairPersonSteps(it, who) {
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
    (held) => /^person(-\d+)?$/.test(held.name) && String(held.said.by) === "person" && !held.said.to,
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
  const front = frontOf(one.text);
  const walk = walkOf(front);
  const standing = walk.filter((held) => /^person(-\d+)?$/.test(held.name)).length;
  const most = Number(it.splits);
  if (most > 0 && standing >= most) {
    console.error(
      `${one.name} carries ${standing} person steps already, so split it: hand back --became <ticket>.`,
    );
    return { path: "" };
  }
  const name = `person-${standing + 1}`;
  const steps = structuredClone(front.steps ?? []);
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

  const step = {
    name,
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
  };
  list.splice(at, 0, step);

  const path = [...parts.slice(0, -1), name].join("/");
  const schema = schemasHere(it).get("ticket");
  const text = schema ? reRouted(one.text, schema, steps, "") : one.text;
  one.text = withField(withField(text, "step", path), "state", OPEN);
  return { path };
}

// [[spec/design_output/pull#the-pass]]
// [[spec/design_output/pull#the-refused-commit]]
function unlanded(one, leaf, finding) {
  say(REFUSED, unlandedRows(one, leaf, finding));
  return 1;
}

// [[spec/design_output/pull#the-rejected-push]]
function pushed(it, branch) {
  if (it.git.run(["push", "origin", branch]).ok) return true;
  it.git.run(["fetch", "origin", branch], true);
  if (!it.git.run(["rebase", `origin/${branch}`], true).ok) {
    it.git.run(["rebase", "--abort"], true);
    return false;
  }
  return it.git.run(["push", "origin", branch]).ok;
}

function tipOf(it) {
  return it.git.run(["rev-parse", "HEAD"], true).out;
}

// [[spec/design_output/pull#the-test-verb]]
function changedSince(it, one, held) {
  const first =
    recordIn(one.text).find((entry) => entry.hash_before)?.hash_before ?? held.hash;
  return changedFiles(it, first);
}

export function changedFiles(it, since) {
  const out = new Set();
  if (since) {
    for (const path of it.git
      .run(["diff", "--name-only", `${since}..HEAD`], true)
      .out.split("\n")) {
      if (path.trim()) out.add(path.trim());
    }
  }
  for (const row of it.git.run(["status", "--porcelain"], true).out.split("\n")) {
    if (row.trim()) out.add(changedIn(row));
  }
  return [...out].sort();
}


// [[spec/design_output/pull#the-answers]]
function say(word, rows) {
  const out = [word, ...rows.map((row) => `  ${row}`)];
  if (word === REFUSED) console.error(out.join("\n"));
  else console.log(out.join("\n"));
}

function bare(said) {
  return String(said ?? "")
    .trim()
    .replace(/^\[\[|\]\]$/g, "")
    .trim();
}

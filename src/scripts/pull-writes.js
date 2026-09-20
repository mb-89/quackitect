// What a hand-back writes: the record, the step it moves to, the commit and
// the push. Each one ends by handing the next leaf out.
// [[spec/design_output/pull#the-pass]]

import { entryNamed } from "../../.claude/skills/level0/lib/schema.js";

export { HELPER, SPAWN, spawnPrompt } from "./pull-spawn.js";

import { CLOSED, frontOf, OPEN, recordIn, withEntry, withField } from "../engine/group.js";
import { dropHold } from "./guidance-hand.js";
import { roleOf } from "./pull-hand-of.js";
import { landed, unlandedRows } from "./pull-landed.js";
import { childrenSay, handOut, holdsHere, ticketsHere } from "./pull-hand.js";
import { DONE, REFUSED, say, WAIT, WORK, walkOf } from "./pull-route.js";
import { changedIn } from "./work.js";

export function passed(it, who, one, leaf, held, answered) {
  const tip = one.private ? "" : tipOf(it);
  let text = withEntry(one.text, {
    step: leaf.path,
    hand: roleOf(who.hand),
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
export function childrenWaiting(it, one, front) {
  const step = walkOf(front).find((held) => String(held.said.by ?? "") === "children");
  if (!step) return null;
  const said = childrenSay(ticketsHere(it), one.name);
  if (!said.open.length) return null;
  return { path: step.path, why: `${said.open.join(", ")} stand open` };
}

// [[spec/design_output/pull#the-fail]]
export function failed(it, who, one, leaf, held, reason, answered) {
  const back = target(leaf, leaf.on_fail);
  const returns = returnsOf(one.front, leaf.path) + 1;
  const text = withEntry(one.text, {
    step: leaf.path,
    hand: roleOf(who.hand),
    hash_before: held.hash,
    hash_after: one.private ? "" : tipOf(it),
    returns,
    why: reason,
    answered,
  });
  const changes = [`fails ${leaf.path} back to ${back}`];
  one.text = withField(withField(text, "step", back), "state", OPEN);

  const finding = landed(it, one, changes);
  if (finding) return unlanded(one, leaf, finding);
  dropHold(it, who.hand);
  if (!one.private && !pushed(it, who.branch)) {
    say(REFUSED, [
      `${who.branch} moves under this hand-back, and one rebase fell short. The hand-back stands here, so push ${who.branch} and pull again.`,
    ]);
    return 1;
  }
  // Past the cap the hold drops and the answer waits, because a leaf going round writes a step a box inserts and nobody answers. [[spec/design_output/pull#the-fail]]
  const most = Number(it.fails);
  if (most > 0 && returns >= most) {
    say(WAIT, [
      `${one.name} ${changes.join(", ")}, and ${leaf.path} fails back ${returns} times.`,
      `The hold drops here, so ${back} stands open for the hand that takes it next.`,
    ]);
    return 0;
  }
  return onward(it, who, [`${one.name} ${changes.join(", ")}.`]);
}

// [[spec/design_output/pull#the-fail]]
export function target(leaf, said) {
  if (!said) return leaf.path;
  const named = entryNamed(leaf.walk, said, leaf);
  if (!named) return leaf.path;
  if (named.leaf) return named.path;
  const first = leaf.walk.find(
    (one) => one.leaf && one.path.startsWith(`${named.path}/`),
  );
  return first ? first.path : leaf.path;
}

export function entriesOf(front) {
  return [front?.record ?? []].flat().filter((one) => one && typeof one === "object");
}

export function returnsOf(front, path) {
  return entriesOf(front)
    .filter((one) => String(one.step) === path)
    .reduce((most, one) => Math.max(most, Number(one.returns ?? 0)), 0);
}

// [[spec/design_output/pull#became]]
export function became(it, who, one, leaf, held, successor, answered) {
  const all = ticketsHere(it);
  if (!all.some((held) => held.name === successor)) {
    say(REFUSED, [
      `${successor} stands nowhere yet. Mint it, then hand back --became ${successor}.`,
    ]);
    return 1;
  }
  const text = withEntry(one.text, {
    step: leaf.path,
    hand: roleOf(who.hand),
    hash_before: held.hash,
    hash_after: one.private ? "" : tipOf(it),
    answered,
  });
  one.text = withField(
    shut(text, frontOf(text), "became"),
    "successors",
    `[${successor}]`,
  );
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
export function onward(it, who, rows) {
  dropHold(it, who.hand);
  say(WORK, rows);
  // The owner's word covers the step it sends the hand into, and no leaf after it. [[spec/design_output/pull#the-hand-rule]]
  who.hand = who.plainHand ?? who.hand;
  it.ownerSays = false;
  if (!who.oneStep) return handOut(it, who);
  say(DONE, [`${who.hand} works one step, and it is done. Stop here.`]);
  return 0;
}

export function shut(text, front, reason) {
  let now = withField(withField(text, "state", CLOSED), "reason", reason);
  if (front.todo !== undefined) now = withField(now, "todo", "false");
  return now;
}

// [[spec/design_output/pull#a-person-step-goes-in]]

export function unlanded(one, leaf, finding) {
  say(REFUSED, unlandedRows(one, leaf, finding));
  return 1;
}

// [[spec/design_output/pull#the-rejected-push]]
export function pushed(it, branch) {
  if (it.git.run(["push", "origin", branch]).ok) return true;
  it.git.run(["fetch", "origin", branch], true);
  if (!it.git.run(["rebase", `origin/${branch}`], true).ok) {
    it.git.run(["rebase", "--abort"], true);
    return false;
  }
  return it.git.run(["push", "origin", branch]).ok;
}

export function tipOf(it) {
  return it.git.run(["rev-parse", "HEAD"], true).out;
}

// The commits between a tip and the branch tip, split by the ticket each names. `landed` writes the ticket before the first colon, and what follows names children and successors. A log the door fails to read answers read false, which every caller takes as a move. [[spec/tickets/the-verdict-guard-reads-tips]]
export function commitsFor(it, name, since) {
  const said = since
    ? it.git.run(["log", "--format=%H%x00%s", `${since}..HEAD`], true)
    : { ok: false, out: "" };
  if (!said.ok) return { read: false, own: [], other: [] };
  const own = [];
  const other = [];
  for (const row of said.out.split("\n")) {
    if (!row.trim()) continue;
    const [sha, subject = ""] = row.split("\0");
    (ticketIn(subject) === name ? own : other).push(sha.trim());
  }
  return { read: true, own, other };
}

// [[spec/tickets/the-verdict-guard-reads-tips]]
function ticketIn(subject) {
  const said = String(subject ?? "");
  const at = said.indexOf(":");
  return at < 0 ? "" : said.slice(0, at).trim();
}

// [[spec/design_output/pull#the-test-verb]]
export function changedSince(it, one, held) {
  const first =
    recordIn(one.text).find((entry) => entry.hash_before)?.hash_before ?? held.hash;
  const said = commitsFor(it, one.name, first);
  if (!said.read) return changedFiles(it, first);
  const out = new Set(said.own.flatMap((sha) => filesOf(it, sha)));
  // A working tree names no hand, so it rides the span while the tip stands where the hold left it. [[spec/tickets/the-verdict-guard-reads-tips]]
  if (!held.hash || tipOf(it) === held.hash) {
    for (const path of treeFiles(it)) out.add(path);
  }
  return [...out].sort();
}

// [[spec/tickets/the-verdict-guard-reads-tips]]
function filesOf(it, sha) {
  const said = it.git.run(["show", "--format=", "--name-only", sha], true);
  return said.ok ? said.out.split("\n").map((row) => row.trim()).filter(Boolean) : [];
}

// [[spec/design_output/pull#the-test-verb]]
function treeFiles(it) {
  const out = [];
  for (const row of it.git.run(["status", "--porcelain"], true).out.split("\n")) {
    if (row.trim()) out.push(changedIn(row));
  }
  return out;
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
  for (const path of treeFiles(it)) out.add(path);
  return [...out].sort();
}

// [[spec/design_output/pull#the-answers]]

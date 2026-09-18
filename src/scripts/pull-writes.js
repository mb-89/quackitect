// What a hand-back writes: the record, the step it moves to, the commit and
// the push. Each one ends by handing the next leaf out.
// [[spec/design_output/pull#the-pass]]

import { entryNamed } from "../../.claude/skills/level0/lib/schema.js";

export { HELPER, SPAWN, spawnPrompt } from "./spawn.js";

import { CLOSED, frontOf, OPEN, recordIn, withEntry, withField } from "./group.js";
import { dropHold } from "./guidance-hand.js";
import { landed, unlandedRows } from "./landed.js";
import {
  childrenSay,
  handOut,
  holdsHere,
  ticketsHere,
  withSettleStep,
} from "./pull-hand.js";
import { DONE, REFUSED, say, WORK, walkOf } from "./pull-route.js";
import { changedIn } from "./work.js";

export function passed(it, who, one, leaf, held, answered) {
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
    const put = withSettleStep(
      it,
      one,
      back,
      `${leaf.path} failed back ${returns} times: ${reason}`,
    );
    if (put.path) changes.push(`${back} waits for a hand at ${put.path}`);
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
    hand: who.hand,
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

// [[spec/design_output/pull#the-test-verb]]
export function changedSince(it, one, held) {
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

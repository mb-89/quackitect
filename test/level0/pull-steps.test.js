// The pull, driven through fake doors: a person step, a skip, a command and the group.
// The doors these cases drive stand in pull-doors.js beside this file.
// [[spec/design_output/pull#the-answers]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { readNote } from "../../.claude/skills/level0/lib/schema.js";
import { fieldOf, recordIn, withEntry, withField } from "../../src/scripts/group.js";
import {
  childrenSay,
  holdsVerb,
  withEngineReader,
  withPersonStep,
} from "../../src/scripts/pull.js";
import { work } from "../../src/scripts/work.js";
import {
  at,
  BRANCH,
  CHILD,
  doors,
  filled,
  GROUP_NOTE,
  HAND,
  HOLD,
  heard,
  ROOT,
  ranGit,
  SHA,
  standing,
} from "./pull-doors.js";

test("a step failing back twice inserts a person step, and a third insertion asks for a split", () => {
  const once = withEntry(CHILD("open", "design/review"), {
    step: "design/review",
    hand: "box other",
    hash_before: "aaaa",
    hash_after: "aaaa",
    returns: 1,
    why: "thin",
  });
  const twice = filled(once, "### verdict", "fail\n- still thin");
  const { it, disk } = doors(standing(twice), {}, { fails: 2 });
  heard(() => work(ROOT, ["pull"], it));

  const { code, said } = heard(() => work(ROOT, ["pull", "a-child"], it));

  assert.equal(code, 0);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(now, "step"), "design/person-1");
  assert.match(
    now,
    /- name: person-1\n\s+does: answers the question the engine asks\n\s+by: person\n\s+to: engine\n\s+asks: "design\/review failed back 2 times: still thin"/,
  );
  const bare = now.replace("    to: engine\n", "");
  const rooted = { ...it, root: ROOT };
  assert.match(
    withEngineReader(rooted, { text: bare }),
    /to: engine/,
    "the hand-out repairs a person step with no reader",
  );
  assert.equal(withEngineReader(rooted, { text: now }), "");

  const colon = withEntry(CHILD("open", "design/review"), {
    step: "design/review",
    hand: "box other",
    hash_before: "aaaa",
    hash_after: "aaaa",
    returns: 1,
    why: "thin",
  });
  const asked = {
    name: "a-child",
    text: filled(colon, "### verdict", "fail\n- breaks Sentence at line 2: too long"),
  };
  const put = withPersonStep(
    { ...it, root: ROOT, fails: 2 },
    asked,
    "design/draft",
    "the hand-back met refused: breaks Sentence at line 2: too long",
  );
  assert.equal(put.path, "design/person-1");
  assert.match(
    asked.text,
    /^\s+asks: "the hand-back met refused: breaks Sentence at line 2: too long"$/m,
    "a colon takes quotes",
  );
  assert.equal(
    readNote(asked.text).front.said.steps[0].steps[0].asks,
    "the hand-back met refused: breaks Sentence at line 2: too long",
  );
  const unquoted = asked.text.replace(/asks: "(.*)"/, "asks: $1");
  assert.match(
    withEngineReader(rooted, { text: unquoted }),
    /asks: "the hand-back met refused: breaks/,
    "the hand-out repairs a bare colon",
  );
  assert.match(
    now,
    /^## person-1\n\n<!-- answers the question the engine asks -->\n\n### answer/m,
  );
  assert.match(said, /waits for a person at design\/person-1/);

  const one = { name: "a-child", text: now };
  assert.equal(
    withPersonStep({ ...it, splits: 1 }, one, "design/review", "again").path,
    "",
  );
});

// [[spec/design_output/pull#a-condition-skips-a-leaf]]
test("a leaf under when returned is skipped on the way forward, with the reason in the record", () => {
  const ready = filled(
    CHILD("open", "implement/tests-red"),
    "### tests",
    "node --test test/x.test.js",
  );
  const { it, disk } = doors(standing(ready), {
    sh: { exitCode: 1, stdout: "assertion, 1 test(s) fail on their own assertion\n" },
  });
  heard(() => work(ROOT, ["pull"], it));

  const { code, said } = heard(() => work(ROOT, ["pull", "a-child", "--pass"], it));

  assert.equal(code, 1, "the checked field is short, so the hand-back is refused");
  assert.match(
    said,
    /checked under implement\/tests-red holds 0 line\(s\), and the checklist holds 2/,
  );

  const checked = filled(
    ready,
    "### tests",
    "node --test test/x.test.js\n\n### checked\n\n- it touches the two files\n- the proc fake stands",
  );
  disk.write(at("spec/tickets/a-child.md"), checked);
  const passed = heard(() => work(ROOT, ["pull", "a-child", "--pass"], it));
  assert.equal(passed.code, 0);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(now, "step"), "implement/change");
  const entries = recordIn(now);
  assert.deepEqual(entries.at(-2).answered, [
    {
      name: "tests",
      exit: 1,
      said: "assertion, 1 test(s) fail on their own assertion",
    },
  ]);
  assert.deepEqual(entries.at(-1), {
    step: "implement/reflect",
    skipped: true,
    why: "the ticket arrives here by no on_fail",
  });
});

// [[spec/design_output/pull#the-commands-answer]]
test("a command answering the wrong word or exit refuses the hand-back, and the answer is named", () => {
  const ready = filled(
    CHILD("open", "implement/tests-red"),
    "### tests",
    "node --test test/x.test.js\n\n### checked\n\n- one\n- two",
  );
  const { it } = doors(standing(ready), {
    sh: { exitCode: 0, stdout: "green, 3 test(s) pass\n" },
  });
  heard(() => work(ROOT, ["pull"], it));

  const { code, said } = heard(() => work(ROOT, ["pull", "a-child", "--pass"], it));

  assert.equal(code, 1);
  assert.match(
    said,
    /tests under implement\/tests-red expects assertion, and node --test test\/x\.test\.js answers green/,
  );
});

// [[spec/design_output/pull#the-hand-back-matches-the-hold]]
test("a hand-back the record answers gets the recorded answer, and a stale take hash gets refused", () => {
  const answered = withEntry(CHILD("open", "design/review"), {
    step: "design/draft",
    hand: HAND,
    hash_before: SHA,
    hash_after: SHA,
  });
  const { it, disk } = doors(
    standing(answered, withField(GROUP_NOTE, "state", "closed")),
  );
  disk.write(
    HOLD,
    JSON.stringify({
      ticket: "a-child",
      path: "spec/tickets/a-child.md",
      step: "design/draft",
      hand: HAND,
      hash: SHA,
    }),
  );

  const twice = heard(() => work(ROOT, ["pull", "a-child", "--pass"], it));
  assert.match(twice.said, /answered already, and the record holds it/);
  assert.equal(disk.exists(HOLD), false);

  const stale = doors(standing(), {
    "git merge-base --is-ancestor 0000 HEAD": { exitCode: 1 },
  });
  stale.disk.write(
    HOLD,
    JSON.stringify({
      ticket: "a-child",
      path: "spec/tickets/a-child.md",
      step: "design/draft",
      hand: HAND,
      hash: "0000",
    }),
  );
  const { code, said } = heard(() =>
    work(ROOT, ["pull", "a-child", "--pass"], stale.it),
  );
  assert.equal(code, 1);
  assert.match(said, /the take hash 0000 trails work\/one-group, so the hold drops/);
  assert.equal(stale.disk.exists(HOLD), false);
});

// [[spec/design_output/pull#the-rejected-push]]
test("a rejected push fetches, rebases the commit, tries once more, and then answers refused", () => {
  let pushes = 0;
  const once = doors(standing(filled(CHILD(), "### approach", "The approach.")), {
    [`git push origin ${BRANCH}`]: () => ({ exitCode: pushes++ ? 0 : 1 }),
  });
  heard(() => work(ROOT, ["pull"], once.it));
  const { code } = heard(() => work(ROOT, ["pull", "a-child", "--pass"], once.it));
  assert.equal(code, 0);
  const ran = ranGit(once.outside);
  assert.ok(ran.includes(`git rebase origin/${BRANCH}`));
  assert.equal(ran.filter((one) => one === `git push origin ${BRANCH}`).length, 2);

  const stuck = doors(standing(filled(CHILD(), "### approach", "The approach.")), {
    [`git push origin ${BRANCH}`]: { exitCode: 1 },
    [`git rebase origin/${BRANCH}`]: { exitCode: 1 },
  });
  heard(() => work(ROOT, ["pull"], stuck.it));
  const refused = heard(() => work(ROOT, ["pull", "a-child", "--pass"], stuck.it));
  assert.equal(refused.code, 1);
  assert.match(refused.said, /moves under this hand-back/);
  assert.ok(ranGit(stuck.outside).includes("git rebase --abort"));
  assert.equal(
    stuck.disk.exists(HOLD),
    false,
    "the hand-back stands, so the hold drops and outlives no closed ticket",
  );
  assert.match(refused.said, /push work\/one-group and pull again/);
});

// [[spec/design_output/pull#a-need-is-a-verb]]
test("a need names a verb, and the box says which it holds", () => {
  assert.equal(holdsVerb("work test"), true);
  assert.equal(holdsVerb("branch pull"), true);
  assert.equal(holdsVerb("retro notes"), true);
  assert.equal(holdsVerb("retro collect"), false);
  assert.equal(holdsVerb("deploy"), false);
  assert.equal(holdsVerb("ticket"), true);
});

// [[spec/design_output/pull#a-need-is-a-verb]]
test("a child waits for an open dependency, and the group's own dependencies are the take's", () => {
  const waits = CHILD().replace(
    "group: one-group\n",
    'group: one-group\ndepends_on: ["a-loose-one"]\n',
  );
  const group = GROUP_NOTE.replace(
    "process: [[group]]\n",
    'process: [[group]]\ndepends_on: ["a-loose-one"]\n',
  );
  const { it } = doors(
    standing(waits, group, {
      [at("spec/tickets/a-loose-one.md")]: CHILD("open", "design/draft").replace(
        "group: one-group\n",
        "",
      ),
    }),
  );

  const { said } = heard(() => work(ROOT, ["pull"], it));

  assert.match(
    said,
    /^work {2}one-group at sync/,
    "the take arbitrates the group's dependencies",
  );
  const hold = JSON.parse(it.disk.read(HOLD));
  assert.equal(hold.ticket, "one-group");
});

// [[spec/design_output/pull#a-need-is-a-verb]]
test("a leaf needing a verb the box lacks answers wait, with the reason", () => {
  const child = CHILD("open", "design/draft").replace(
    "  - name: design\n",
    '  - name: design\n    needs: ["deploy now"]\n',
  );
  const { it } = doors(
    standing(child, GROUP_NOTE.replace("state: open", "state: closed")),
  );

  const { code, said } = heard(() => work(ROOT, ["pull"], it));

  assert.equal(code, 0);
  assert.match(said, /^wait\n {2}a-child needs deploy now, which this box lacks/);
});

// [[spec/design_output/pull#children-before-their-group]]
test("the group's children step derives from its tickets, and the box leaves it while a child waits", () => {
  const parked = CHILD("open", "design/review").replace(
    "        not: draft\n",
    "        by: person\n",
  );
  const { it, disk } = doors(
    standing(parked, withField(GROUP_NOTE, "step", "children")),
    {
      sh: { exitCode: 0, stdout: "" },
    },
  );
  const held = withEntry(parked, {
    step: "design/draft",
    hand: HAND,
    hash_before: SHA,
    hash_after: SHA,
  });
  disk.write(at("spec/tickets/a-child.md"), held);

  const { code, said } = heard(() => work(ROOT, ["pull"], it));

  assert.equal(code, 0);
  assert.match(said, /^work {2}one-group at retro\/notes/);
  const now = disk.read(at("spec/tickets/one-group.md"));
  assert.equal(fieldOf(now, "step"), "retro/notes");
  assert.deepEqual(recordIn(now).at(-1), {
    step: "children",
    hand: HAND,
    skipped: true,
    why: "the box leaves it while a-child stand open",
  });
});

// [[spec/design_output/pull#children-before-their-group]]
test("every child closed passes the children step by the engine, and a dropped child fails it back", () => {
  const shut = CHILD("closed", "implement/change", "reason: done\n");
  const done = doors(standing(shut, withField(GROUP_NOTE, "step", "children")));
  heard(() => work(ROOT, ["pull"], done.it));
  const passed = done.disk.read(at("spec/tickets/one-group.md"));
  assert.equal(recordIn(passed).at(-1).step, "children");
  assert.equal(recordIn(passed).at(-1).hand, "the engine");
  assert.equal(fieldOf(passed, "step"), "retro/notes");

  const dropped = CHILD("closed", "design/draft", "reason: dropped\n");
  const back = doors(standing(dropped, withField(GROUP_NOTE, "step", "children")));
  const { said } = heard(() => work(ROOT, ["pull"], back.it));
  assert.equal(
    fieldOf(back.disk.read(at("spec/tickets/one-group.md")), "step"),
    "split",
  );
  assert.match(said, /^work {2}one-group at split/);
  assert.deepEqual(
    childrenSay([{ name: "x", text: dropped, private: false }], "one-group"),
    {
      open: [],
      dropped: ["x"],
      all: ["x"],
    },
  );
});

// [[spec/design_output/pull#children-before-their-group]]
test("the group's last leaf returns to children while a child stands open, and closes done once none does", () => {
  const last = withEntry(withField(GROUP_NOTE, "step", "retro/cloud"), {
    step: "children",
    hand: HAND,
    skipped: true,
    why: "the box leaves it while a-child stand open",
  });
  const parked = withEntry(
    CHILD("open", "design/review").replace(
      "        not: draft\n",
      "        by: person\n",
    ),
    {
      step: "design/draft",
      hand: HAND,
      hash_before: SHA,
      hash_after: SHA,
    },
  );
  const open = doors(standing(parked, filled(last, "### lacked", "- nothing")));
  heard(() => work(ROOT, ["pull"], open.it));
  assert.equal(JSON.parse(open.disk.read(HOLD)).step, "retro/cloud");
  const back = heard(() => work(ROOT, ["pull", "one-group", "--pass"], open.it));
  assert.equal(back.code, 0, back.said);
  const stays = open.disk.read(at("spec/tickets/one-group.md"));
  assert.equal(fieldOf(stays, "state"), "open");
  assert.equal(fieldOf(stays, "step"), "children");
  assert.match(
    back.said,
    /^ {2}a-child waits for a person at design\/review/m,
    "the box leaves once, and waits the second time",
  );

  const shut = doors(
    standing(
      CHILD("closed", "implement/change", "reason: done\n"),
      filled(last, "### lacked", "- nothing"),
    ),
  );
  heard(() => work(ROOT, ["pull"], shut.it));
  heard(() => work(ROOT, ["pull", "one-group", "--pass"], shut.it));
  const closed = shut.disk.read(at("spec/tickets/one-group.md"));
  assert.equal(fieldOf(closed, "state"), "closed");
  assert.equal(fieldOf(closed, "reason"), "done");
});

// [[spec/design_output/pull#the-private-queue]]
test("a tagged note comes first, a private breakdown after the group's tickets, and a note waits for a retro hand", () => {
  const note = (todo, process = "note") => `---
kind: [[ticket]]
state: open
urgency: whenever
process: [[${process}]]
${todo ? "todo: true\n" : ""}steps:
  - name: decide
    does: says what the note becomes
    by: ${process === "note" ? "retro" : "anyone"}
    evidence:
      - name: outcome
        form: text
        says: what it becomes
---

# Ask

A thing to look at.

# decide

## outcome

# Discussion
`;
  const first = doors(
    standing(CHILD(), GROUP_NOTE, { [at(".se/tickets/parked.md")]: note(true) }),
  );
  const tagged = heard(() => work(ROOT, ["pull"], first.it));
  assert.match(tagged.said, /^work {2}parked at decide/);
  assert.equal(
    JSON.parse(first.disk.read(HOLD)).hash,
    "",
    "a private ticket takes no hash",
  );

  const later = doors(
    standing(
      CHILD("closed", "implement/change", "reason: done\n"),
      withField(GROUP_NOTE, "step", "children"),
      {
        [at(".se/tickets/a-note.md")]: note(false),
        [at(".se/tickets/a-piece.md")]: note(false, "trivial"),
      },
    ),
  );
  heard(() => work(ROOT, ["pull"], later.it));
  const hold = JSON.parse(later.disk.read(HOLD));
  assert.equal(
    hold.ticket,
    "one-group",
    "the group's own leaf comes before a private breakdown",
  );
  later.disk.remove(HOLD);
  later.disk.write(
    at("spec/tickets/one-group.md"),
    withField(GROUP_NOTE, "state", "closed"),
  );
  const { said } = heard(() => work(ROOT, ["pull"], later.it));
  assert.match(said, /^work {2}a-piece at decide/);
  assert.doesNotMatch(said, /a-note/, "a note waits for a retro hand");
});

// [[spec/design_output/pull#became]]

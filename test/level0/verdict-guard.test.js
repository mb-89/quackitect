// The guard on a verdict hand-back, and the span the `read` field answers to.
// Both read the commits between the hold's tip and the branch tip, so every
// case here teaches the git door a log and reads what the guard says.
// [[spec/tickets/the-verdict-guard-reads-tips]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { handFaults } from "../../src/scripts/pull-chapter.js";
import { changedSince, commitsFor } from "../../src/scripts/pull-writes.js";

const ROOT = "/tree";
const HOLD = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const TIP = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const MINE = "1111111111111111111111111111111111111111";
const THEIRS = "2222222222222222222222222222222222222222";
const NAME = "a-child";

const TICKET = `---
kind: [[ticket]]
state: open
step: verdict
steps:
  - name: verdict
    evidence:
      - name: read
        form: files
      - name: verdict
        form: verdict
record:
  - step: design/draft
    hand: box other
    hash_before: ${HOLD}
    hash_after: ${HOLD}
---

# Ask

One piece of it.
`;

const LEAF = {
  path: "verdict",
  by: "anyone",
  evidence: [
    { name: "read", form: "files" },
    { name: "verdict", form: "verdict" },
  ],
};

const log = (from, rows) => ({
  [`git log --format=%H%x00%s ${from}..HEAD`]: { stdout: `${rows.join("\n")}\n` },
});

function doors(answers = {}, tip = TIP) {
  const said = fakeGit(
    {
      "git rev-parse HEAD": { stdout: `${tip}\n` },
      "git status --porcelain -uall": { stdout: "" },
      ...answers,
    },
    ROOT,
  );
  return {
    root: ROOT,
    join,
    disk: fakeDisk({}),
    git: said,
    agent: true,
    cloud: false,
    env: {},
  };
}

const one = { name: NAME, text: TICKET, front: {}, private: false };

// [[spec/tickets/the-verdict-guard-reads-tips]]
test("a commit names the ticket it belongs to before the first colon", () => {
  const it = doors(
    log(HOLD, [
      `${MINE}\x00${NAME}: passes design/draft`,
      `${THEIRS}\x00a-sibling: returns to design/draft, because ${NAME} stand open`,
    ]),
  );

  const said = commitsFor(it, NAME, HOLD);

  assert.equal(said.read, true);
  assert.deepEqual(
    said.own,
    [MINE],
    "the prefix names the ticket, and nothing past it does",
  );
  assert.deepEqual(said.other, [THEIRS]);
});

// [[spec/tickets/the-verdict-guard-reads-tips]]
test("a failed log answers read false, so the guard refuses as it does today", () => {
  const it = doors({
    [`git log --format=%H%x00%s ${HOLD}..HEAD`]: { exitCode: 1, stdout: "" },
  });

  assert.deepEqual(commitsFor(it, NAME, HOLD), { read: false, own: [], other: [] });
});

// A sibling hand commits beside this reader, and the reading lands. [[spec/tickets/the-verdict-guard-reads-tips]]
test("a sibling's commit moves the tip, and the verdict hand-back stands", () => {
  const it = doors(log(HOLD, [`${THEIRS}\x00a-sibling: passes implement/change`]));

  assert.deepEqual(handFaults(it, one, LEAF, "box one", { hash: HOLD }), []);
});

// [[spec/tickets/the-verdict-guard-reads-tips]]
test("a commit naming this ticket moves the tip, and the guard refuses", () => {
  const it = doors(log(HOLD, [`${MINE}\x00${NAME}: passes implement/change`]));

  const said = handFaults(it, one, LEAF, "box one", { hash: HOLD });

  assert.equal(said.length, 1);
  assert.match(
    said[0],
    /a verdict comes from a hand that leaves the tip where it stands/,
  );
});

// [[spec/tickets/the-verdict-guard-reads-tips]]
test("a log the git door fails to read refuses the hand-back", () => {
  const it = doors({
    [`git log --format=%H%x00%s ${HOLD}..HEAD`]: { exitCode: 1, stdout: "" },
  });

  assert.equal(handFaults(it, one, LEAF, "box one", { hash: HOLD }).length, 1);
});

// [[spec/tickets/the-verdict-guard-reads-tips]]
test("a tip standing where the hold left it refuses nothing", () => {
  const it = doors({}, HOLD);

  assert.deepEqual(handFaults(it, one, LEAF, "box one", { hash: HOLD }), []);
});

// [[spec/tickets/the-verdict-guard-reads-tips]]
test("the span takes the files under this ticket's commits, and leaves a sibling's", () => {
  const it = doors({
    ...log(HOLD, [
      `${MINE}\x00${NAME}: passes design/draft`,
      `${THEIRS}\x00a-sibling: passes implement/change`,
    ]),
    [`git show --format= --name-only ${MINE}`]: { stdout: "src/mine.js\n" },
    [`git show --format= --name-only ${THEIRS}`]: { stdout: "src/theirs.js\n" },
    "git status --porcelain -uall": { stdout: " M src/tree.js\n" },
  });

  assert.deepEqual(changedSince(it, one, { hash: HOLD }), ["src/mine.js"]);
});

// A tree names no hand, so it rides the span while the tip stands still. [[spec/tickets/the-verdict-guard-reads-tips]]
test("the span takes the working tree where the tip stands where the hold left it", () => {
  const it = doors(
    {
      ...log(HOLD, [`${MINE}\x00${NAME}: passes design/draft`]),
      [`git show --format= --name-only ${MINE}`]: { stdout: "src/mine.js\n" },
      "git status --porcelain -uall": { stdout: " M src/tree.js\n" },
    },
    HOLD,
  );

  assert.deepEqual(changedSince(it, one, { hash: HOLD }), [
    "src/mine.js",
    "src/tree.js",
  ]);
});

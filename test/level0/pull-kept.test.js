// A rewind walks past a red leaf once the change behind it lands, while every
// test its pass commit lands still stands, so a ticket walks on to green.
// [[spec/tickets/a-rewind-spares-landed-tests]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { frontOf, recordIn, withEntry } from "../../src/engine/group.js";
import { advanced } from "../../src/scripts/pull-hand.js";
import { keptRed } from "../../src/scripts/pull-kept.js";
import { leafOf } from "../../src/scripts/pull-route.js";
import { stepOn } from "../../src/scripts/pull-writes.js";
import { CHILD, doors, ROOT, standing } from "./pull-doors.js";

const RED_LEAF = "implement/tests-red";
const CHANGE = "implement/change";
const REVIEW = "design/review";
const BEFORE = "a1b2c3a1b2c3a1b2c3a1b2c3a1b2c3a1b2c3a1b2";
const AFTER = "0123abcd0123abcd0123abcd0123abcd0123abcd";
const RED_COMMIT = "4567ef014567ef014567ef014567ef014567ef01";
const CHANGED = "89ab234589ab234589ab234589ab234589ab2345";
const TEST = "test/level0/one.test.js";

// The three reads keptRed asks git, keyed as the fake hears them. [[spec/tickets/a-rewind-spares-landed-tests]]
const logSince = (after, rows) => ({
  [`git log --reverse --ancestry-path --format=%H%x09%s ${after}..HEAD`]: {
    stdout: `${rows.map(([hash, subject]) => `${hash}\t${subject}`).join("\n")}\n`,
  },
});
const landsIn = (commit, rows) => ({
  [`git show --name-status --format= ${commit}`]: { stdout: `${rows.join("\n")}\n` },
});
const movedSince = (commit, rows) => ({
  [`git diff -M --name-status ${commit} HEAD`]: {
    stdout: rows.length ? `${rows.join("\n")}\n` : "",
  },
});

const redPass = (after = AFTER) => ({
  step: RED_LEAF,
  hand: "box one",
  hash_before: BEFORE,
  hash_after: after,
  def: "d0",
});
const changePass = {
  step: CHANGE,
  hand: "box one",
  hash_before: AFTER,
  hash_after: CHANGED,
  def: "d1",
};
const reviewStale = { step: REVIEW, hand: "the engine", stale: "design/draft" };

// The child at a step with the record a case names, over the git answers it names. [[spec/tickets/a-rewind-spares-landed-tests]]
function built(step, record, answers) {
  const front = doors({}).it.front;
  let text = CHILD("open", step);
  for (const entry of record) text = withEntry(text, entry, front);
  const made = doors(standing(text), answers);
  made.it.root = ROOT;
  return { ...made, text, one: { name: "a-child", text, front: frontOf(text) } };
}

const landed = {
  ...logSince(AFTER, [
    [RED_COMMIT, `a-child: passes ${RED_LEAF}`],
    [CHANGED, `a-child: passes ${CHANGE}`],
  ]),
  ...landsIn(RED_COMMIT, ["M\tspec/tickets/a-child.md", `A\t${TEST}`]),
};

test("a red leaf whose tests land in its pass commit, and stand there, is kept once the change passes", () => {
  const { it, text } = built(RED_LEAF, [redPass(), changePass], {
    ...landed,
    ...movedSince(RED_COMMIT, []),
  });
  const kept = keptRed(it, text, leafOf(frontOf(text), RED_LEAF));
  assert.equal(kept?.kept, RED_COMMIT);
  assert.equal(kept?.step, RED_LEAF);
  assert.equal(kept?.skipped, true);
});

// The rewind the-retro-reads-the-backlog meets, off its own record and commits. [[spec/tickets/a-rewind-spares-landed-tests]]
const BACKLOG = {
  after: "916443192a0a15ca1a3080ef1e36d66acccb758c",
  red: "f27f6c9fc2b3d6e1663f6aaf5deb9d89aa274361",
  change: "7c8c139709b0bba508abf2850e2976ebdbb79461",
  passed: "e6b315d577e1221cb157cbd2c8caf1ca8891dd10",
};

test("the rewind the-retro-reads-the-backlog meets keeps its red leaf through appended cases and a rename", () => {
  const { it, text, one } = built(
    REVIEW,
    [
      redPass(BACKLOG.after),
      { ...changePass, hash_before: BACKLOG.red, hash_after: BACKLOG.change },
      reviewStale,
    ],
    {
      ...logSince(BACKLOG.after, [
        [BACKLOG.red, `a-child: passes ${RED_LEAF}`],
        [BACKLOG.change, "a-child: a class mints onto the process it names"],
        [BACKLOG.passed, `a-child: passes ${CHANGE}`],
      ]),
      ...landsIn(BACKLOG.red, [
        "M\tspec/tickets/a-child.md",
        "A\ttest/level0/retro-backlog.test.js",
        "M\ttest/level0/retro-mint.test.js",
        "A\ttest/level0/retro-route.test.js",
      ]),
      ...movedSince(BACKLOG.red, [
        "R100\ttest/level0/retro-route.test.js\ttest/contract/retro-route.test.js",
        "M\ttest/level0/retro-backlog.test.js",
        "M\ttest/level0/retro-mint.test.js",
      ]),
    },
  );
  const changes = [];
  const said = stepOn(it, one, leafOf(frontOf(text), REVIEW), text, changes);
  assert.equal(frontOf(said).step, CHANGE);
  const kept = recordIn(said).at(-1);
  assert.equal(kept.step, RED_LEAF);
  assert.equal(kept.kept, BACKLOG.red);
  assert.ok(
    changes.some((line) => line.startsWith(`keeps ${RED_LEAF}`)),
    changes.join("\n"),
  );
});

test("a red test deleted with no rename hands the red leaf out again", () => {
  const { it, text } = built(RED_LEAF, [redPass(), changePass], {
    ...landed,
    ...movedSince(RED_COMMIT, [`D\t${TEST}`]),
  });
  assert.equal(keptRed(it, text, leafOf(frontOf(text), RED_LEAF)), null);
});

test("a red leaf rewound before a later leaf passes hands out again, so a case the edited draft adds runs red", () => {
  const { it, text, one } = built(REVIEW, [redPass(), reviewStale], {
    ...landed,
    ...movedSince(RED_COMMIT, []),
  });
  assert.equal(keptRed(it, text, leafOf(frontOf(text), RED_LEAF)), null);
  const said = stepOn(it, one, leafOf(frontOf(text), REVIEW), text, []);
  assert.equal(frontOf(said).step, RED_LEAF);
});

test("a pull meeting a ticket stranded at its red leaf walks it on to the change", () => {
  const { it, one } = built(RED_LEAF, [redPass(), changePass], {
    ...landed,
    ...movedSince(RED_COMMIT, []),
  });
  const moved = advanced(it, one, [one]);
  assert.equal(moved.leaf?.path, CHANGE);
});

// [[spec/tickets/kept-red-reads-red-list]]
test("the keep reads the leaf's red list, so a fixture the red commit lands and a later change deletes keeps the leaf", () => {
  const FIXTURE = "test/fixtures/one.json";
  const { it, text } = built(RED_LEAF, [redPass(), changePass], {
    ...logSince(AFTER, [
      [RED_COMMIT, `a-child: passes ${RED_LEAF}`],
      [CHANGED, `a-child: passes ${CHANGE}`],
    ]),
    ...landsIn(RED_COMMIT, [`A\t${TEST}`, `A\t${FIXTURE}`]),
    ...movedSince(RED_COMMIT, [`D\t${FIXTURE}`]),
  });
  const leaf = leafOf(frontOf(text), RED_LEAF);
  assert.equal(
    keptRed(it, text, leaf),
    null,
    "with no red list, the deleted fixture hands the leaf out",
  );
  const listed = text.replace(
    "## tests-red\n\n### tests\n",
    `## tests-red\n\n### tests\n\n### red\n\n- ${TEST}\n`,
  );
  assert.notEqual(listed, text);
  assert.equal(keptRed(it, listed, leaf)?.kept, RED_COMMIT);
});

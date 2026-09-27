// A rewind walks past a red leaf whose tests hold the content they held when
// the leaf passed red, so a ticket whose change landed walks on to green.
// [[spec/tickets/a-rewind-spares-landed-tests]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { frontOf, recordIn, withEntry } from "../../src/engine/group.js";
import { advanced } from "../../src/scripts/pull-hand.js";
import { keptRed } from "../../src/scripts/pull-kept.js";
import { leafOf } from "../../src/scripts/pull-route.js";
import { stepOn } from "../../src/scripts/pull-writes.js";
import { CHILD, doors, filled, ROOT, standing } from "./pull-doors.js";

const RED = "0123abcd0123abcd0123abcd0123abcd0123abcd";
const TEST = "test/level0/one.test.js";
const MOVED = "test/level0/two.test.js";
const RED_LEAF = "implement/tests-red";

const blobsAt = (path, blob) => ({
  [`git ls-tree -r ${RED}`]: { stdout: `100644 blob ${blob}\t${path}\n` },
});
const blobNow = (path, blob) => ({
  [`git hash-object ${path}`]: { stdout: `${blob}\n` },
});

// The child at a step, its red leaf passed at RED and its tests field naming the test. [[spec/tickets/a-rewind-spares-landed-tests]]
function built(step, answers, named = TEST) {
  const front = doors({}).it.front;
  const text = withEntry(
    filled(CHILD("open", step), "### tests", `    ./RUNME.sh test ${named}`),
    { step: RED_LEAF, hand: "box one", hash_before: "a1b2c3", hash_after: RED },
    front,
  );
  const made = doors(standing(text), answers);
  made.it.root = ROOT;
  return { ...made, text, one: { name: "a-child", text, front: frontOf(text) } };
}

test("a red leaf whose tests hold the content they held red stands kept", () => {
  const { it, text } = built(RED_LEAF, {
    ...blobsAt(TEST, "aaa"),
    ...blobNow(TEST, "aaa"),
  });
  assert.equal(keptRed(it, text, leafOf(frontOf(text), RED_LEAF))?.kept, RED);
});

// The rewind the-retro-reads-the-backlog meets: a rename moves a test the draft names. [[spec/tickets/a-rewind-spares-landed-tests]]
test("a rename moving a test keeps the red leaf, because its content stands", () => {
  const { it, text } = built(
    RED_LEAF,
    { ...blobsAt(TEST, "aaa"), ...blobNow(MOVED, "aaa") },
    MOVED,
  );
  assert.equal(keptRed(it, text, leafOf(frontOf(text), RED_LEAF))?.kept, RED);
});

test("a test whose content moved hands the red leaf out again", () => {
  const { it, text } = built(RED_LEAF, {
    ...blobsAt(TEST, "aaa"),
    ...blobNow(TEST, "bbb"),
  });
  assert.equal(keptRed(it, text, leafOf(frontOf(text), RED_LEAF)), null);
});

test("a rewound review passing walks past the kept red leaf to the change", () => {
  const { it, text, one } = built("design/review", {
    ...blobsAt(TEST, "aaa"),
    ...blobNow(TEST, "aaa"),
  });
  const changes = [];
  const said = stepOn(it, one, leafOf(frontOf(text), "design/review"), text, changes);
  assert.equal(frontOf(said).step, "implement/change");
  const kept = recordIn(said).at(-1);
  assert.equal(kept.step, RED_LEAF);
  assert.equal(kept.kept, RED);
  assert.ok(
    changes.some((line) => line.startsWith(`keeps ${RED_LEAF}`)),
    changes.join("\n"),
  );
});

test("a pull meeting a ticket stranded at its red leaf walks it on to the change", () => {
  const { it, one } = built(RED_LEAF, {
    ...blobsAt(TEST, "aaa"),
    ...blobNow(TEST, "aaa"),
  });
  const moved = advanced(it, one, [one]);
  assert.equal(moved.leaf?.path, "implement/change");
});

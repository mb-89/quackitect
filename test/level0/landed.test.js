// The landing over a fake git: a commit the hook refuses puts the ticket back,
// empties the index and answers the finding, and a commit that stands answers
// nothing.
// [[spec/design_output/pull#the-refused-commit]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { landed, landedAlone, unlandedRows } from "../../src/scripts/pull-landed.js";

const AT = "/tree/spec/tickets/a-child.md";
const WROTE = "---\nstate: open\n---\n\n# Ask\n\nA thing.\n";
const RECORDED = `${WROTE}\nrecord: one\n`;

function box(commit) {
  const git = fakeGit(
    { "git commit -m a-child: passes design/draft": commit },
    "/tree",
  );
  const disk = fakeDisk({ [AT]: WROTE });
  return {
    it: { disk, git },
    disk,
    ran: () => git.ran.map((one) => one.argv.join(" ")),
  };
}

const one = { at: AT, name: "a-child", text: RECORDED, private: false };

test("a commit the hook refuses puts the ticket back, empties the index and answers the finding", () => {
  const { it, disk, ran } = box({
    exitCode: 1,
    stderr: "Private\n  'x@y' is private\n",
  });
  const finding = landed(it, one, ["passes design/draft"]);
  assert.equal(finding, "Private\n  'x@y' is private");
  assert.equal(disk.read(AT), WROTE, "the ticket stands as the hand writes it");
  assert.ok(ran().includes("git reset -q"), "the index empties");
});

test("a commit that stands answers nothing, and the record stays on disk", () => {
  const { it, disk, ran } = box({ exitCode: 0 });
  assert.equal(landed(it, one, ["passes design/draft"]), "");
  assert.equal(disk.read(AT), RECORDED);
  assert.ok(ran().includes("git add -A"));
  assert.ok(!ran().includes("git reset -q"));
});

// A skip, a close, a repair or an unblock names another ticket, so a hand's edits stay out of its commit. [[spec/design_output/pull#the-refused-commit]]
test("a side landing stages and commits the ticket files it writes, and nothing else", () => {
  const OTHER = "/tree/spec/tickets/a-successor.md";
  const git = fakeGit(
    {
      [`git commit -m a-child: skips design/draft -- ${AT} ${OTHER}`]: {
        exitCode: 1,
        stderr: "refused",
      },
    },
    "/tree",
  );
  const disk = fakeDisk({ [AT]: WROTE });
  const ran = () => git.ran.map((it) => it.argv.join(" "));

  const finding = landedAlone({ disk, git }, one, ["skips design/draft"], [OTHER]);

  assert.equal(finding, "refused");
  assert.ok(ran().includes(`git add -- ${AT} ${OTHER}`), "the two ticket files stage");
  assert.ok(!ran().includes("git add -A"), "and the rest of the tree stays out");
  assert.ok(
    ran().includes(`git reset -q -- ${AT} ${OTHER}`),
    "a refusal unstages those alone",
  );
  assert.equal(disk.read(AT), WROTE);
});

test("a private note lands on disk alone", () => {
  const { it, disk, ran } = box({ exitCode: 1 });
  assert.equal(landed(it, { ...one, private: true }, ["decides"]), "");
  assert.equal(disk.read(AT), RECORDED);
  assert.equal(ran().length, 0);
});

test("the refusal names the finding and where the ticket stays", () => {
  const rows = unlandedRows(one, { path: "design/draft" }, "Private\n  a line\n");
  assert.deepEqual(rows, [
    "the hook refuses the commit, so nothing lands:",
    "Private",
    "  a line",
    "",
    "Fix it, and a-child stays in hand at design/draft.",
  ]);
});

// The landing over a fake git: a commit the hook refuses puts the ticket back,
// empties the index and answers the finding, and a commit that stands answers
// nothing.
// [[spec/design_output/pull#the-refused-commit]]

import assert from "node:assert/strict";
import { join } from "node:path";
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

// A pass stages the ticket and the files its hand's journals name since the hold, so a sibling hand's edit stays out. [[spec/design_output/pull#the-refused-commit]]
test("a pass stages the ticket and the hand's own paths, and leaves a sibling's edit unstaged", () => {
  const journal = (ticket, at, file) =>
    `${JSON.stringify({ on: "", by: "level0", at, ticket, files: [{ file }] })}\n`;
  const git = fakeGit({}, "/tree");
  const disk = fakeDisk({
    [AT]: WROTE,
    "/tree/.se/.runtime/hold/a-hand.json": JSON.stringify({
      ticket: "a-child",
      taken: "2026-01-02T00:00:00.000Z",
    }),
    "/tree/.se/.runtime/undo/20260101000000000000.json": journal(
      "a-child",
      "2026-01-01T00:00:00.000Z",
      "src/old.js",
    ),
    "/tree/.se/.runtime/undo/20260103000000000000.json": journal(
      "a-child",
      "2026-01-03T00:00:00.000Z",
      "src/mine.js",
    ),
    "/tree/.se/.runtime/undo/20260104000000000000.json": journal(
      "a-sibling",
      "2026-01-04T00:00:00.000Z",
      "src/theirs.js",
    ),
  });
  const ran = () => git.ran.map((it) => it.argv.join(" "));

  const finding = landed({ disk, git, root: "/tree", join }, one, [
    "passes design/draft",
  ]);

  assert.equal(finding, "");
  assert.ok(
    ran().includes(`git add -- ${AT} /tree/src/mine.js`),
    "the hand's paths stage",
  );
  assert.ok(!ran().includes("git add -A"), "the whole tree stays out");
  assert.ok(
    ran().includes(
      `git commit -m a-child: passes design/draft -- ${AT} /tree/src/mine.js`,
    ),
    "the commit takes the ticket and the hand's paths",
  );
  assert.ok(
    !ran().some((row) => row.includes("theirs.js")),
    "the sibling's edit stays unstaged",
  );
  assert.ok(
    !ran().some((row) => row.includes("old.js")),
    "an edit before the hold stays out",
  );
});

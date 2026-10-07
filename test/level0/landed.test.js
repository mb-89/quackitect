// The landing over a fake git: a commit the hook refuses puts the ticket back,
// empties the index and answers the finding, and a commit that stands answers
// nothing.
// [[spec/design_output/pull#the-refused-commit]]

import assert from "node:assert/strict";
// The fixtures stand on posix paths, so the verb joins them the same way on every platform. [[spec/tickets/ci-runs-a-windows-job]]
import { posix } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { landed, landedAlone, unlandedRows } from "../../src/scripts/pull-landed.js";
import { OPENS } from "./fixtures.js";

const AT = "/tree/spec/tickets/a-child.md";
const { join } = posix;
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
    "/tree/src/mine.js": "export const one = 1;\n",
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

// Several hands hold on one box, and a pass reads the hold of its own ticket. [[spec/design_output/pull#the-refused-commit]]
test("a pass reads the hold its own ticket stands under, past a sibling's later hold", () => {
  const git = fakeGit({}, "/tree");
  const disk = fakeDisk({
    [AT]: WROTE,
    "/tree/src/mine.js": "export const one = 1;\n",
    "/tree/.se/.runtime/hold/a-hand.json": JSON.stringify({
      ticket: "a-sibling",
      taken: "2026-01-05T00:00:00.000Z",
    }),
    "/tree/.se/.runtime/hold/b-hand.json": JSON.stringify({
      ticket: "a-child",
      taken: "2026-01-02T00:00:00.000Z",
    }),
    "/tree/.se/.runtime/undo/20260103000000000000.json": `${JSON.stringify({
      on: "",
      by: "level0",
      at: "2026-01-03T00:00:00.000Z",
      ticket: "a-child",
      files: [{ file: "src/mine.js" }],
    })}\n`,
  });

  assert.equal(landed({ disk, git, root: "/tree", join }, one, ["passes design/draft"]), "");
  assert.ok(
    git.ran.some((it) => it.argv.join(" ") === `git add -- ${AT} /tree/src/mine.js`),
    "the edit after its own hold stages",
  );
});

// A journal names a file git ignores, such as the handover, and git refuses a commit naming it. [[spec/design_output/pull#the-refused-commit]]
test("a pass leaves out a journaled path git ignores", () => {
  const IGNORED = "/tree/.se/HANDOVER.md";
  const git = fakeGit(
    {
      [`git check-ignore -- ${AT} /tree/src/mine.js ${IGNORED}`]: {
        exitCode: 0,
        stdout: `${IGNORED}\n`,
      },
    },
    "/tree",
  );
  const disk = fakeDisk({
    [AT]: WROTE,
    "/tree/src/mine.js": "export const one = 1;\n",
    [IGNORED]: "# Handover\n",
    "/tree/.se/.runtime/hold/a-hand.json": JSON.stringify({
      ticket: "a-child",
      taken: "2026-01-02T00:00:00.000Z",
    }),
    "/tree/.se/.runtime/undo/20260103000000000000.json": `${JSON.stringify({
      ticket: "a-child",
      at: "2026-01-03T00:00:00.000Z",
      files: [{ file: "src/mine.js" }, { file: ".se/HANDOVER.md" }],
    })}\n`,
  });
  const ran = () => git.ran.map((it) => it.argv.join(" "));

  const finding = landed({ disk, git, root: "/tree", join }, one, [
    "passes design/draft",
  ]);

  assert.equal(finding, "");
  assert.ok(
    ran().includes(`git add -- ${AT} /tree/src/mine.js`),
    "the tracked paths stage",
  );
  assert.ok(
    !ran().some((row) => row.startsWith("git add") && row.includes(IGNORED)),
    "the ignored path stays out",
  );
});

// A patch refused at its first file keeps its journal marked unlanded, and a path outside the tree stages nowhere. [[spec/design_output/apply#a-first-fault-writes-nothing]]
test("a pass stages nothing a journal marked unlanded names", () => {
  const OUTSIDE = "/scratch/fields.json";
  const git = fakeGit(
    {
      [`git check-ignore -- ${AT} /tree/src/mine.js`]: { exitCode: 1, stdout: "" },
    },
    "/tree",
  );
  const disk = fakeDisk({
    [AT]: WROTE,
    "/tree/src/mine.js": "export const one = 1;\n",
    "/tree/.se/.runtime/hold/a-hand.json": JSON.stringify({
      ticket: "a-child",
      taken: "2026-01-02T00:00:00.000Z",
    }),
    "/tree/.se/.runtime/undo/20260103000000000000.json": JSON.stringify({
      ticket: "a-child",
      at: "2026-01-03T00:00:00.000Z",
      files: [{ file: "src/mine.js" }],
    }),
    "/tree/.se/.runtime/undo/20260104000000000000.json": JSON.stringify({
      ticket: "a-child",
      at: "2026-01-04T00:00:00.000Z",
      landed: false,
      files: [{ file: OUTSIDE }],
    }),
  });
  const ran = () => git.ran.map((it) => it.argv.join(" "));

  const finding = landed({ disk, git, root: "/tree", join }, one, [
    "passes design/draft",
  ]);

  assert.equal(finding, "");
  assert.ok(
    ran().includes(`git add -- ${AT} /tree/src/mine.js`),
    "the landed path stages",
  );
  assert.ok(
    !ran().some((row) => row.includes(OUTSIDE)),
    "the unlanded path stages nowhere",
  );
});

// A rename moves a file its journal names, so the old path stands nowhere and git refuses a commit naming it. [[spec/design_output/pull#the-refused-commit]]
test("a landing stages no path standing nowhere on disk and nowhere in git", () => {
  const MOVED = "/tree/src/moved.js";
  const LANDED = "/tree/src/landed.js";
  const journal = (file) =>
    JSON.stringify({
      at: "9999-01-01T00:00:00.000Z",
      ticket: "a-child",
      files: [{ file }],
    });
  const git = fakeGit(
    { [`git ls-files --error-unmatch -- ${MOVED}`]: { exitCode: 1 } },
    "/tree",
  );
  const disk = fakeDisk({
    [AT]: WROTE,
    [LANDED]: "the new place\n",
    "/tree/.se/.runtime/undo/1.json": journal("src/moved.js"),
    "/tree/.se/.runtime/undo/2.json": journal("src/landed.js"),
  });
  const ran = () => git.ran.map((one) => one.argv.join(" "));

  assert.equal(
    landed({ disk, git, root: "/tree", join }, one, ["passes design/draft"]),
    "",
  );

  assert.ok(ran().includes(`git add -- ${AT} ${LANDED}`), ran().join("\n"));
  assert.ok(!ran().some((row) => row.startsWith("git add") && row.includes(MOVED)));
});

// A step commit concluding a merge carries its markers, so an unmerged path refuses the landing before anything stages. [[spec/design_output/work#no-commit-carries-a-marker]]
test("a landing while git lists an unmerged path writes nothing, stages nothing and names the path", () => {
  const git = fakeGit(
    { "git ls-files -u": { stdout: "100644 abc123 2\tspec/tickets/a-group.md\n" } },
    "/tree",
  );
  const disk = fakeDisk({ [AT]: WROTE });
  const ran = () => git.ran.map((it) => it.argv.join(" "));

  const finding = landed({ disk, git }, one, ["passes design/draft"]);

  assert.match(finding, /spec\/tickets\/a-group\.md {2}git lists it unmerged/);
  assert.match(finding, /Resolve the merge first/);
  assert.equal(disk.read(AT), WROTE, "the ticket stands as it stood");
  assert.ok(!ran().some((row) => row.startsWith("git add")), ran().join("\n"));
  assert.ok(!ran().some((row) => row.startsWith("git commit")), ran().join("\n"));
});

test("a landing whose staged delta adds a conflict marker commits nothing and puts the ticket back", () => {
  const delta = [
    "diff --git a/src/a.go b/src/a.go",
    "+++ b/src/a.go",
    "@@ -1,0 +2,1 @@",
    `+${OPENS}`,
  ].join("\n");
  const git = fakeGit({ "git diff --cached --unified=0": { stdout: delta } }, "/tree");
  const disk = fakeDisk({ [AT]: WROTE });
  const ran = () => git.ran.map((it) => it.argv.join(" "));

  const finding = landed({ disk, git }, one, ["passes design/draft"]);

  assert.match(finding, /src\/a\.go:2 {2}a conflict marker/);
  assert.equal(disk.read(AT), WROTE);
  assert.ok(ran().includes("git reset -q"), "the index empties");
  assert.ok(!ran().some((row) => row.startsWith("git commit")), ran().join("\n"));
});

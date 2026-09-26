// A design review passing with findings mints one child ticket a row, and the
// parent goes on to the code. The doors these cases drive stand in
// pull-doors.js beside this file.
// [[spec/tickets/one-review-a-ticket]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fieldOf } from "../../src/engine/group.js";
import { pulling } from "../../src/scripts/work.js";
import {
  at,
  CHILD,
  doors,
  filled,
  GROUP_NOTE,
  HOLD,
  heard,
  ROOT,
  standing,
} from "./pull-doors.js";

// The route a child follows, as the tree ships it in spec/processes/trivial.yaml. [[spec/design_output/pull#a-finding-rides-out]]
const TRIVIAL = `for: a fix small enough that the ask is the design
ask:
  - name: gain
    form: text
    says: what is gained by doing it, and not only what it does
  - name: breaks
    form: text
    says: what breaks if it is never done
  - name: done_when
    form: list
    says: one line each, decidable, naming the command that decides it
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    evidence:
      - name: says
        form: text
        says: what changes and why, for a reader who was not there
`;

const FINDINGS = [
  "pass with findings",
  "- cut-the-long-line: the second line runs long",
  "- link-the-note: the note names no link",
].join("\n");

// The parent stands at its review, the verdict filled, and git keeps each commit with the ticket as it stood then. [[spec/design_output/pull#a-finding-rides-out]]
function reviewed(
  rows,
  {
    parent = CHILD("open", "design/review"),
    path = "spec/tickets/a-child.md",
    extra = {},
  } = {},
) {
  const commits = [];
  let disk = null;
  const git = (argv) => {
    if (argv[1] === "commit")
      commits.push({ subject: argv[3], text: disk.read(at(path)) });
    return { exitCode: 0 };
  };
  const files = standing(
    CHILD("closed", "implement/change", "reason: done\n"),
    GROUP_NOTE,
    {
      [at("spec/processes/trivial.yaml")]: TRIVIAL,
      ...extra,
    },
  );
  files[at(path)] = filled(parent, "### verdict", rows);
  const made = doors(files, { git }, { words: 5 });
  disk = made.disk;
  const took = heard(() => pulling(ROOT, ["pull"], made.it));
  commits.length = 0;
  const name = path.split("/").at(-1).replace(/\.md$/, "");
  const back = heard(() => pulling(ROOT, ["pull", name], made.it));
  return { ...made, took, back, commits };
}

const askOf = (text) => text.split("\n# Ask\n")[1]?.split(/\n# /)[0] ?? "";

test("a pass with findings mints one draft child a row on the trivial route, carrying the parent, its group and the finding, in the parent's pass commit", () => {
  const { disk, back, commits } = reviewed(FINDINGS);

  assert.equal(back.code, 0, back.said);
  const parent = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(
    fieldOf(parent, "step"),
    "implement/tests-red",
    "the parent goes on to the code",
  );
  for (const [name, line] of [
    ["cut-the-long-line", "the second line runs long"],
    ["link-the-note", "the note names no link"],
  ]) {
    const path = at(`spec/tickets/${name}.md`);
    assert.ok(disk.exists(path), `${name} stands under spec/tickets`);
    const child = disk.read(path);
    assert.equal(fieldOf(child, "state"), "draft", `${name} stands at draft`);
    assert.equal(
      fieldOf(child, "process"),
      "spec/processes/trivial",
      `${name} follows trivial`,
    );
    assert.equal(fieldOf(child, "parent"), "a-child", `${name} names its parent`);
    assert.equal(
      fieldOf(child, "group"),
      "one-group",
      `${name} lands in the parent's group`,
    );
    assert.match(
      askOf(child),
      new RegExp(line),
      `${name} carries its finding as its Ask`,
    );
  }
  assert.deepEqual(
    commits.map((one) => one.subject),
    ["a-child: passes design/review, mints cut-the-long-line, link-the-note"],
    "one commit lands the parent and its children, and names each child",
  );
});

test("a bare pass, and a plain pass with rows under it, mint no child", () => {
  for (const rows of ["pass", "pass\n- cut-the-long-line: the second line runs long"]) {
    const { disk, back } = reviewed(rows);

    assert.equal(back.code, 0, back.said);
    assert.equal(
      fieldOf(disk.read(at("spec/tickets/a-child.md")), "step"),
      "implement/tests-red",
    );
    assert.equal(
      disk.exists(at("spec/tickets/cut-the-long-line.md")),
      false,
      `${rows} mints no child`,
    );
  }
});

test("a private parent writes its children under .se/tickets, and a parent with no group gives its children none", () => {
  const parent = CHILD("open", "design/review").replace(
    "group: one-group\n",
    "todo: true\n",
  );
  const { disk, took, back } = reviewed(FINDINGS, {
    parent,
    path: ".se/tickets/a-note.md",
  });

  assert.match(
    took.said,
    /^work {2}a-note at design\/review/m,
    "the take hands the private parent out",
  );
  assert.equal(back.code, 0, back.said);
  const child = at(".se/tickets/cut-the-long-line.md");
  assert.ok(disk.exists(child), "the child stands under .se/tickets");
  assert.equal(
    disk.exists(at("spec/tickets/cut-the-long-line.md")),
    false,
    "and nowhere on git",
  );
  assert.equal(fieldOf(disk.read(child), "parent"), "a-note");
  assert.equal(
    fieldOf(disk.read(child), "group"),
    "",
    "a parent with no group gives none",
  );
});

test("a pass with findings the form refuses keeps the hold, writes no child, and names the row", () => {
  const first = "- cut-the-long-line: the second line runs long";
  const cases = [
    { why: "no row", rows: "pass with findings", names: "" },
    {
      why: "a row with no name",
      rows: `pass with findings\n${first}\n- the note names no link`,
      names: "the note names no link",
    },
    {
      why: "a name past the words cap",
      rows: `pass with findings\n${first}\n- one-two-three-four-five-six: a line`,
      names: "one-two-three-four-five-six",
    },
    {
      why: "a name a ticket takes",
      rows: `pass with findings\n${first}\n- a-taken-one: a line`,
      names: "a-taken-one",
    },
    {
      why: "a name twice",
      rows: `pass with findings\n${first}\n- cut-the-long-line: again`,
      names: "cut-the-long-line",
    },
  ];
  for (const one of cases) {
    const { disk, back } = reviewed(one.rows, {
      extra: {
        [at("spec/tickets/a-taken-one.md")]: CHILD(
          "closed",
          "implement/change",
          "reason: done\n",
        ),
      },
    });

    assert.equal(back.code, 1, `${one.why} is refused`);
    assert.match(
      back.said,
      /verdict under design\/review/,
      `${one.why} names the field`,
    );
    if (one.names)
      assert.ok(back.said.includes(one.names), `${one.why} names ${one.names}`);
    assert.ok(disk.exists(HOLD), `${one.why} keeps the hold`);
    assert.equal(
      fieldOf(disk.read(at("spec/tickets/a-child.md")), "step"),
      "design/review",
    );
    assert.equal(
      disk.exists(at("spec/tickets/cut-the-long-line.md")),
      false,
      `${one.why} writes no child, the good row's either`,
    );
  }
});

// The cap is a ceiling, so the refusal says so. [[spec/tickets/the-small-faults-land]]
test("a finding named past the cap says a ticket name holds at most the cap", () => {
  const { back } = reviewed(
    "pass with findings\n- one-two-three-four-five-six: a line",
  );
  assert.equal(back.code, 1, back.said);
  assert.match(
    back.said,
    /names one-two-three-four-five-six, and a ticket name holds at most 5 words/,
  );
});

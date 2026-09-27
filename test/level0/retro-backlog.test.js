// The retro's backlog read: every prose criterion a ticket the window closes
// carries, printed for a verdict, and the verb green once each holds one.
// [[spec/tickets/the-retro-reads-the-backlog]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeTrunk } from "../../src/doors/fake/git.js";
import { retro } from "../../src/scripts/retro.js";

const ROOT = "/tree";
const RETRO = "retro-a1b2c3";
const home = (path) => join(ROOT, ".se", ".retro", RETRO, path);
const ticketPath = (name) => `spec/tickets/${name}.md`;
const PROSE = "the owner reads the queue in one glance";
const COMMAND = "`./RUNME.sh check` exits 0";

function ticket(state, front = [], ask = [PROSE, COMMAND]) {
  return [
    "---",
    "kind: [[ticket]]",
    `state: ${state}`,
    ...front,
    "---",
    "",
    "# Ask",
    "",
    "The queue reads at a glance.",
    "",
    ...ask.map((one) => `- ${one}`),
    "",
    "# do",
    "",
    "- a line outside the ask",
    "",
  ].join("\n");
}

const COMMITS = [
  {
    sha: "old1",
    at: "2026-09-05T09:00:00+00:00",
    trunk: true,
    changes: { [ticketPath("an-old-one")]: ticket("closed", [], ["an old criterion"]) },
  },
  {
    sha: "c1",
    at: "2026-09-12T09:00:00+00:00",
    trunk: true,
    changes: { [ticketPath("a-backlog-one")]: ticket("closed") },
  },
  {
    sha: "c2",
    at: "2026-09-13T09:00:00+00:00",
    trunk: true,
    changes: {
      [ticketPath("a-member")]: ticket(
        "closed",
        ["group: a-group"],
        ["a member's criterion"],
      ),
    },
  },
  {
    sha: "c3",
    at: "2026-09-14T09:00:00+00:00",
    trunk: true,
    changes: {
      [ticketPath("a-group")]: ticket(
        "closed",
        ["process: [[spec/processes/group]]"],
        ["a group's criterion"],
      ),
    },
  },
];

function doors(files = {}) {
  return {
    disk: fakeDisk({
      [home("collected.json")]: JSON.stringify({
        at: "2026-09-20T00:00:00.000Z",
        since: "2026-09-10T00:00:00.000Z",
      }),
      ...files,
    }),
    join,
    git: fakeTrunk(COMMITS),
  };
}

function heard(run) {
  const said = [];
  const log = console.log;
  const error = console.error;
  console.log = (...one) => said.push(one.join(" "));
  console.error = (...one) => said.push(one.join(" "));
  try {
    return { code: run(), said: said.join("\n") };
  } finally {
    console.log = log;
    console.error = error;
  }
}

// [[spec/tickets/the-retro-reads-the-backlog]]
test("the backlog verb prints each prose criterion of a backlog ticket the window closes", () => {
  const { said } = heard(() => retro(ROOT, ["backlog", RETRO], doors()));

  assert.match(said, new RegExp(`a-backlog-one {2}${PROSE}`));
  assert.doesNotMatch(said, /an old criterion/, "a close before the window stays out");
  assert.doesNotMatch(said, /a line outside the ask/);
});

// [[spec/tickets/the-retro-reads-the-backlog]]
test("the backlog verb answers 1 while a criterion holds no verdict, and 0 once each does", () => {
  assert.equal(heard(() => retro(ROOT, ["backlog", RETRO], doors())).code, 1);

  const bare = { "a-backlog-one": { [PROSE]: "holds" } };
  assert.equal(
    heard(() =>
      retro(
        ROOT,
        ["backlog", RETRO],
        doors({ [home("backlog.json")]: JSON.stringify(bare) }),
      ),
    ).code,
    1,
    "a verdict with no reason stands short",
  );

  for (const verdict of [
    "holds: the queue view shows it",
    "falls short: the view scrolls",
  ]) {
    const judged = { "a-backlog-one": { [PROSE]: verdict } };
    const { code, said } = heard(() =>
      retro(
        ROOT,
        ["backlog", RETRO],
        doors({ [home("backlog.json")]: JSON.stringify(judged) }),
      ),
    );
    assert.equal(code, 0, said);
  }
});

// [[spec/tickets/the-retro-reads-the-backlog]]
test("a group's ticket and a criterion naming a command stay out", () => {
  const { said } = heard(() => retro(ROOT, ["backlog", RETRO], doors()));

  assert.doesNotMatch(said, /a member's criterion/);
  assert.doesNotMatch(said, /a group's criterion/);
  assert.doesNotMatch(said, /RUNME\.sh check/);
});

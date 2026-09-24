// A dry run of the server's stop door: one answer passes the answer gate and
// then the vote, over the rules this tree ships, so gates asking for clashing
// shapes of one answer fail here before a turn loops between them.
// [[spec/design_output/stop#the-stop-is-one-line]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { TOOLS as SURVEY } from "../../.claude/skills/level0/lib/tools.js";
import { boxOf, decide } from "../../src/bridge/server.js";
import { disk } from "../../src/doors/disk.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const TREE = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const RULES = "spec/config/stop/level0.yml";
const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const CONFIG = {
  stop: { enabled: true, mostInARow: 3, hold: "off" },
  answer: { enabled: true, warnAt: 5, ceiling: 15, words: 150 },
  engine: { binding: "unbound" },
  refactor: {
    parallel: true,
    mostWarnings: 2,
    mostAtOnce: 1,
    untouchedFor: "7d",
  },
};
const WARNINGS = Array.from({ length: 3 }, () => ({
  file: "old.md",
  rule: "VoiceParagraph.Sentence",
  line: 1,
}));
const DONE = "stop: the-work-stands-complete";
const REPORT = [
  "- The work stands complete.",
  "",
  "## What the agent needs",
  "",
  "| No. | question | proposed answer |",
  "|---|---|---|",
  "| 1 | Which ticket comes next? | Name one. |",
  "",
  DONE,
].join("\n");

// A vale asking every answer to open on a list, the way ShapeAnswer does. [[spec/design_output/doors#a-fake-behaves]]
const SHAPE = {
  stands: () => true,
  lint: async (text) => ({
    ran: true,
    found: /^\s*[-|]/.test(text)
      ? []
      : [
          {
            rule: "VoiceParagraph.ShapeAnswer",
            line: 1,
            column: 1,
            severity: "error",
            message: "An answer opens with a list.",
            said: text.split("\n")[0],
          },
        ],
  }),
};

function served(plan = { working: "", todos: [], places: {} }) {
  return boxOf(ROOT, ROOT, {
    disk: fakeDisk({
      [at("spec/config/level0.json")]: JSON.stringify(CONFIG),
      [at(RULES)]: disk().read(join(TREE, RULES)),
      [at(SURVEY)]: "{}",
      [at(".se/.runtime/refactor.json")]: JSON.stringify(WARNINGS),
      [at(".se/.runtime/plan.json")]: JSON.stringify(plan),
    }),
    clock: fakeClock(),
    proc: fakeProc({
      "git rev-parse --abbrev-ref HEAD": { stdout: "work/a-branch\n" },
      git: () => ({ stdout: "" }),
    }),
    log: fakeLog(fakeClock(), { level: "debug" }),
    index: { warm: () => ({ warmed: false }), dead: () => "" },
    vale: SHAPE,
  });
}

const stops = (box, text) =>
  decide({ event: "classic.Stop", e: { last_assistant_message: text } }, box);
const blockOf = (said) => String(said?.result?.block ?? "");

// [[spec/design_output/stop#the-stop-is-one-line]]
test("the stop line alone ends a finished turn over warnings past the number", async () => {
  const said = await stops(served(), DONE);
  assert.equal(blockOf(said), "", "neither gate holds the turn");
});

// [[spec/design_output/stop#a-check-beats-a-claim]]
test("a report closing on the stop line ends a finished turn over warnings past the number", async () => {
  const said = await stops(served(), REPORT);
  assert.equal(blockOf(said), "", "neither gate holds the turn");
});

// [[spec/design_output/stop#a-check-beats-a-claim]]
test("a claim of done over an open todo holds the turn, and names the todo", async () => {
  const plan = {
    working: "",
    todos: [{ title: "a todo", details: "", todo: "true" }],
    places: {},
  };
  const said = await stops(served(plan), DONE);
  assert.match(blockOf(said), /a todo/);
});

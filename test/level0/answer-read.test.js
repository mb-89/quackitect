// The answer gate's reading: a draft past the warning edge holds no turn, and
// its findings ride the next call of the agent's own and the log. The cases
// drive the module over a box built by hand, since no server builds one.
// [[spec/design_output/level0#the-gate-reads-the-answer]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { answerRides, gatesAnswer, readsAnswer } from "../../src/bridge/answer-read.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const CONFIG = {
  answer: { enabled: true, warnAt: 5, ceiling: 15, words: 150 },
};
const TEXT = "The door leverages the synergy.";
const FOUND = [
  {
    rule: "VoiceVale.Jargon",
    line: 1,
    column: 10,
    severity: "error",
    message: "Name the thing.",
    said: "leverages",
  },
];
const RIDES = /The gate read your last answer at rewrite, and it stands as sent/;
const contextOf = (said) => String(said?.after?.context?.join("\n") ?? "");

// A box over a disk in memory, and a Vale that answers what the case hands it and counts its reads. [[spec/design_output/doors#a-fake-behaves]]
function boxed(found) {
  const reads = [];
  const box = {
    work: ROOT,
    method: ROOT,
    disk: fakeDisk({ [at("spec/config/level0.json")]: JSON.stringify(CONFIG) }),
    log: fakeLog(fakeClock(), { level: "debug" }),
    vale: {
      stands: () => true,
      lint: async (text) => {
        reads.push(text);
        return { ran: true, found };
      },
    },
  };
  return { box, reads };
}

// The draft tool and the gate read one reading. [[spec/design_output/level0#the-tool-reads-a-draft]]
test("the reading answers the band, the score and the findings of a draft", async () => {
  const { box } = boxed(FOUND);

  const read = await readsAnswer(box, TEXT, false);

  assert.equal(read.band, "rewrite");
  assert.equal(read.found.length, 1);
  assert.equal(read.found[0].rule, "VoiceVale.Jargon");
  assert.ok(read.score > CONFIG.answer.ceiling);
  const stopping = await readsAnswer(box, TEXT, true);
  assert.equal(
    stopping.found.length,
    2,
    "a stop for the owner asks for the needs table too",
  );
});

// The band tells the owner nothing to act on, so the line stands at debug under its own kind. [[spec/design_output/level0#the-three-bands]]
test("the reading writes a draft line at debug", async () => {
  const { box } = boxed(FOUND);

  await readsAnswer(box, TEXT, false);

  const drafts = box.log.lines().filter((one) => one.kind === "draft");
  assert.deepEqual(
    drafts.map((one) => [one.level, one.said]),
    [["debug", "a draft reads rewrite"]],
  );
});

// [[spec/design_output/stop#the-stop-is-one-line]]
test("the stop line alone reads clean, and Vale reads nothing", async () => {
  const { box, reads } = boxed(FOUND);

  const read = await readsAnswer(box, "stop: the-work-stands-complete", true);

  assert.equal(read.band, "clean");
  assert.deepEqual(read.found, []);
  assert.deepEqual(reads, []);
});

// A break of form in an answer warns: the turn goes on, and the findings ride the next call once. [[spec/design_output/level0#the-findings-ride-the-call]]
test("a draft past the ceiling holds no turn, and its findings ride the next call once, and the log", async () => {
  const { box, reads } = boxed(FOUND);

  const said = await gatesAnswer({ last_assistant_message: TEXT }, box);

  assert.equal(said, null, "the gate holds no turn");
  assert.deepEqual(reads, [TEXT], "the gate reads the turn's last text");
  const warned = box.log
    .lines()
    .filter((one) => one.level === "warn" && one.kind === "gate");
  assert.equal(warned.length, 1, "the log carries the warning");
  assert.match(String(warned[0].detail), /VoiceVale\.Jargon/);

  assert.doesNotMatch(
    contextOf(answerRides({ agentId: "a1" }, box)),
    RIDES,
    "a helper's call carries none",
  );
  const next = answerRides({}, box);
  assert.match(contextOf(next), RIDES);
  assert.match(contextOf(next), /Jargon/);
  assert.doesNotMatch(contextOf(answerRides({}, box)), RIDES, "the note rides once");
});

// [[spec/design_output/level0#the-gate-reads-the-answer]]
test("a helper's stop passes ahead of the gate, and Vale reads nothing", async () => {
  const { box, reads } = boxed(FOUND);

  await gatesAnswer({ agentId: "a1", last_assistant_message: TEXT }, box);

  assert.deepEqual(reads, []);
  assert.equal(box.answerWaits, undefined);
});

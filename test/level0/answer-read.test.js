// The answer gate at the server's stop door: a draft past the ceiling holds the
// turn with its findings, a clean one ends, and the holds in a row stop at the
// tooth's own limit.
// [[spec/design_output/level0#the-gate-reads-the-answer]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { TOOLS as SURVEY } from "../../.claude/skills/level0/lib/tools.js";
import { readsAnswer } from "../../src/bridge/answer-read.js";
import { boxOf, decide } from "../../src/bridge/server.js";
import { TOOLS as HAND_TOOLS } from "../../src/bridge/tools.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const CONFIG = {
  stop: { enabled: true, mostInARow: 2, hold: "off" },
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
const REFUSES = /The voice rules refuse this answer/;

// A Vale that answers what the case hands it, and counts its reads. [[spec/design_output/doors#a-fake-behaves]]
function served(found) {
  const reads = [];
  const box = boxOf(ROOT, ROOT, {
    disk: fakeDisk({
      [at("spec/config/level0.json")]: JSON.stringify(CONFIG),
      [at(SURVEY)]: "{}",
    }),
    clock: fakeClock(),
    proc: fakeProc({}),
    log: fakeLog(fakeClock(), { level: "debug" }),
    index: { warm: () => ({ warmed: false }), dead: () => "" },
    vale: {
      stands: () => true,
      lint: async (text) => {
        reads.push(text);
        return { ran: true, found };
      },
    },
  });
  return { box, reads };
}

const stops = (box, e = { last_assistant_message: TEXT }) =>
  decide({ event: "classic.Stop", e }, box);
const blockOf = (said) => String(said?.result?.block ?? "");

// [[spec/design_output/level0#the-gate-reads-the-answer]]
test("a draft past the ceiling holds the turn at the stop door, with its findings", async () => {
  const { box, reads } = served(FOUND);

  const said = await stops(box);

  assert.deepEqual(reads, [TEXT], "the gate reads the turn's last text");
  assert.match(blockOf(said), REFUSES);
  assert.match(blockOf(said), /Jargon/);
});

// [[spec/design_output/level0#the-gate-reads-the-answer]]
test("a clean draft passes the gate to the tooth", async () => {
  const { box, reads } = served([]);

  const said = await stops(box);

  assert.equal(reads.length, 1);
  assert.doesNotMatch(blockOf(said), REFUSES);
});

// The gate holds ahead of the tooth, so the same limit bounds it. [[spec/design_output/level0#the-gate-reads-the-answer]]
test("the gate holds as many turns in a row as stop.mostInARow names, and lets the next one go", async () => {
  const { box } = served(FOUND);

  assert.match(blockOf(await stops(box)), REFUSES);
  assert.match(blockOf(await stops(box)), REFUSES);
  assert.doesNotMatch(
    blockOf(await stops(box)),
    REFUSES,
    "the third stop goes past the gate",
  );
  assert.match(blockOf(await stops(box)), REFUSES, "the count starts again");
});

// [[spec/design_output/level0#the-gate-reads-the-answer]]
test("a helper's stop passes ahead of the gate, and Vale reads nothing", async () => {
  const { box, reads } = served(FOUND);

  const said = await stops(box, { agentId: "a1", last_assistant_message: TEXT });

  assert.equal(said.pass, true);
  assert.equal(blockOf(said), "");
  assert.deepEqual(reads, []);
});

// The draft tool and the gate read one reading. [[spec/design_output/level0#the-tool-reads-a-draft]]
test("the reading answers the band, the score and the findings of a draft", async () => {
  const { box } = served(FOUND);

  const read = await readsAnswer(box, TEXT, false);

  assert.equal(read.band, "rewrite");
  assert.equal(read.found.length, 1);
  assert.equal(read.found[0].rule, "VoiceVale.Jargon");
  assert.ok(read.score > CONFIG.answer.ceiling);
  const stopping = await readsAnswer(box, TEXT, true);
  assert.equal(stopping.found.length, 2, "a stop for the owner asks for the needs table too");
});

// The band tells the owner nothing to act on, so the line stands at debug under its own kind. [[spec/design_output/level0#the-three-bands]]
test("the reading and the hold write a draft line at debug, and no answer line", async () => {
  const { box } = served(FOUND);

  await stops(box);

  const drafts = box.log.lines().filter((one) => one.kind === "draft");
  assert.deepEqual(
    drafts.map((one) => [one.level, one.said]),
    [
      ["debug", "a draft reads rewrite"],
      ["debug", "the gate holds the turn for a rewrite"],
    ],
  );
  assert.equal(box.log.lines().filter((one) => one.kind === "answer").length, 0);
});

// `checksAnswer` in the hand tools answers the same reading in the gate's wording. [[spec/design_output/level0#the-tool-reads-a-draft]]
test("the draft tool answers the reading's findings, and a box with no Vale reads nothing", async () => {
  const checks = HAND_TOOLS.mcp__level0__check_answer;
  const { box } = served(FOUND);

  const said = String((await checks({ text: TEXT }, box)).result.result);
  assert.match(said, REFUSES);
  assert.match(said, /level0-answer\.md:1:10 {2}VoiceVale\.Jargon/);

  box.vale = { stands: () => false };
  assert.match(
    String((await checks({ text: TEXT }, box)).result.result),
    /No vale stands here/,
  );
});

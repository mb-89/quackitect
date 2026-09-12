// The voice verbs over the fake doors. Each case seeds a disk, teaches the
// process door one answer, and reads the lines the verb prints.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { voice } from "../../src/scripts/voice.js";

const ROOT = "/tree";
const BIN = "/tree/.se/bin/vale";
const TEN = "one two three four five six seven eight nine ten";

const valeArgv = (folder) => [
  BIN,
  "--config=.vale.ini",
  "--output=JSON",
  "--no-exit",
  folder,
].join(" ");

const finding = (rule) => ({
  Check: rule,
  Line: 1,
  Span: [1, 4],
  Match: "x",
  Message: "m",
  Severity: "error",
});

async function said(run) {
  const lines = [];
  const was = console.log;
  console.log = (one = "") => lines.push(String(one));
  try {
    const code = await run();
    return { code, lines, text: lines.join("\n") };
  } finally {
    console.log = was;
  }
}

test("a fixture folder scores the number this case names", async () => {
  const disk = fakeDisk({
    [`${ROOT}/docs/a.md`]: `${TEN}\n`,
    [`${ROOT}/docs/b.md`]: `${TEN}\n`,
    [BIN]: "",
  });
  const proc = fakeProc({
    [valeArgv("docs")]: {
      stdout: JSON.stringify({ "docs/a.md": [finding("VoiceVale.LongSentence")] }),
    },
  });

  const out = await said(() =>
    voice(ROOT, ["measure", "docs"], { disk, proc, clock: fakeClock() }, BIN),
  );

  assert.equal(out.code, 0);
  assert.match(out.text, /^docs\/a\.md\s+10\s+1\s+100\.0\s+LongSentence 1$/m);
  assert.match(out.text, /^docs\/b\.md\s+10\s+0\s+0\.0$/m);
  assert.match(out.text, /^TOTAL\s+20\s+1\s+50\.0$/m, "one finding in 20 words reads as 50");
  assert.match(out.text, /^LongSentence\s+1$/m, "the rule counts close the report");
});

test("a fixture transcript yields its answers as files", async () => {
  const rows = [
    JSON.stringify({
      type: "assistant",
      message: { content: [{ type: "text", text: `${TEN} ${TEN} ${TEN}` }] },
    }),
    JSON.stringify({
      type: "assistant",
      isSidechain: true,
      message: { content: [{ type: "text", text: `${TEN} ${TEN} ${TEN}` }] },
    }),
    JSON.stringify({ type: "user", message: { content: [{ type: "text", text: TEN }] } }),
  ].join("\n");

  const disk = fakeDisk({ [`${ROOT}/logs/sess.jsonl`]: rows, [BIN]: "" });
  const proc = fakeProc({ [valeArgv(".se/measure")]: { stdout: "{}" } });

  const out = await said(() =>
    voice(ROOT, ["measure", "--transcripts", "logs"], { disk, proc, clock: fakeClock() }, BIN),
  );

  assert.equal(out.code, 0);
  assert.equal(
    disk.read(`${ROOT}/.se/measure/sess/001-answer.md`),
    `${TEN} ${TEN} ${TEN}\n`,
    "the answer lands under a name the answer register reads",
  );
  assert.equal(
    disk.exists(`${ROOT}/.se/measure/sess/002-answer.md`),
    false,
    "the sidechain and the user turn write nothing",
  );
  assert.match(out.text, /^1 answer\(s\) under \.se\/measure\.$/m);
  assert.match(out.text, /^TOTAL\s+30\s+0\s+0\.0$/m);
});

test("a fixture log ranks its rows in the order this case names", async () => {
  const row = (at, more) => JSON.stringify({ at, level: "warn", kind: "write", ...more });
  const rows = [
    ...new Array(3).fill(0).map(() => row("2026-09-11T00:00:00.000Z", { rule: "VoiceVale.PastTense", phrase: "bold" })),
    ...new Array(2).fill(0).map(() => row("2026-09-10T00:00:00.000Z", { rule: "Shell.WritesNothing", tool: "Bash" })),
    row("2026-08-01T00:00:00.000Z", { rule: "VoiceVale.Passive", phrase: "old" }),
    row("2026-09-11T00:00:00.000Z", { said: "this row names no rule" }),
  ].join("\n");

  const disk = fakeDisk({ [`${ROOT}/.se/log/session.jsonl`]: rows });
  const clock = fakeClock("2026-09-12T00:00:00.000Z");

  const out = await said(() =>
    voice(ROOT, ["refused"], { disk, clock, proc: fakeProc({}) }, BIN),
  );

  assert.equal(out.code, 0);
  assert.deepEqual(out.text.split("\n"), [
    "rule           fires  phrase",
    "PastTense          3  bold",
    "WritesNothing      2  Bash",
  ]);
});

test("a wider day count reaches the row the week leaves out", async () => {
  const rows = JSON.stringify({
    at: "2026-08-01T00:00:00.000Z",
    level: "warn",
    rule: "VoiceVale.Passive",
    phrase: "old",
  });
  const disk = fakeDisk({ [`${ROOT}/.se/log/old/one.jsonl`]: rows });
  const clock = fakeClock("2026-09-12T00:00:00.000Z");
  const doors = { disk, clock, proc: fakeProc({}) };

  const week = await said(() => voice(ROOT, ["refused"], doors, BIN));
  assert.match(week.text, /^No door refuses anything in 7 day\(s\)\.$/m);

  const year = await said(() => voice(ROOT, ["refused", "365"], doors, BIN));
  assert.match(year.text, /^Passive\s+1\s+old$/m, "the old file under log\\/old counts too");
});

test("the help names both verbs, and an unknown one is refused", async () => {
  const doors = { disk: fakeDisk({}), clock: fakeClock(), proc: fakeProc({}) };

  const help = await said(() => voice(ROOT, [], doors, BIN));
  assert.equal(help.code, 0);
  assert.match(help.text, /measure <folder>/, "the help names measure");
  assert.match(help.text, /refused \[days\]/, "the help names refused");
  assert.match(help.text, /--transcripts/);

  const wrong = await said(() => voice(ROOT, ["nobody"], doors, BIN));
  assert.equal(wrong.code, 2, "a verb nobody holds answers two");
});

test("measure says so where Vale is absent, and where no file stands", async () => {
  const disk = fakeDisk({ [`${ROOT}/docs/a.md`]: TEN, [BIN]: "" });
  const doors = { disk, clock: fakeClock(), proc: fakeProc({}) };

  const gone = await said(() => voice(ROOT, ["measure", "docs"], doors, "/nowhere/vale"));
  assert.equal(gone.code, 2, "no Vale means nothing is measured");

  const empty = await said(() => voice(ROOT, ["measure", "nothing"], doors, BIN));
  assert.equal(empty.code, 1, "an empty folder answers one");
});

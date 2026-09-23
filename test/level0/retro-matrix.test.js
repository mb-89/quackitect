// The retro's reading, driven through fake doors: the timeline over the input,
// the chapters a hand cuts, and the matrix the readers fill.
// [[spec/guidance/retro/read]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { findingsOf, ROWS } from "../../src/engine/retro/findings.js";
import { reportOf } from "../../src/engine/retro/report.js";
import { retro } from "../../src/scripts/retro.js";

const ROOT = "/tree";
const RETRO = "retro-a1b2c3";
const at = (path) => join(ROOT, ".se", ".retro", RETRO, ...path.split("/"));
const line = (field, when, more = "") => `{"${field}":"${when}"${more}}`;

const INPUT = {
  [at("input/transcripts/one/a.jsonl")]: [
    line("timestamp", "2026-09-19T08:10:00.000Z"),
    '{"type":"no time here"}',
    line("timestamp", "2026-09-19T15:20:00.000Z", ',"is_error":true'),
  ].join("\n"),
  [at("input/log/session.jsonl")]: [
    line("at", "2026-09-19T08:30:00.000Z"),
    line("at", "2026-09-19T16:00:00.000Z", ',"level":"warn"'),
  ].join("\n"),
};

const CUTS = JSON.stringify([
  {
    id: "c1",
    title: "the morning",
    from: "2026-09-19T08:00:00.000Z",
    to: "2026-09-19T14:00:00.000Z",
  },
  {
    id: "c2",
    title: "the afternoon",
    from: "2026-09-19T14:00:00.000Z",
    to: "2026-09-19T20:00:00.000Z",
  },
]);

function doors(files = INPUT) {
  return { disk: fakeDisk(files), join, git: { run: () => ({ ok: true, out: "" }) } };
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

const findings = (rows) =>
  ROWS.map(
    (row) => `## ${row}\n\n${(rows[row] ?? []).map((one) => `- ${one}`).join("\n")}\n`,
  ).join("\n");

// [[spec/guidance/retro/chapter]]
test("the timeline counts every timed line by hour, and a line with no time takes the time before it", () => {
  const it = doors();
  const { code, said } = heard(() => retro(ROOT, ["timeline", RETRO], it));

  assert.equal(code, 0, said);
  const hours = JSON.parse(it.disk.read(at("timeline.json")));
  assert.deepEqual(
    hours.map((one) => [one.hour, one.transcripts, one.log, one.faults]),
    [
      ["2026-09-19T08", 2, 1, 0],
      ["2026-09-19T15", 1, 0, 1],
      ["2026-09-19T16", 0, 1, 1],
    ],
  );
  assert.match(said, /6 idle hour\(s\)/);
});

// [[spec/guidance/retro/chapter]]
test("chapters hand every line to one chapter, as line ranges per file", () => {
  const it = doors({ ...INPUT, [at("chapters.json")]: CUTS });
  const { code, said } = heard(() => retro(ROOT, ["chapters", RETRO], it));

  assert.equal(code, 0, said);
  const one = JSON.parse(it.disk.read(at("chapters/c1.json")));
  assert.deepEqual(one.lines, {
    "log/session.jsonl": [[1, 1]],
    "transcripts/one/a.jsonl": [[1, 2]],
  });
  const two = JSON.parse(it.disk.read(at("chapters/c2.json")));
  assert.deepEqual(two.lines["transcripts/one/a.jsonl"], [[3, 3]]);
});

test("chapters refuse a gap between two cuts, and a line past every chapter", () => {
  const gap = JSON.stringify([
    {
      id: "c1",
      title: "the morning",
      from: "2026-09-19T08:00:00.000Z",
      to: "2026-09-19T12:00:00.000Z",
    },
    {
      id: "c2",
      title: "the afternoon",
      from: "2026-09-19T14:00:00.000Z",
      to: "2026-09-19T15:00:00.000Z",
    },
  ]);
  const it = doors({ ...INPUT, [at("chapters.json")]: gap });
  const { code, said } = heard(() => retro(ROOT, ["chapters", RETRO], it));

  assert.equal(code, 1);
  assert.match(said, /c1 ends apart from where c2 starts/);
  assert.equal(it.disk.exists(at("chapters/c1.json")), false);

  const short = JSON.stringify([JSON.parse(gap)[0]]);
  const past = doors({ ...INPUT, [at("chapters.json")]: short });
  assert.match(
    heard(() => retro(ROOT, ["chapters", RETRO], past)).said,
    /2 timed line\(s\) fall past every chapter/,
  );
});

// [[spec/guidance/retro/read]]
test("a findings file reads a section per row, and a missing section reads null", () => {
  const read = findingsOf("## stop\n\n- the panel waits for a file\n\n## keep\n");
  assert.deepEqual(read.stop, ["the panel waits for a file"]);
  assert.deepEqual(read.keep, []);
  assert.equal(read.more, null);
});

// A file a Windows editor writes ends each line on a carriage return too. [[spec/guidance/retro/read]]
test("a findings file with carriage returns reads the same items", () => {
  const read = findingsOf(
    "## stop\r\n\r\n- the panel waits for a file\r\n\r\n## keep\r\n",
  );
  assert.deepEqual(read.stop, ["the panel waits for a file"]);
  assert.deepEqual(read.keep, []);
});

test("the matrix refuses a chapter without findings, and draws references with the details under them", () => {
  const files = {
    ...INPUT,
    [at("chapters.json")]: CUTS,
    [at("findings/c1.md")]: findings({
      stop: ["one", "two"],
      mechanize: ["answers c1.stop.1"],
    }),
  };
  const missing = heard(() => retro(ROOT, ["matrix", RETRO], doors(files)));
  assert.equal(missing.code, 1);
  assert.match(missing.said, /findings\/c2.md stands nowhere/);

  const it = doors({
    ...files,
    [at("findings/c2.md")]: findings({ keep: ["the tests"] }),
  });
  const { code, said } = heard(() => retro(ROOT, ["matrix", RETRO], it));
  assert.equal(code, 0, said);
  const report = it.disk.read(at("report.md"));
  assert.match(report, /\| stop \| c1\.stop\.1, c1\.stop\.2 \| · \|/);
  assert.match(report, /- `c1\.mechanize\.1` answers c1\.stop\.1/);
  assert.match(report, /\| keep \| · \| c2\.keep\.1 \|/);
});

test("the report puts the field feedback beside the chapters", () => {
  const columns = [
    { id: "c1", title: "the morning", findings: { start: ["a"] } },
    { id: "feedback", title: "field feedback", findings: { code: ["b"] } },
  ];
  const report = reportOf(RETRO, columns);
  assert.match(report, /\| \| c1 · the morning \| feedback · field feedback \|/);
  assert.match(report, /\| code \| · \| feedback\.code\.1 \|/);
});

// [[spec/guidance/retro/effect]]
test("the report draws the battery beside the effect, part by part, with the cases that moved", () => {
  const effect = {
    last: "retro-0000000",
    classes: [],
    battery: {
      total: { before: 1300, now: 1820 },
      parts: [{ part: "tests", before: 1000, now: 1500, delta: 500 }],
      fresh: [{ name: "arrives", ms: 80, file: "b.js" }],
      grown: [{ name: "grows", before: 100, ms: 200 }],
      gone: [{ name: "leaves", ms: 50 }],
      files: [{ name: "a.js", before: 300, now: 400 }],
      unrun: ["rules"],
      red: [{ file: "a.js", name: "grows", said: "too slow" }],
      spawns: { before: { all: 200, vale: 150 }, now: { all: 20, vale: 8 } },
    },
  };
  const report = reportOf(RETRO, [], { effect });
  assert.match(report, /### The battery/);
  assert.match(report, /1300 ms at the last retro, 1820 ms at this one\./);
  assert.match(report, /\| tests \| 1000 \| 1500 \| 500 \|/);
  assert.match(report, /- b\.js · arrives \(80 ms\)/);
  assert.match(report, /- grows \(100 to 200 ms\)/);
  assert.match(report, /- leaves \(50 ms\)/);
  assert.match(
    report,
    /Spawns: 20 spawns, 8 of them Vale, against 200 spawns, 150 of them Vale at the last retro\./,
  );
  assert.match(report, /\| a\.js \| 300 \| 400 \|/);
  assert.match(report, /Parts left unrun:\n\n- rules/);
  assert.match(report, /- a\.js · grows: too slow/);
  assert.doesNotMatch(reportOf(RETRO, [], { effect: { classes: [] } }), /The battery/);
});

// A class with no status stands open at the retro's check step, and the report names that step. [[spec/guidance/retro/check]]
test("a class the check step leaves open reads so in the report", async () => {
  const { CATEGORIES } = await import("../../src/engine/retro/findings.js");
  const record = {
    classes: [
      {
        id: "k1",
        class: "one class",
        category: CATEGORIES[0],
        defect: "a defect",
        fix: "a fix",
      },
    ],
    dispositions: {},
  };
  const rates = { hours: 1, classes: { k1: { count: 1, rate: 1 } } };
  assert.match(
    reportOf(RETRO, [], { record, rates }),
    /\| the check step stands open \|/,
  );
});

// A hand-back records the verb's last line, so the line carries no path of the box. [[spec/design_output/private#the-box-names-the-owner]]
test("the matrix answers with the retro's name and no path of the box", async () => {
  const { matrix } = await import("../../src/engine/retro/matrix.js");
  const it = doors({
    ...INPUT,
    [at("chapters.json")]: CUTS,
    [at("findings/c1.md")]: findings({ stop: ["one"] }),
    [at("findings/c2.md")]: findings({ keep: ["the tests"] }),
  });
  it.root = ROOT;
  it.work = ROOT;
  const { said } = heard(() => matrix(it, RETRO));
  assert.match(said, new RegExp(`The report of ${RETRO} draws`));
  assert.doesNotMatch(said, /[A-Za-z]:[\\/]|\/tree\//);
});

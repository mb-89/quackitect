// The retro's class fixes and their effect, driven through fake doors: every
// finding carries a disposition, each class a rate, and the next retro counts
// the same patterns again.
// [[spec/guidance/retro/classify]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { verdictOf } from "../../src/engine/retro/effect.js";
import { ROWS } from "../../src/engine/retro/findings.js";
import { retro } from "../../src/scripts/retro.js";

const ROOT = "/tree";
const at = (retroName, path) =>
  join(ROOT, ".se", ".retro", retroName, ...path.split("/"));
const FIRST = "retro-one";
const SECOND = "retro-two";

const findings = (rows) =>
  ROWS.map(
    (row) => `## ${row}\n\n${(rows[row] ?? []).map((one) => `- ${one}`).join("\n")}\n`,
  ).join("\n");

const CUTS = JSON.stringify([
  {
    id: "c1",
    title: "the day",
    from: "2026-09-19T08:00:00.000Z",
    to: "2026-09-19T20:00:00.000Z",
  },
]);

const LOG = [
  '{"at":"2026-09-19T08:10:00.000Z","said":"PastTense refused"}',
  '{"at":"2026-09-19T09:10:00.000Z","said":"PastTense refused"}',
  '{"at":"2026-09-19T09:20:00.000Z","said":"a quiet line"}',
].join("\n");

const CLASS = {
  id: "k1",
  category: "mechanize",
  class: "commit messages meet the voice rules late",
  defect: "a commit message fails the tense rule at the commit",
  fix: "a commit verb lints the message first",
  measure: { source: "log", pattern: "PastTense" },
  tickets: ["the-commit-lints-first"],
};

function tree(retroName, record, more = {}) {
  return {
    [at(retroName, "input/log/session.jsonl")]: LOG,
    [at(retroName, "chapters.json")]: CUTS,
    [at(retroName, "findings/c1.md")]: findings({
      stop: ["a message fails"],
      keep: ["the tests"],
    }),
    [at(retroName, "classes.json")]: JSON.stringify(record),
    ...more,
  };
}

function doors(files) {
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

const WHOLE = {
  classes: [CLASS],
  dispositions: {
    "c1.stop.1": "k1",
    "c1.keep.1": "dropped: a practice, and nothing to change",
  },
  promotions: [
    { what: "the log reader script", from: ".se/scripts", to: "a log verb" },
  ],
};

test("classes refuse a finding with no disposition, and a disposition naming nothing", () => {
  const record = {
    classes: [CLASS],
    dispositions: { "c1.stop.1": "k9" },
    promotions: [],
  };
  const { code, said } = heard(() =>
    retro(ROOT, ["classes", FIRST], doors(tree(FIRST, record))),
  );

  assert.equal(code, 1);
  assert.match(said, /c1\.keep\.1 carries no disposition/);
  assert.match(
    said,
    /c1\.stop\.1 names k9, which is no class and no dropped: or done: or ticket: with its reason/,
  );
});

test("every collected note and memory answers where it goes, and the report lists them with the checklist and the limits", () => {
  const files = tree(FIRST, WHOLE, {
    [at(FIRST, "input/tickets/a-parked-thought.md")]: "---\nkind: [[ticket]]\n---\n",
    [at(FIRST, "input/memory/the-project/MEMORY.md")]: "- an index line\n",
    [at(FIRST, "input/memory/the-project/a-rule.md")]: "a remembered rule\n",
  });
  const missing = heard(() => retro(ROOT, ["classes", FIRST], doors(files)));
  assert.equal(missing.code, 1);
  assert.match(missing.said, /note:a-parked-thought carries no disposition/);
  assert.match(missing.said, /memory:a-rule carries no disposition/);
  assert.doesNotMatch(missing.said, /memory:MEMORY/);

  const record = {
    ...WHOLE,
    dispositions: {
      ...WHOLE.dispositions,
      "note:a-parked-thought": "done: the land verb carries it",
      "memory:a-rule": "ticket: the-rule-moves-home",
    },
    checklist: [
      {
        item: "Does every change reach the running system?",
        why: "three classes share it",
      },
    ],
    limits: [{ what: "the thinking", why: "the transcripts keep it empty" }],
  };
  const it = doors({ ...files, [at(FIRST, "classes.json")]: JSON.stringify(record) });
  assert.equal(heard(() => retro(ROOT, ["classes", FIRST], it)).code, 0);
  heard(() => retro(ROOT, ["matrix", FIRST], it));
  const report = it.disk.read(at(FIRST, "report.md"));
  assert.match(report, /\| note:a-parked-thought \| done: the land verb carries it \|/);
  assert.match(
    report,
    /## New checklist items[\s\S]*Does every change reach the running system\?/,
  );
  assert.match(
    report,
    /## Limits[\s\S]*\| the thinking \| the transcripts keep it empty \|/,
  );
});

test("an auditor's column joins the matrix beside the chapters", () => {
  const it = doors(
    tree(FIRST, WHOLE, {
      [at(FIRST, "findings/audit-code.md")]: findings({
        stop: ["a header retells its pointer"],
      }),
    }),
  );
  const { said } = heard(() => retro(ROOT, ["classes", FIRST], it));
  assert.match(said, /audit-code\.stop\.1 carries no disposition/);
});

test("classes count each pattern per active hour, and the report opens on them", () => {
  const it = doors(tree(FIRST, WHOLE));
  const { code, said } = heard(() => retro(ROOT, ["classes", FIRST], it));

  assert.equal(code, 0, said);
  const rates = JSON.parse(it.disk.read(at(FIRST, "rates.json")));
  assert.deepEqual(rates, { hours: 2, classes: { k1: { count: 2, rate: 1 } } });

  heard(() => retro(ROOT, ["matrix", FIRST], it));
  const report = it.disk.read(at(FIRST, "report.md"));
  assert.ok(report.indexOf("## Bottom line") < report.indexOf("## The matrix"));
  assert.match(report, /### mechanize/);
  assert.match(
    report,
    /\| k1 · commit messages meet the voice rules late \|.*\| 1 \| the-commit-lints-first \| 1 \|/,
  );
  assert.match(report, /\| the log reader script \| \.se\/scripts \| a log verb \|/);
  assert.match(report, /- `c1\.keep\.1` the tests → dropped: a practice/);
});

// [[spec/guidance/retro/effect]]
test("the next retro counts the last one's patterns again, and names each verdict", () => {
  const files = {
    ...tree(FIRST, WHOLE, {
      [at(FIRST, "collected.json")]: '{"at":"2026-09-19T21:00:00.000Z"}',
    }),
    [at(SECOND, "collected.json")]: '{"at":"2026-09-26T21:00:00.000Z"}',
    [at(SECOND, "input/log/session.jsonl")]: [
      '{"at":"2026-09-26T08:10:00.000Z","said":"PastTense refused"}',
      '{"at":"2026-09-26T09:10:00.000Z","said":"a quiet line"}',
      '{"at":"2026-09-26T10:10:00.000Z","said":"a quiet line"}',
      '{"at":"2026-09-26T11:10:00.000Z","said":"a quiet line"}',
    ].join("\n"),
  };
  const it = doors(files);
  heard(() => retro(ROOT, ["classes", FIRST], it));

  const { code, said } = heard(() => retro(ROOT, ["effect", SECOND], it));

  assert.equal(code, 0, said);
  const effect = JSON.parse(it.disk.read(at(SECOND, "effect.json")));
  assert.equal(effect.last, FIRST);
  assert.deepEqual(
    effect.classes.map((one) => [one.id, one.before.rate, one.now.rate, one.verdict]),
    [["k1", 1, 0.25, "falls"]],
  );
});

test("a verdict reads gone, falls, holds or grows", () => {
  const before = { count: 4, rate: 1 };
  assert.equal(verdictOf(before, { count: 0, rate: 0 }), "gone");
  assert.equal(verdictOf(before, { count: 2, rate: 0.5 }), "falls");
  assert.equal(verdictOf(before, { count: 4, rate: 1 }), "holds");
  assert.equal(verdictOf(before, { count: 8, rate: 2 }), "grows");
});

test("a retro with no earlier class fixes measures nothing, and says so", () => {
  const it = doors({
    [at(SECOND, "collected.json")]: '{"at":"2026-09-26T21:00:00.000Z"}',
  });
  const { code, said } = heard(() => retro(ROOT, ["effect", SECOND], it));
  assert.equal(code, 0);
  assert.match(said, /No earlier retro holds class fixes/);
});

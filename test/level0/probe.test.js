// The probe's reading, as a pure function over log rows. Each fixture is the
// log one road leaves behind, and the claim is the word the verb answers.
// [[spec/design_output/level0#what-the-probe-reads]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { HEARD } from "../../.claude/skills/level0/lib/guidance.js";
import { rowOf } from "../../.claude/skills/level0/lib/log.js";
import { DROPS, readsCompaction, SURVIVES, UNPROVEN } from "../../src/scripts/probe.js";

const AT = "2026-09-12T08:00:00.000Z";

const context = (reason) =>
  rowOf(AT, "info", "context", "5 block(s) reach the session", {
    detail: "level0-rules level0-canary",
    reason,
  });

const compaction = () =>
  rowOf(AT, "info", "compact", "a compaction runs", { trigger: "manual", messages: 3 });

const heard = (said) =>
  rowOf(AT, said === HEARD.same ? "info" : "warn", "level0", said, { detail: "" });

test("two reads and a whole canary answer that the layer survives", () => {
  const read = readsCompaction([
    context("first"),
    heard(HEARD.same),
    compaction(),
    context("re-read"),
    heard(HEARD.same),
  ]);

  assert.equal(read.answer, SURVIVES);
  assert.equal(read.reads, 2);
  assert.equal(read.why, HEARD.same);
});

test("a canary with other numbers after the compaction answers that it drops", () => {
  const read = readsCompaction([
    context("first"),
    heard(HEARD.same),
    compaction(),
    context("re-read"),
    heard(HEARD.other),
  ]);

  assert.equal(read.answer, DROPS);
  assert.equal(read.why, HEARD.other);
});

test("a canary the first read carries counts for no second read", () => {
  const read = readsCompaction([context("first"), heard(HEARD.same), compaction()]);

  assert.equal(read.answer, DROPS);
  assert.equal(read.reads, 1);
  assert.match(read.why, /second time/);
});

test("a re-read carrying no canary at all answers that it drops", () => {
  const read = readsCompaction([context("first"), compaction(), context("re-read")]);

  assert.equal(read.answer, DROPS);
  assert.match(read.why, /carries a canary/);
});

test("a log naming no compaction leaves the road unproven", () => {
  const read = readsCompaction([context("first"), heard(HEARD.same)]);

  assert.equal(read.answer, UNPROVEN);
  assert.equal(read.reads, 1);
  assert.match(read.why, /unproven/);
});

test("a warn line about a refused compaction leaves the road unproven", () => {
  const read = readsCompaction([
    context("first"),
    rowOf(AT, "warn", "compact", "the command road refuses a compaction", {
      detail: "no such command",
    }),
  ]);

  assert.equal(read.answer, UNPROVEN);
});

test("an empty log leaves the road unproven, and names no read", () => {
  const read = readsCompaction([]);

  assert.equal(read.answer, UNPROVEN);
  assert.equal(read.reads, 0);
});

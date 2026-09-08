// The judge and the rule-file reader. The judge takes a classifier of its own,
// so these tests spend no model call.

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  CONTRACT_HEADING,
  DONE,
  dependsOn,
  HELD,
  MINE,
  setStatus,
  statusOf,
  TODO,
  URGENCY,
  urgencyOf,
  waitingOn,
  withContract,
} from "../../scripts/work.js";
import { judgeOf, spansIn } from "../lib/judge.js";
import { readRule } from "../lib/rulefile.js";

const root = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))));
const JUDGED = join(root, "spec", "config", "styles", "VoiceJudged");
const config = JSON.parse(
  readFileSync(join(root, "spec", "config", "level0.json"), "utf8"),
);

const rules = readdirSync(JUDGED)
  .filter((n) => n.endsWith(".yml"))
  .map((n) => ({
    ...readRule(readFileSync(join(JUDGED, n), "utf8")),
    name: n.replace(/\.yml$/, ""),
  }));

test("a rule file reads into scalars and a list", () => {
  const read = readRule(
    [
      "# a comment",
      'message: "say a thing"',
      "level: error",
      "labels:",
      "  - one",
      "  - two",
      "refuses: two",
      "max: 3",
      "on: true",
    ].join("\n"),
  );
  assert.deepEqual(read, {
    message: "say a thing",
    level: "error",
    labels: ["one", "two"],
    refuses: "two",
    max: 3,
    on: true,
  });
});

test("every judged rule carries what the judge needs", () => {
  assert.ok(rules.length, "VoiceJudged holds at least one rule");
  for (const rule of rules) {
    assert.ok(rule.ask, `${rule.name} asks a question`);
    assert.ok(
      Array.isArray(rule.labels) && rule.labels.length >= 2,
      `${rule.name} offers labels`,
    );
    assert.ok(
      rule.labels.includes(rule.refuses),
      `${rule.name} refuses one of its own labels`,
    );
    assert.ok(rule.message, `${rule.name} says what to write instead`);
  }
});

test("a span is a paragraph, and structure carries none", () => {
  const spans = spansIn(
    "A paragraph long enough to be worth a call from the judge here.\n\n- a list item\n\n| a | b |\n",
  );
  assert.equal(spans.length, 1);
  assert.match(spans[0].text, /^A paragraph long enough/);
});

test("a short line costs no model call", () => {
  assert.deepEqual(spansIn("Too short.\n"), []);
});

test("the judge refuses on its refusing label and passes on the other", async () => {
  const judge = judgeOf(config, rules);
  const long =
    "This explains where the thing came from and what somebody once tried before now.";

  const found = await judge.run(long, async () => "background");
  assert.equal(found.length, 1);
  assert.equal(found[0].rule, "Actionable");
  assert.match(found[0].message, /spec\/rationales/);

  assert.deepEqual(await judge.run(long, async () => "actionable"), []);
});

test("a model naming no label passes the text", async () => {
  const judge = judgeOf(config, rules);
  const long =
    "This explains where the thing came from and what somebody once tried before now.";
  assert.deepEqual(await judge.run(long, async () => undefined), []);
  assert.deepEqual(
    await judge.run(long, async () => {
      throw new Error("no model");
    }),
    [],
  );
});

test("the judge is off when the config says so", () => {
  assert.equal(judgeOf({ judge: { enabled: false } }, rules).reads(), false);
});

test("the judge is off when no rule file stands", () => {
  assert.equal(judgeOf(config, []).reads(), false);
});

test("the judge reads every warmup write, then samples, and a breach resets it", () => {
  const judge = judgeOf(config, rules);
  for (let i = 0; i < config.judge.warmupWrites; i++) {
    assert.equal(judge.reads(), true, `write ${i + 1} is inside the warmup`);
    judge.sawClean();
  }
  assert.ok(
    [judge.reads(), judge.reads(), judge.reads()].includes(false),
    "it stops reading every write once the session proves itself",
  );

  judge.sawBreach();
  assert.equal(judge.reads(), true, "a breach puts it back to reading everything");
});

test("every brief carries the contract, and adding it twice changes nothing", () => {
  const once = withContract("# A brief\n\nDo the thing.\n");
  assert.ok(once.includes(CONTRACT_HEADING), "the contract lands");
  assert.ok(once.includes("./RUNME.sh work done"), "it names how to finish");
  assert.ok(once.includes("./RUNME.sh work release"), "it names how to stop early");
  assert.equal(withContract(once), once, "a second pass changes nothing");
});

test("the status moves through todo, held and done", () => {
  const brief = setStatus("# A brief\n", TODO);
  assert.equal(statusOf(brief), TODO);
  assert.equal(statusOf(setStatus(brief, HELD)), HELD);
  assert.equal(statusOf(setStatus(setStatus(brief, HELD), DONE)), DONE);
  assert.equal(statusOf("# No frontmatter\n"), "");
});

test("urgency reads from the frontmatter, and soon is the default", () => {
  assert.equal(urgencyOf("---\nstatus: todo\nurgency: now\n---\n"), "now");
  assert.equal(urgencyOf("---\nstatus: todo\nurgency: whenever\n---\n"), "whenever");
  assert.equal(urgencyOf("---\nstatus: todo\n---\n"), "soon");
  assert.equal(urgencyOf("---\nstatus: todo\nurgency: yesterday\n---\n"), "soon");
});

test("a dependency reads as a list or on one line, with the prefix dropped", () => {
  const block = "---\ndepends_on:\n  - one\n  - work/two\n---\n";
  assert.deepEqual(dependsOn(block), ["one", "two"]);
  assert.deepEqual(dependsOn("---\ndepends_on: a, work/b\n---\n"), ["a", "b"]);
  assert.deepEqual(dependsOn("---\nstatus: todo\n---\n"), []);
});

test("a branch waits only for one still standing at todo or held", () => {
  const brief = "---\ndepends_on:\n  - open\n  - busy\n  - ready\n  - gone\n---\n";
  const standing = new Map([
    ["work/open", TODO],
    ["work/busy", HELD],
    ["work/ready", DONE],
  ]);
  assert.deepEqual(waitingOn(brief, standing), ["open", "busy"]);
});

test("urgency orders now before soon before whenever", () => {
  const order = ["whenever", "now", "soon"].sort(
    (a, b) => URGENCY.indexOf(a) - URGENCY.indexOf(b),
  );
  assert.deepEqual(order, ["now", "soon", "whenever"]);
});

test("close reaches a work branch and a branch the platform cut", () => {
  assert.ok(MINE.test("work/fix-lsp"));
  assert.ok(MINE.test("claude/gracious-hawking-zepc6h"));
  assert.ok(!MINE.test("main"));
  assert.ok(!MINE.test("v4"));
  assert.ok(!MINE.test("se/claims"));
});

// The fixer, tested. Run with: ./RUNME.sh test
//
// The span rewriting is pure, and it stands here with the verb's reading of its
// flags. The cases that drive `vale fix --apply` over a real file stand in
// test/contract.
// [[spec/tickets/the-small-faults-land]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calmed,
  SHOUTED,
  sentenceCase,
} from "../../.claude/skills/level0/lib/shout.js";
import * as check from "../../src/scripts/cli-check.js";
import { fixFlags } from "../../src/scripts/cli-fix.js";
import { outside } from "../../src/scripts/cli-doors.js";

// The verb's lines and every spawn it asks for, held so a case reads both back and nothing runs. [[spec/tickets/the-small-faults-land]]
async function ranFix(argv, call = () => check.fix(argv)) {
  const lines = [];
  const spawned = [];
  const was = { log: console.log, error: console.error, run: outside.run };
  console.log = (...said) => lines.push(said.join(" "));
  console.error = (...said) => lines.push(said.join(" "));
  outside.run = (argv) => {
    spawned.push(argv.join(" "));
    return { exitCode: 0, stdout: "", stderr: "" };
  };
  try {
    return { code: await call(), said: lines.join("\n"), spawned };
  } finally {
    Object.assign(console, { log: was.log, error: was.error });
    outside.run = was.run;
  }
}

// [[spec/tickets/the-small-faults-land]]
test("fix refuses an unknown flag, and runs nothing over the tree", async () => {
  const { code, said, spawned } = await ranFix(["--apply-everything"]);
  assert.equal(code, 2, said);
  assert.match(said, /fix knows no flag --apply-everything/);
  assert.deepEqual(spawned, [], "nothing runs over the tree");
  assert.deepEqual(fixFlags(["--apply-everything", "src"]).unknown, [
    "--apply-everything",
  ]);
});

// The dispatch hands the verb its words whole, so a flag reaches the refusal. The command line loads here first, under the argv this case sets. [[spec/tickets/the-small-faults-land]]
test("the fix row in the command line hands the verb its flags, so an unknown one refuses", async () => {
  const was = process.argv;
  process.argv = [was[0], "/nowhere/cli.js", "fix", "--apply-everything"];
  try {
    const { verbs } = await import("../../src/scripts/cli.js");
    const { code, said, spawned } = await ranFix([], () => verbs.fix.run(["."]));
    assert.equal(code, 2, said);
    assert.match(said, /fix knows no flag --apply-everything/);
    assert.deepEqual(spawned, [], "nothing runs over the tree");
  } finally {
    process.argv = was;
  }
});

// [[spec/tickets/the-small-faults-land]]
test("fix answers --help with its usage", async () => {
  const { code, said, spawned } = await ranFix(["--help"]);
  assert.equal(code, 0, said);
  assert.match(said, /^Usage: \.\/RUNME\.sh fix \[path \.\.\.\]/m);
  assert.deepEqual(spawned, [], "nothing runs over the tree");
  assert.deepEqual(fixFlags([]).paths, ["."], "no path reads as the tree");
  assert.deepEqual(fixFlags(["src", "spec"]).paths, ["src", "spec"]);
});

test("sentence case keeps what stands before the first letter", () => {
  assert.equal(sentenceCase("NOTHING AT ALL, yes"), "Nothing at all, yes");
  assert.equal(sentenceCase("  SHOUTING HERE"), "  Shouting here");
  assert.equal(sentenceCase("1984 WAS LOUD"), "1984 Was loud");
  assert.equal(sentenceCase("...."), "....");
  assert.equal(sentenceCase(""), "");
});

test("a span that does not match what was reported is left alone", () => {
  const was = "# Notes\n\nSomething else entirely.\n";
  const stale = [{ rule: SHOUTED, line: 3, column: 1, said: "NOTHING AT ALL," }];
  assert.equal(calmed(was, stale), was);
});

test("two shouts on one line are both calmed", () => {
  const was = "AAAA BBBB CCCC, and DDDD EEEE FFFF, done\n";
  const rows = [
    { rule: SHOUTED, line: 1, column: 1, said: "AAAA BBBB CCCC," },
    { rule: SHOUTED, line: 1, column: 21, said: "DDDD EEEE FFFF," },
  ];
  assert.equal(calmed(was, rows), "Aaaa bbbb cccc, and Dddd eeee ffff, done\n");
});

test("a carriage return survives the calming", () => {
  const was = "# Notes\r\n\r\nNOTHING AT ALL WORKS, yes\r\n";
  const rows = [{ rule: SHOUTED, line: 3, column: 1, said: "NOTHING AT ALL WORKS," }];
  assert.equal(calmed(was, rows), "# Notes\r\n\r\nNothing at all works, yes\r\n");
});

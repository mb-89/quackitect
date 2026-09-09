// The fixer, tested. Run with: ./RUNME.sh test
//
// The span rewriting is pure, and it is what stands here. The cases that drive
// `vale fix --apply` over a real file stand in test/contract.

import assert from "node:assert/strict";
import { test } from "node:test";
import { calmed, SHOUTED, sentenceCase } from "../../.claude/skills/level0/lib/shout.js";

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

// The fixer, tested. Run with: ./RUNME.sh test
//
// The span rewriting is pure and needs nothing installed. The rule cases drive
// the real Vale over a real file, because `vale fix --apply` writes to disk and
// a fixer asserted against a stub is a fixer nobody has run.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { calmed, sentenceCase, SHOUTED } from "../lib/shout.js";
import { CONFIG, fromJson, valeBin } from "../lib/vale.js";

const root = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))));
const bin = join(root, valeBin(process.platform));
const haveVale = existsSync(bin);

const vale = (argv) =>
  spawnSync(bin, argv, { cwd: root, encoding: "utf8", shell: false });

function fixed(text, rounds = 1) {
  const where = join(mkdtempSync(join(tmpdir(), "level0-fix-")), "notes.md");
  writeFileSync(where, text, "utf8");
  for (let round = 0; round < rounds; round++) {
    vale(["fix", "--apply", `--config=${CONFIG}`, where]);
  }
  return readFileSync(where, "utf8");
}

function found(text) {
  const where = join(mkdtempSync(join(tmpdir(), "level0-lint-")), "notes.md");
  writeFileSync(where, text, "utf8");
  const ran = vale([`--config=${CONFIG}`, "--output=JSON", "--no-exit", where]);
  return fromJson(ran.stdout ?? "");
}

test("a contraction is written out, and the line keeps its case", { skip: !haveVale }, () => {
  const said = fixed("# Notes\n\nIt's here. don't go. WON'T stop. We've seen it.\n");
  assert.equal(said, "# Notes\n\nIt is here. do not go. Will not stop. We have seen it.\n");
});

test("every contraction in the swap map has a written form", { skip: !haveVale }, () => {
  const was =
    "# Notes\n\ncan't won't don't doesn't didn't isn't aren't wasn't hasn't\n" +
    "haven't it's that's there's you're they're we've I've we'll it'll\n";
  const said = fixed(was);
  assert.ok(!/n't|'s |'re|'ve|'ll/.test(said), said);
  assert.match(said, /cannot will not do not does not did not is not are not/);
  assert.match(said, /it is that is there is you are they are we have I have/);
});

test("a Latin short form is written out in English", { skip: !haveVale }, () => {
  const said = fixed("# Notes\n\nA duck, e.g. a mallard, i.e. loud. Viz. this. Cf. that.\n");
  assert.equal(
    said,
    "# Notes\n\nA duck, for example a mallard, that is loud. Namely this. Compare that.\n",
  );
});

test("etc. is reported and left standing, because its full stop needs a person", { skip: !haveVale }, () => {
  const was = "# Notes\n\nDucks, geese, etc. We saw them.\n";
  assert.equal(fixed(was), was);
  assert.ok(found(was).some((one) => one.rule === "EtCetera"));
});

test("a shouted lead is reported with no action, and the tree calms it", { skip: !haveVale }, () => {
  const was = "# Notes\n\nNOTHING AT ALL WORKS HERE, and then calm.\n";
  const shouts = found(was).filter((one) => one.rule === SHOUTED);
  assert.equal(shouts.length, 1);
  assert.equal(shouts[0].fixable, false);
  assert.equal(
    calmed(was, shouts),
    "# Notes\n\nNothing at all works here, and then calm.\n",
  );
});

test("calming a shout uncovers the contraction inside it", { skip: !haveVale }, () => {
  const was = "# Notes\n\nDON'T STOP AT ALL HERE, and then calm.\n";
  const now = fixed(calmed(was, found(was)));
  assert.equal(now, "# Notes\n\nDo not stop at all here, and then calm.\n");
});

test("a second run leaves the file byte for byte the same", { skip: !haveVale }, () => {
  const was = "# Notes\n\nIt's a duck, e.g. a mallard. They're loud, i.e. they quack.\n";
  assert.equal(fixed(was, 1), fixed(was, 4));
});

test("fenced code keeps every breach it carries", { skip: !haveVale }, () => {
  const was = "# Notes\n\n```\nIt's a duck, e.g. a mallard.\n```\n";
  assert.equal(fixed(was), was);
});

test("an exempted span keeps its breach", { skip: !haveVale }, () => {
  const was =
    "# Notes\n\n<!-- because: the fixer leaves this alone -->\n" +
    "<!-- vale VoiceVale.Contraction = NO -->\nIt's here.\n";
  assert.equal(fixed(was), was);
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
